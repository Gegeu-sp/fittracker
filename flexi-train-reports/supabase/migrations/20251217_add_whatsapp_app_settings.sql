-- Adiciona coluna whatsapp na tabela alunos
alter table if exists public.alunos
  add column if not exists whatsapp text;

-- Cria tabela app_settings simples para guardar configurações da aplicação
create table if not exists public.app_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

