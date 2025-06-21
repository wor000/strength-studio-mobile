
-- Adicionar campos de perfil à tabela profiles
ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN objective TEXT;
ALTER TABLE public.profiles ADD COLUMN bio TEXT;
ALTER TABLE public.profiles ADD COLUMN profile_photo TEXT;
ALTER TABLE public.profiles ADD COLUMN birth_date DATE;
ALTER TABLE public.profiles ADD COLUMN phone TEXT;
ALTER TABLE public.profiles ADD COLUMN address TEXT;

-- Atualizar a função handle_new_user para incluir o nome completo dos metadados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;
