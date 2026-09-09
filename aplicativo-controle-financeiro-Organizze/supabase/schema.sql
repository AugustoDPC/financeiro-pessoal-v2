-- Tabela de perfis de usuario
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  first_name   text,
  last_name    text,
  display_name text,
  avatar       text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles: leitura propria"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: escrita propria"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Cria perfil automaticamente ao registrar novo usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (NEW.id, NEW.email)
  on conflict (id) do nothing;
  return NEW;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Tabela de contas
create table if not exists public.contas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  balance numeric not null default 0,
  color text
);

alter table public.contas enable row level security;

create policy "contas: acesso do proprio usuario"
  on public.contas
  for all
  using (auth.uid() = user_id);

-- Tabela de categorias
-- Nota: id é text (não uuid) para suportar IDs semânticos das categorias padrão
-- como "education", "food", "health", etc.
create table if not exists public.categorias (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  icon text not null,
  custom boolean not null default false
);

alter table public.categorias enable row level security;

create policy "categorias: acesso do proprio usuario"
  on public.categorias
  for all
  using (auth.uid() = user_id);

-- Tabela de transacoes
create table if not exists public.transacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric not null,
  date text not null,
  category_id text not null,
  account_id text not null,
  type text not null,
  is_recurring boolean default false,
  installment_total integer,
  installment_current integer,
  installment_original_amount numeric,
  installment_id text
);

alter table public.transacoes enable row level security;

create policy "transacoes: acesso do proprio usuario"
  on public.transacoes
  for all
  using (auth.uid() = user_id);

-- Tabela de receitas mensais
create table if not exists public.receitas_mensais (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  description text not null,
  tipo text not null default 'income',
  category_id text
);

alter table public.receitas_mensais enable row level security;

create policy "receitas_mensais: acesso do proprio usuario"
  on public.receitas_mensais
  for all
  using (auth.uid() = user_id);

-- Tabela de metas
create table if not exists public.metas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  tipo text not null,
  valor_alvo numeric not null,
  category_id text
);

alter table public.metas enable row level security;

create policy "metas: acesso do proprio usuario"
  on public.metas
  for all
  using (auth.uid() = user_id);

-- Função para excluir a conta do usuário autenticado e todos os seus dados
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;
