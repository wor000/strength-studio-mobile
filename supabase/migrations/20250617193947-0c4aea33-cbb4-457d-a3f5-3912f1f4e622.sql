
-- Atualizar exercícios para criar um superset entre "Rosca direta" e "Rosca martelo"
-- Assumindo que estes exercícios existem na tabela routine_exercises
UPDATE public.routine_exercises 
SET superset_group = 1, superset_order = 0
WHERE exercise_id IN (
  SELECT id FROM public.exercises 
  WHERE name ILIKE '%rosca direta%'
);

UPDATE public.routine_exercises 
SET superset_group = 1, superset_order = 1
WHERE exercise_id IN (
  SELECT id FROM public.exercises 
  WHERE name ILIKE '%rosca martelo%'
);

-- Caso queira criar outro superset com outros exercícios (exemplo: supino e crucifixo)
UPDATE public.routine_exercises 
SET superset_group = 2, superset_order = 0
WHERE exercise_id IN (
  SELECT id FROM public.exercises 
  WHERE name ILIKE '%supino%'
) AND superset_group IS NULL;

UPDATE public.routine_exercises 
SET superset_group = 2, superset_order = 1
WHERE exercise_id IN (
  SELECT id FROM public.exercises 
  WHERE name ILIKE '%crucifixo%'
) AND superset_group IS NULL;
