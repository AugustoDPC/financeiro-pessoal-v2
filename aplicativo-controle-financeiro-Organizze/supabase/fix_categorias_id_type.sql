-- Migration: corrige o tipo da coluna id em categorias de uuid para text
-- Execute este SQL no Supabase SQL Editor caso a tabela já tenha sido criada com uuid

ALTER TABLE public.categorias DROP CONSTRAINT IF EXISTS categorias_pkey;
ALTER TABLE public.categorias ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.categorias ADD PRIMARY KEY (id);
