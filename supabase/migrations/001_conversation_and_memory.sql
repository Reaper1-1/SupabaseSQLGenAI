-- Better Man Project: Conversation and Memory Tables
-- This migration creates tables for agent conversation history and memory persistence

-- ========================================
-- 1. Conversation History Table
-- ========================================
-- Stores all conversations between users and agents
create table if not exists public.conversation_history (
  id uuid primary key default gen_random_uuid(),
  
  -- Use text for user_id to be more flexible (no FK constraint to auth.users)
  user_id text not null,
  
  -- Agent identifier
  agent_id text not null,
  
  -- Message content
  user_message text not null,
  agent_reply text not null,
  
  -- Optional debug and metadata
  agent_debug jsonb,                    -- Raw debug/traces from the agent (optional)
  metadata jsonb,                       -- Client info, platform, etc. (optional)
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists conversation_history_user_created_idx
  on public.conversation_history (user_id, created_at desc);

create index if not exists conversation_history_agent_idx
  on public.conversation_history (agent_id);

create index if not exists conversation_history_user_agent_idx
  on public.conversation_history (user_id, agent_id, created_at desc);

-- ========================================
-- 2. Agent Memory Table
-- ========================================
-- Per-user, per-agent rolling memory and last context
create table if not exists public.agent_memory (
  id uuid primary key default gen_random_uuid(),
  
  -- Use text for user_id to be more flexible
  user_id text not null,
  
  -- Agent identifier  
  agent_id text not null,
  
  -- Last interaction details
  last_message text,                           -- Last user message
  last_reply text,                             -- Last agent reply
  last_used_at timestamptz not null default now(),
  
  -- Memory and context storage
  memory_context jsonb,                        -- Structured context for that agent
  metadata jsonb,                              -- Any additional data
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Ensure one row per (user, agent) so upsert works cleanly
  unique (user_id, agent_id)
);

-- Indexes for performance
create index if not exists agent_memory_user_agent_idx
  on public.agent_memory (user_id, agent_id);

create index if not exists agent_memory_last_used_idx
  on public.agent_memory (last_used_at desc);

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

-- Create policies for conversation_history
-- Users can only see and insert their own conversations
create policy "Users can view own conversations"
  on public.conversation_history
  for select
  using (auth.uid()::text = user_id or user_id = auth.jwt()->>'email');

create policy "Users can insert own conversations"  
  on public.conversation_history
  for insert
  with check (auth.uid()::text = user_id or user_id = auth.jwt()->>'email');

-- Create policies for agent_memory
-- Users can only see and manage their own memory
create policy "Users can view own agent memory"
  on public.agent_memory
  for select
  using (auth.uid()::text = user_id or user_id = auth.jwt()->>'email');

create policy "Users can insert own agent memory"
  on public.agent_memory
  for insert
  with check (auth.uid()::text = user_id or user_id = auth.jwt()->>'email');

create policy "Users can update own agent memory"
  on public.agent_memory
  for update
  using (auth.uid()::text = user_id or user_id = auth.jwt()->>'email')
  with check (auth.uid()::text = user_id or user_id = auth.jwt()->>'email');

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