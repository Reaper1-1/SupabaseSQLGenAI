-- Better Man Project: Conversation History and Agent Memory Tables
-- Production-ready schema with RLS policies and auth.users integration

-- ========================================
-- 1. Conversation History Table
-- ========================================
-- Stores all conversations between users and agents
create table if not exists public.conversation_history (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id text not null,

  user_message text not null,
  agent_reply text,
  agent_debug jsonb,
  metadata jsonb,

  session_id text,
  request_id text,

  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_convo_user_created
  on public.conversation_history (user_id, created_at desc);

-- ========================================
-- 2. Agent Memory Table
-- ========================================
-- Per-user, per-agent rolling memory and last context
create table if not exists public.agent_memory (
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id text not null,

  last_message text,
  last_reply text,
  last_used_at timestamptz default now(),
  memory_context jsonb,
  metadata jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (user_id, agent_id)
);

-- Indexes for performance
create index if not exists idx_agent_memory_user_agent
  on public.agent_memory (user_id, agent_id);

-- ========================================
-- 3. Updated_at Trigger Function
-- ========================================
-- Standard Postgres trigger for auto-updating updated_at column
-- (Avoiding moddatetime extension to prevent errors)

-- Create reusable trigger function (once per database)
create or replace function public.set_updated_at_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ========================================
-- 4. Apply Triggers to Tables
-- ========================================

-- Trigger for conversation_history
drop trigger if exists set_conversation_history_updated_at on public.conversation_history;
create trigger set_conversation_history_updated_at
  before update on public.conversation_history
  for each row
  execute function public.set_updated_at_timestamp();

-- Trigger for agent_memory
drop trigger if exists set_agent_memory_updated_at on public.agent_memory;
create trigger set_agent_memory_updated_at
  before update on public.agent_memory
  for each row
  execute function public.set_updated_at_timestamp();

-- ========================================
-- 5. Row Level Security (RLS)
-- ========================================
-- Enable RLS on both tables
alter table public.conversation_history enable row level security;
alter table public.agent_memory enable row level security;

-- RLS Policies for conversation_history
create policy "Users can read own conversation history"
  on public.conversation_history
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversation history"
  on public.conversation_history
  for insert
  with check (auth.uid() = user_id);

-- RLS Policies for agent_memory
create policy "Users read own memory"
  on public.agent_memory
  for select
  using (auth.uid() = user_id);

create policy "Users upsert own memory"
  on public.agent_memory
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own memory"
  on public.agent_memory
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ========================================
-- 6. Grant permissions for edge functions
-- ========================================
-- Edge functions use service role key, but granting permissions for completeness
grant all on public.conversation_history to service_role;
grant all on public.agent_memory to service_role;

-- Grant basic permissions to authenticated users
grant select, insert on public.conversation_history to authenticated;
grant select, insert, update on public.agent_memory to authenticated;

-- ========================================
-- Migration Complete
-- ========================================
-- This migration creates:
-- 1. conversation_history table for logging all agent interactions
-- 2. agent_memory table for persistent per-agent user context
-- 3. Standard Postgres triggers for updated_at (no moddatetime extension)
-- 4. Proper indexes for performance
-- 5. Row Level Security policies
-- 6. Appropriate permissions