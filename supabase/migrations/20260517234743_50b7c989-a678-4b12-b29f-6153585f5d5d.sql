-- Sessões de intake
create table public.intake_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed','escalated')),
  chief_complaint text,
  extracted_data jsonb not null default '{}'::jsonb,
  recommendation text check (recommendation in ('autocuidado','teleconsulta','ubs','upa_pronto_socorro','samu_192')),
  urgency_level text check (urgency_level in ('baixa','media','alta','emergencia')),
  red_flags_triggered text[] not null default '{}',
  rationale text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index idx_intake_sessions_user on public.intake_sessions(user_id, created_at desc);

alter table public.intake_sessions enable row level security;

create policy "Users can view own sessions" on public.intake_sessions
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own sessions" on public.intake_sessions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own sessions" on public.intake_sessions
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger trg_intake_sessions_updated
  before update on public.intake_sessions
  for each row execute function public.set_updated_at();

-- Mensagens
create table public.intake_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.intake_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system','tool')),
  parts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_intake_messages_session on public.intake_messages(session_id, created_at asc);

alter table public.intake_messages enable row level security;

create policy "Users can view own messages" on public.intake_messages
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own messages" on public.intake_messages
  for insert to authenticated with check (auth.uid() = user_id);