
-- Criar tabela para programas de treino mensais
CREATE TABLE public.workout_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  objective TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT 'manual' CHECK (created_by IN ('ai', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para workout_programs
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para workout_programs
CREATE POLICY "Users can view their own workout programs" 
  ON public.workout_programs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout programs" 
  ON public.workout_programs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout programs" 
  ON public.workout_programs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout programs" 
  ON public.workout_programs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Adicionar program_id à tabela routines
ALTER TABLE public.routines 
ADD COLUMN program_id UUID REFERENCES public.workout_programs(id) ON DELETE CASCADE;

-- Criar tabela para configurações do usuário
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  active_program_id UUID REFERENCES public.workout_programs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_settings
CREATE POLICY "Users can view their own settings" 
  ON public.user_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" 
  ON public.user_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON public.user_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Função para criar configurações padrão do usuário
CREATE OR REPLACE FUNCTION public.handle_user_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger para criar configurações quando um perfil é criado
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_settings();
