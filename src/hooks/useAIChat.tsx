import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface UseAIChatProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  activeConversation: string | null;
  userProfile: any;
  createNewConversation: () => Promise<void>;
  loadConversations: () => Promise<void>;
  loadGeneratedWorkouts: () => Promise<void>;
}

export const useAIChat = ({
  messages,
  setMessages,
  activeConversation,
  userProfile,
  createNewConversation,
  loadConversations,
  loadGeneratedWorkouts
}: UseAIChatProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (inputMessage: string, switchToWorkoutsTab?: () => void) => {
    if (!inputMessage.trim() || isLoading) {
      console.log('Cannot send message - empty message or loading');
      return;
    }

    let conversationId = activeConversation;
    if (!conversationId) {
      console.log('No active conversation, creating new one...');
      await createNewConversation();
      await new Promise(resolve => setTimeout(resolve, 100));
      conversationId = activeConversation;
      
      if (!conversationId) {
        console.error('Failed to create conversation');
        toast({
          title: 'Erro',
          description: 'Não foi possível criar uma nova conversa.',
          variant: 'destructive',
        });
        return;
      }
    }

    const userMessage = inputMessage.trim();
    console.log('Sending message:', userMessage, 'to conversation:', conversationId);
    setIsLoading(true);

    const tempUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => {
      console.log('Adding user message to state');
      return [...prev, tempUserMessage];
    });

    try {
      // Preparar histórico da conversa para a edge function
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      console.log('Calling edge function with:', {
        message: userMessage,
        conversationHistory: conversationHistory,
        userProfile
      });

      const { data, error } = await supabase.functions.invoke('ai-workout-generator', {
        body: {
          message: userMessage,
          conversationHistory: conversationHistory,
          userProfile
        }
      });

      console.log('Edge function response:', data, 'error:', error);

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Server error:', data.error);
        throw new Error(data.error);
      }

      if (data?.response) {
        console.log('AI response received:', data.response);
        
        // Salvar mensagem do usuário no banco
        console.log('💾 Saving user message to database...');
        const { error: userMessageError } = await supabase
          .from('ai_messages')
          .insert({
            conversation_id: conversationId,
            role: 'user',
            content: userMessage
          });

        if (userMessageError) {
          console.error('❌ Error saving user message:', userMessageError);
        } else {
          console.log('✅ User message saved successfully');
        }

        // Salvar resposta da IA no banco
        console.log('💾 Saving AI response to database...');
        const { error: aiMessageError } = await supabase
          .from('ai_messages')
          .insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: data.response
          });

        if (aiMessageError) {
          console.error('❌ Error saving AI message:', aiMessageError);
        } else {
          console.log('✅ AI message saved successfully');
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          created_at: new Date().toISOString()
        };
        setMessages(prev => {
          console.log('Adding AI message to state');
          return [...prev, aiMessage];
        });

        // Se um treino foi gerado e confirmado pelo usuário
        if (data.workoutGenerated) {
          console.log('🔥 [WORKOUT GENERATED] - Workout was confirmed and needs to be saved...');
          
          // Salvar o treino no banco de dados
          await saveWorkoutToDatabase(conversationId, messages, aiMessage.content);
          
          console.log('🔄 [WORKOUT GENERATED] - Calling loadGeneratedWorkouts after 1 second...');
          setTimeout(() => {
            console.log('🔄 [WORKOUT GENERATED] - Executing loadGeneratedWorkouts now');
            loadGeneratedWorkouts();
          }, 1000);
          
          toast({
            title: 'Treino Adicionado!',
            description: 'Direcionando para a aba "Treinos Gerados" onde você pode aceitar o treino.',
          });

          // Direcionar para aba de treinos gerados
          if (switchToWorkoutsTab) {
            console.log('🔄 [WORKOUT GENERATED] - Switching to workouts tab after 1.5 seconds...');
            setTimeout(() => {
              console.log('🔄 [WORKOUT GENERATED] - Executing switchToWorkoutsTab now');
              switchToWorkoutsTab();
            }, 1500);
          }
        }

        // Atualizar título da conversa se for a primeira mensagem
        if (messages.length === 0) {
          console.log('Updating conversation title...');
          await supabase
            .from('ai_conversations')
            .update({ 
              title: userMessage.substring(0, 50) + '...',
              updated_at: new Date().toISOString()
            })
            .eq('id', conversationId);
          loadConversations();
        } else {
          // Atualizar timestamp da conversa
          await supabase
            .from('ai_conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);
        }
      } else {
        console.error('No response from AI');
        throw new Error('Nenhuma resposta da IA');
      }
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      
      let errorMessage = 'Não foi possível enviar a mensagem. Tente novamente.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar treino confirmado no banco
  const saveWorkoutToDatabase = async (conversationId: string, conversationHistory: Message[], lastAIResponse: string) => {
    try {
      console.log('🔥 [SAVE WORKOUT] - Iniciando salvamento do treino confirmado');
      console.log('🔥 [SAVE WORKOUT] - Conversation ID:', conversationId);
      console.log('🔥 [SAVE WORKOUT] - History length:', conversationHistory.length);
      console.log('🔥 [SAVE WORKOUT] - Last AI response preview:', lastAIResponse.substring(0, 100) + '...');
      
      // Buscar o treino na última mensagem da IA que contém a pergunta
      let workoutContent = '';
      
      // A resposta atual é a confirmação, então precisamos buscar no histórico
      // Buscar no histórico (de trás para frente) a mensagem com treino
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        const message = conversationHistory[i];
        console.log(`🔍 [SAVE WORKOUT] - Checking message ${i}: ${message.role} - ${message.content.substring(0, 50)}...`);
        
        if (message.role === 'assistant' && message.content.includes('🔥 QUER QUE EU ADICIONE AO APP?')) {
          workoutContent = message.content;
          console.log('✅ [SAVE WORKOUT] - Found workout content in history at index', i);
          break;
        }
      }
      
      if (!workoutContent) {
        console.error('❌ [SAVE WORKOUT] - No workout content found to save');
        console.log('🔍 [SAVE WORKOUT] - Available messages:', conversationHistory.map((msg, i) => ({
          index: i,
          role: msg.role,
          hasQuestion: msg.content.includes('🔥 QUER QUE EU ADICIONE AO APP?'),
          preview: msg.content.substring(0, 100) + '...'
        })));
        return;
      }
      
      console.log('📄 [SAVE WORKOUT] - Workout content found, extracting data...');
      
      // Extrair dados do treino do conteúdo
      const workoutData = extractWorkoutFromContent(workoutContent);
      
      if (!workoutData) {
        console.error('❌ [SAVE WORKOUT] - Could not extract workout data');
        return;
      }
      
      console.log('📊 [SAVE WORKOUT] - Extracted workout data:', {
        name: workoutData.name,
        workouts: workoutData.routines.length,
        totalExercises: workoutData.exercises.length
      });
      
      // Buscar o user_id da conversa
      console.log('🔍 [SAVE WORKOUT] - Getting conversation user_id...');
      const { data: conversation, error: convError } = await supabase
        .from('ai_conversations')
        .select('user_id')
        .eq('id', conversationId)
        .single();

      if (convError) {
        console.error('❌ [SAVE WORKOUT] - Error getting conversation:', convError);
        return;
      }

      if (conversation) {
        console.log('💾 [SAVE WORKOUT] - Saving to database for user:', conversation.user_id);
        const { data: insertData, error: workoutError } = await supabase
          .from('ai_generated_workouts')
          .insert({
            user_id: conversation.user_id,
            conversation_id: conversationId,
            workout_data: workoutData,
            status: 'pending'
          })
          .select();

        if (workoutError) {
          console.error('❌ [SAVE WORKOUT] - Error saving workout:', workoutError);
        } else {
          console.log('✅ [SAVE WORKOUT] - Workout saved successfully!', insertData);
        }
      } else {
        console.error('❌ [SAVE WORKOUT] - Could not find conversation user_id');
      }
    } catch (error) {
      console.error('❌ [SAVE WORKOUT] - Exception in saveWorkoutToDatabase:', error);
    }
  };

  // Função para extrair dados do treino do conteúdo da mensagem
  const extractWorkoutFromContent = (content: string) => {
    try {
      console.log('🔍 Extracting workout from content...');
      console.log('📄 Content preview:', content.substring(0, 200) + '...');
      
      // REMOVER OBSERVAÇÕES COMPLETAMENTE do conteúdo
      let cleanContent = content;
      
      // Remover seção de observações (várias formas possíveis)
      cleanContent = cleanContent.replace(/\n\s*Observações:.*$/gms, '');
      cleanContent = cleanContent.replace(/\n\s*\*\*Observações:\*\*.*$/gms, '');
      cleanContent = cleanContent.replace(/\n\s*Dicas:.*$/gms, '');
      cleanContent = cleanContent.replace(/\n\s*\*\*Dicas:\*\*.*$/gms, '');
      cleanContent = cleanContent.replace(/\n\s*Notas:.*$/gms, '');
      cleanContent = cleanContent.replace(/\n\s*\*\*Notas:\*\*.*$/gms, '');
      
      // Remover qualquer texto após a pergunta final
      const questionIndex = cleanContent.indexOf('🔥 QUER QUE EU ADICIONE AO APP?');
      if (questionIndex !== -1) {
        const afterQuestion = cleanContent.substring(questionIndex);
        const endOfQuestion = afterQuestion.indexOf('alteração primeiro.');
        if (endOfQuestion !== -1) {
          cleanContent = cleanContent.substring(0, questionIndex + endOfQuestion + 'alteração primeiro.'.length);
        }
      }
      
      console.log('🧹 Content cleaned, processing...');
      console.log('📄 Clean content preview:', cleanContent.substring(0, 200) + '...');
      
      // Extrair nome do treino
      const nameMatch = cleanContent.match(/\*\*Nome do Treino:\*\*\s*(.+)/);
      const name = nameMatch ? nameMatch[1].trim() : 'Treino Personalizado';
      
      // Extrair objetivo
      const objectiveMatch = cleanContent.match(/\*\*Objetivo:\*\*\s*(.+)/);
      const objective = objectiveMatch ? objectiveMatch[1].trim() : '';
      
      // Extrair duração
      const durationMatch = cleanContent.match(/\*\*Duração:\*\*\s*(.+)/);
      const durationText = durationMatch ? durationMatch[1].trim() : '45 minutos por sessão';
      const estimatedDuration = parseInt(durationText.match(/\d+/)?.[0] || '45');
      
      console.log('📝 Basic info extracted:', { name, objective, estimatedDuration });
      
      // Mapear grupo muscular do nome do exercício
      const mapMuscleGroupFromExerciseName = (exerciseName: string): string => {
        const name = exerciseName.toLowerCase();
        
        if (name.includes('flexão') || name.includes('supino') || name.includes('peito')) {
          return 'Peito';
        }
        if (name.includes('agachamento') || name.includes('leg press') || name.includes('quadríceps') || name.includes('perna')) {
          return 'Pernas';
        }
        if (name.includes('bíceps') || name.includes('rosca')) {
          return 'Bíceps';
        }
        if (name.includes('tríceps') || name.includes('mergulho')) {
          return 'Tríceps';
        }
        if (name.includes('abdomen') || name.includes('prancha') || name.includes('abdominal')) {
          return 'Abdômen';
        }
        if (name.includes('costas') || name.includes('remada') || name.includes('puxada')) {
          return 'Costas';
        }
        if (name.includes('ombro') || name.includes('elevação') || name.includes('desenvolvimento')) {
          return 'Ombros';
        }
        if (name.includes('panturrilha')) {
          return 'Panturrilha';
        }
        if (name.includes('burpee') || name.includes('cardio') || name.includes('corrida')) {
          return 'Cardio';
        }
        
        return 'Geral';
      };

      // Determinar tipo do exercício
      const determineExerciseType = (exerciseName: string): 'strength' | 'cardio' | 'flexibility' => {
        const name = exerciseName.toLowerCase();
        
        if (name.includes('burpee') || name.includes('jumping') || name.includes('mountain climber') || 
            name.includes('cardio') || name.includes('corrida') || name.includes('salto')) {
          return 'cardio';
        }
        
        if (name.includes('alongamento') || name.includes('yoga') || name.includes('flexibilidade')) {
          return 'flexibility';
        }
        
        return 'strength';
      };
      
      // Extrair treinos (dias) com exercícios
      const routines = [];
      const allExercises = []; // Para compatibilidade com formato antigo
      
      // Dividir o conteúdo LIMPO por treinos
      const workoutSections = cleanContent.split(/\*\*Treino \d+/);
      console.log('📂 Found workout sections:', workoutSections.length - 1); // -1 porque o primeiro é antes do primeiro treino
      
      for (let i = 1; i < workoutSections.length; i++) {
        const section = workoutSections[i];
        console.log(`\n🔍 Processing section ${i}:`);
        console.log('📄 Section content:', section.substring(0, 200) + '...');
        
        // Extrair informações do cabeçalho do treino
        const headerMatch = section.match(/^[^:]*:\s*(.+)/);
        if (!headerMatch) {
          console.log('❌ No header match found for section', i);
          continue;
        }
        
        const headerInfo = headerMatch[1].trim();
        
        // Limpar asteriscos do headerInfo
        const cleanHeaderInfo = headerInfo.replace(/\*\*/g, '').trim();
        
        // Mapear dias da semana automaticamente
        const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        
        // Verificar se o headerInfo contém um dia da semana
        let day = `Dia ${i}`;
        let focus = cleanHeaderInfo;
        
        // Procurar por dia da semana no headerInfo
        const foundDay = daysOfWeek.find(dayName => 
          cleanHeaderInfo.toLowerCase().includes(dayName.toLowerCase())
        );
        
        if (foundDay) {
          // Se encontrou um dia da semana, usar ele
          day = foundDay;
          // Remover o dia do foco
          focus = cleanHeaderInfo.replace(new RegExp(foundDay, 'gi'), '').replace(/^[:\s-]+|[:\s-]+$/g, '').trim();
        } else {
          // Se não encontrou dia da semana, atribuir automaticamente
          day = daysOfWeek[(i - 1) % 7]; // Começar na segunda-feira
          focus = cleanHeaderInfo;
        }
        
        // Se o foco estiver vazio, usar um padrão
        if (!focus) {
          focus = `Treino ${i}`;
        }
        
        console.log('📅 Day info:', { day, focus, cleanHeaderInfo, treino: i });
        
        // Extrair exercícios desta seção
        const exercises = [];
        const lines = section.split('\n');
        console.log('📝 Processing', lines.length, 'lines');
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          const line = lines[lineIndex];
          const trimmedLine = line.trim();
          
          console.log(`Line ${lineIndex}: "${trimmedLine}"`);
          
          // Pular linhas vazias, cabeçalhos e observações (extra proteção)
          if (!trimmedLine || 
              trimmedLine.startsWith('**') || 
              trimmedLine.startsWith('Observações:') ||
              trimmedLine.startsWith('Dicas:') ||
              trimmedLine.startsWith('Notas:') ||
              trimmedLine.startsWith('🔥') ||
              trimmedLine.startsWith('Responda') ||
              trimmedLine.toLowerCase().includes('importante manter') ||
              trimmedLine.toLowerCase().includes('não se esqueça') ||
              trimmedLine.toLowerCase().includes('escute seu corpo')) {
            console.log(`  ⏭️ Skipping line (empty or header/footer/observation)`);
            continue;
          }
          
          // Tentar extrair exercício com formato: Nome - séries x reps - tempo
          const exerciseMatch = trimmedLine.match(/^(.+?)\s*-\s*(\d+)x(\d+)\s*-\s*(\d+)s?/);
          if (exerciseMatch) {
            const [, exerciseName, sets, reps, rest] = exerciseMatch;
            const exercise = {
              name: exerciseName.trim(),
              sets: parseInt(sets),
              reps: parseInt(reps),
              restTime: parseInt(rest), // Mudança: 'rest' -> 'restTime'
              weight: null,
              muscleGroup: mapMuscleGroupFromExerciseName(exerciseName.trim()),
              type: determineExerciseType(exerciseName.trim()) as 'strength' | 'cardio' | 'flexibility',
              instructions: `${sets} séries de ${reps} repetições. Descanso: ${rest}s.`,
              superset_group: null,
              superset_order: 0
            };
            exercises.push(exercise);
            allExercises.push(exercise); // Adicionar também ao array geral
            console.log(`  ✅ Exercise extracted:`, exercise);
          } else {
            console.log(`  ❌ No exercise match for: "${trimmedLine}"`);
          }
        }
        
        console.log(`📋 Day ${i} (${day}): ${exercises.length} exercises extracted`);
        
        // Criar rotina com nome limpo - usar apenas "Treino X"
        const routineName = `Treino ${i}`;
        
        routines.push({
          name: routineName, // Nome limpo da rotina
          day: day, // Dia limpo
          focus: focus, // Foco limpo
          exercises: exercises
        });
      }
      
      const result = {
        name,
        objective,
        estimatedDuration,
        routines, // Formato correto esperado pelo AIWorkoutCard
        exercises: allExercises, // Compatibilidade com formato antigo
        notes: '', // Campo notes vazio - SEM observações
        fullContent: cleanContent // Conteúdo LIMPO sem observações
      };
      
      console.log('✅ Workout extraction complete:', {
        name: result.name,
        routines: result.routines.length,
        totalExercises: result.exercises.length
      });
      
      return result;
    } catch (error) {
      console.error('❌ Error extracting workout data:', error);
      return null;
    }
  };

  return {
    isLoading,
    sendMessage
  };
};
