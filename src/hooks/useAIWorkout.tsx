import { useAIConversations } from './useAIConversations';
import { useAIWorkoutGenerator } from './useAIWorkoutGenerator';
import { useAIChat } from './useAIChat';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useGym } from '@/contexts/GymContext';
import { createAIWorkoutConversionService } from '@/services/aiWorkoutConversionService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useAIWorkout = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [processingWorkouts, setProcessingWorkouts] = useState<Set<string>>(new Set());
  const { addExercise, addRoutine, exercises, createProgram } = useGym();
  
  const {
    messages,
    setMessages,
    conversations,
    activeConversation,
    createNewConversation,
    loadConversations
  } = useAIConversations();

  const {
    generatedWorkouts,
    userProfile,
    loadGeneratedWorkouts,
    acceptWorkout: baseAcceptWorkout,
    rejectWorkout
  } = useAIWorkoutGenerator();

  const {
    isLoading,
    sendMessage: baseSendMessage
  } = useAIChat({
    messages,
    setMessages,
    activeConversation,
    userProfile,
    createNewConversation,
    loadConversations,
    loadGeneratedWorkouts
  });

  // Create the conversion service instance
  const conversionService = createAIWorkoutConversionService(
    addExercise,
    addRoutine,
    createProgram,
    exercises
  );

  const sendMessage = async (inputMessage: string, switchToWorkoutsTab?: () => void) => {
    return baseSendMessage(inputMessage, switchToWorkoutsTab);
  };

  const acceptWorkout = async (workoutId: string) => {
    // Verificar se já está processando este treino
    if (processingWorkouts.has(workoutId)) {
      console.log('Workout already being processed:', workoutId);
      return;
    }

    try {
      console.log('🚨 [ACCEPT WORKOUT] - Iniciando aceitação do treino:', workoutId);
      console.log('🚨 [ACCEPT WORKOUT] - Stack trace:', new Error().stack);
      
      setProcessingWorkouts(prev => new Set(prev).add(workoutId));

      const acceptedWorkout = generatedWorkouts.find(w => w.id === workoutId);
      if (!acceptedWorkout) {
        throw new Error('Treino não encontrado');
      }

      console.log('🚨 [ACCEPT WORKOUT] - Treino encontrado:', acceptedWorkout.workout_data?.name);
      console.log('Converting AI workout to routines...', acceptedWorkout);
      const result = await conversionService.convertAIWorkoutToRoutines(acceptedWorkout);
      
      console.log('Routines created, updating workout status...');
      await baseAcceptWorkout(workoutId);
      
      const routineCount = result.routines.length;
      console.log('🚨 [ACCEPT WORKOUT] - Treino aceito com sucesso. Rotinas criadas:', routineCount);
      
      toast({
        title: 'Sucesso!',
        description: `${routineCount} rotina${routineCount > 1 ? 's' : ''} criada${routineCount > 1 ? 's' : ''} com sucesso! Você pode editá-la${routineCount > 1 ? 's' : ''} na página de rotinas.`,
      });

      // Adiciona mensagem de encerramento no chat
      setMessages(prev => ([
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Plano adicionado ao app com sucesso! 💪\n\nBons treinos! Se precisar de dicas ou quiser ajustar seu plano, é só chamar aqui no chat. Estou sempre à disposição para te ajudar!',
          created_at: new Date().toISOString()
        }
      ]));
    } catch (error) {
      console.error('🚨 [ACCEPT WORKOUT] - Erro ao aceitar treino:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao aceitar treino e criar rotinas.',
        variant: 'destructive',
      });
    } finally {
      setProcessingWorkouts(prev => {
        const newSet = new Set(prev);
        newSet.delete(workoutId);
        return newSet;
      });
    }
  };

  const isWorkoutProcessing = (workoutId: string) => {
    return processingWorkouts.has(workoutId);
  };

  return {
    messages,
    isLoading,
    conversations,
    activeConversation,
    generatedWorkouts,
    createNewConversation,
    sendMessage,
    acceptWorkout,
    rejectWorkout,
    isWorkoutProcessing,
    loadGeneratedWorkouts
  };
};
