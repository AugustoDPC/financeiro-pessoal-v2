-- Migration: adiciona display_name e avatar na tabela profiles
-- Execute no Supabase SQL Editor

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar text;

-- Habilita RLS se ainda não estiver habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove policies antigas se existirem
DROP POLICY IF EXISTS "profiles: leitura propria" ON public.profiles;
DROP POLICY IF EXISTS "profiles: escrita propria" ON public.profiles;

-- Usuário só acessa o próprio perfil
CREATE POLICY "profiles: leitura propria"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: escrita propria"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
