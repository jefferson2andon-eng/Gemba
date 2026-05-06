-- ============================================================
-- GEMBA — Script SQL para Supabase
-- Execute no SQL Editor do Supabase
-- ============================================================

-- NEGÓCIOS
create table if not exists businesses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  color       text default '#c9a84c',
  status      text default 'ativo' check (status in ('ativo','pausado','encerrado')),
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- BLOCOS DO CANVAS
create table if not exists canvas_blocks (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade not null,
  block_key   text not null check (block_key in ('problema','solucao','proposta','publico','concorrentes','receita','custos','metricas','canais')),
  content     text default '',
  updated_at  timestamptz default now(),
  unique(business_id, block_key)
);

-- PILARES (colunas de ideias)
create table if not exists pillars (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade not null,
  title       text not null,
  position    integer default 0,
  created_at  timestamptz default now()
);

-- FICHAS DOS PILARES
create table if not exists pillar_cards (
  id         uuid primary key default gen_random_uuid(),
  pillar_id  uuid references pillars(id) on delete cascade not null,
  content    text not null,
  position   integer default 0,
  created_at timestamptz default now()
);

-- TAREFAS 5W2H (KANBAN)
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade not null,
  -- 5W2H
  what        text not null,
  why         text,
  who         text,
  when_date   date,
  where_task  text,
  how         text,
  how_much    numeric default 0,
  -- Kanban
  status      text default 'todo' check (status in ('todo','doing','done')),
  position    integer default 0,
  -- Matriz
  impact      integer default 50 check (impact >= 0 and impact <= 100),
  effort      integer default 50 check (effort >= 0 and effort <= 100),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ANÁLISES IA (histórico)
create table if not exists ai_analyses (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade not null,
  content     text,
  model       text default 'claude-sonnet-4-5',
  created_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table businesses   enable row level security;
alter table canvas_blocks enable row level security;
alter table pillars      enable row level security;
alter table pillar_cards  enable row level security;
alter table tasks        enable row level security;
alter table ai_analyses  enable row level security;

-- Businesses
create policy "own businesses" on businesses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Canvas blocks
create policy "own canvas" on canvas_blocks for all using (
  business_id in (select id from businesses where user_id = auth.uid())
) with check (
  business_id in (select id from businesses where user_id = auth.uid())
);

-- Pillars
create policy "own pillars" on pillars for all using (
  business_id in (select id from businesses where user_id = auth.uid())
) with check (
  business_id in (select id from businesses where user_id = auth.uid())
);

-- Pillar cards
create policy "own pillar_cards" on pillar_cards for all using (
  pillar_id in (
    select p.id from pillars p
    join businesses b on p.business_id = b.id
    where b.user_id = auth.uid()
  )
);

-- Tasks
create policy "own tasks" on tasks for all using (
  business_id in (select id from businesses where user_id = auth.uid())
) with check (
  business_id in (select id from businesses where user_id = auth.uid())
);

-- AI analyses
create policy "own analyses" on ai_analyses for all using (
  business_id in (select id from businesses where user_id = auth.uid())
);

-- ============================================================
-- FUNÇÃO: updated_at automático
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_businesses_updated   before update on businesses   for each row execute function update_updated_at();
create trigger trg_canvas_updated       before update on canvas_blocks for each row execute function update_updated_at();
create trigger trg_tasks_updated        before update on tasks         for each row execute function update_updated_at();
