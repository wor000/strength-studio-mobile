
-- Adicionar campos para suportar supersets na tabela routine_exercises
ALTER TABLE public.routine_exercises 
ADD COLUMN superset_group INTEGER,
ADD COLUMN superset_order INTEGER DEFAULT 0;

-- Criar índices para melhor performance
CREATE INDEX idx_routine_exercises_superset ON public.routine_exercises(routine_id, superset_group, superset_order);

-- Comentários para documentar os novos campos
COMMENT ON COLUMN public.routine_exercises.superset_group IS 'Identifica exercícios que fazem parte do mesmo superset. NULL para exercícios individuais.';
COMMENT ON COLUMN public.routine_exercises.superset_order IS 'Ordem do exercício dentro do superset (0 para exercícios individuais).';
