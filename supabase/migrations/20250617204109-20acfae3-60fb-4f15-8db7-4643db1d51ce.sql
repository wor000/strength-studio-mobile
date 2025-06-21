
-- Adicionar coluna exercise_data na tabela workout_sessions para armazenar dados editáveis dos exercícios
ALTER TABLE public.workout_sessions 
ADD COLUMN exercise_data jsonb DEFAULT '{}';

-- Criar índice para melhorar performance nas consultas dos dados dos exercícios
CREATE INDEX idx_workout_sessions_exercise_data ON public.workout_sessions USING gin (exercise_data);
