import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.28.0'
import { generatePrompt } from './prompt-generator.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar variáveis de ambiente (reduzido logs)
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    
    const { message, conversationHistory = [], userProfile } = await req.json()

    const openai = new OpenAI({
      apiKey: openaiKey,
    })

    // LÓGICA ULTRA-SIMPLIFICADA
    let workoutGenerated = false
    let finalAiResponse = ''

    // Pegar a última mensagem da IA para verificar se termina com a pergunta
    const lastAIMessage = conversationHistory
      .filter(msg => msg.role === 'assistant')
      .pop()

    const userSaidYes = message.toLowerCase().trim() === 'sim'
    const lastResponseHasQuestion = lastAIMessage?.content?.includes('🔥 QUER QUE EU ADICIONE AO APP?')

    if (userSaidYes && lastResponseHasQuestion) {
      // Usuário confirmou - resposta curta e otimizada
      workoutGenerated = true
      finalAiResponse = "✅ Treino adicionado! Vá para 'Treinos Gerados' para aceitar. 💪"
    } else {
      // Conversa normal - IA processa com limite de tokens reduzido
      const prompt = generatePrompt(message, conversationHistory, userProfile)
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Modelo mais eficiente
        messages: [
          {
            role: 'system',
            content: prompt
          },
          // Limitar histórico para reduzir payload
          ...conversationHistory.slice(-6), // Apenas últimas 6 mensagens
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.1,
        max_tokens: 1000, // Reduzido de 2000 para 1000
        stream: false
      })

      finalAiResponse = response.choices[0].message.content || 'Erro na resposta.'
    }

    // Resposta mínima para reduzir egress
    return new Response(
      JSON.stringify({
        response: finalAiResponse,
        workoutGenerated
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    // Log mínimo em produção
    console.error('AI Error:', error.message)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno',
        response: 'Erro temporário. Tente novamente.',
        workoutGenerated: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
