-- Supabase Database Schema
-- Users table is managed by Supabase Auth, no creation needed

-- ============================================================================
-- Projects Table
-- ============================================================================
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  model_type text not null check (model_type in ('qwen2.5-1.5b', 'qwen2.5-3b', 'gemma-3n-e2b', 'gemma-3n-e4b')),
  genre text not null,
  description text default '',
  status text not null default 'created' check (status in ('created', 'training', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  last_action_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

-- Enable RLS for projects
alter table projects enable row level security;

-- RLS Policy: Users can see only their own projects
create policy "Users can view own projects"
  on projects for select
  using (auth.uid() = user_id);

-- RLS Policy: Users can insert only their own projects
create policy "Users can insert own projects"
  on projects for insert
  with check (auth.uid() = user_id);

-- RLS Policy: Users can update only their own projects
create policy "Users can update own projects"
  on projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS Policy: Users can delete only their own projects
create policy "Users can delete own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- Trigger: Enforce max 5 projects per user
create or replace function check_project_limit()
returns trigger as $$
begin
  if (select count(*) from projects where user_id = new.user_id) >= 5 then
    raise exception 'Maximum 5 projects per user exceeded';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists enforce_project_limit_trigger on projects;
create trigger enforce_project_limit_trigger
  before insert on projects
  for each row
  execute function check_project_limit();

-- Indexes for projects
create index if not exists idx_projects_user_id on projects(user_id);
create index if not exists idx_projects_expires_at on projects(expires_at);
create index if not exists idx_projects_created_at on projects(created_at);

-- ============================================================================
-- Training Jobs Table
-- ============================================================================
create table if not exists training_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'running', 'done', 'failed')),
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

-- Enable RLS for training_jobs
alter table training_jobs enable row level security;

-- RLS Policy: Users can see training jobs for their projects only
create policy "Users can view their project training jobs"
  on training_jobs for select
  using (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert training jobs for their projects
create policy "Users can insert training jobs for their projects"
  on training_jobs for insert
  with check (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update training jobs for their projects
create policy "Users can update training jobs for their projects"
  on training_jobs for update
  using (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  )
  with check (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete training jobs for their projects
create policy "Users can delete training jobs for their projects"
  on training_jobs for delete
  using (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );

-- Indexes for training_jobs
create index if not exists idx_training_jobs_project_id on training_jobs(project_id);
create index if not exists idx_training_jobs_status on training_jobs(status);
create index if not exists idx_training_jobs_created_at on training_jobs(created_at);

-- ============================================================================
-- Data Sources Table
-- ============================================================================
create table if not exists data_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  type text not null check (type in ('url', 'file')),
  name text not null,
  content text,
  char_count int not null default 0,
  storage_path text,
  created_at timestamptz not null default now()
);

-- Enable RLS for data_sources
alter table data_sources enable row level security;

-- RLS Policy: Users can view data sources for their projects
create policy "Users can view their project data sources"
  on data_sources for select
  using (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert data sources for their projects
create policy "Users can insert data sources for their projects"
  on data_sources for insert
  with check (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update data sources for their projects
create policy "Users can update data sources for their projects"
  on data_sources for update
  using (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  )
  with check (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete data sources for their projects
create policy "Users can delete data sources for their projects"
  on data_sources for delete
  using (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );

-- Indexes for data_sources
create index if not exists idx_data_sources_project_id on data_sources(project_id);
create index if not exists idx_data_sources_created_at on data_sources(created_at);

-- ============================================================================
-- LoRA Artifacts Table
-- ============================================================================
create table if not exists lora_artifacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  version int not null default 1,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS for lora_artifacts
alter table lora_artifacts enable row level security;

-- RLS Policy: Users can view LoRA artifacts for their projects
create policy "Users can view their project lora artifacts"
  on lora_artifacts for select
  using (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert LoRA artifacts for their projects
create policy "Users can insert lora artifacts for their projects"
  on lora_artifacts for insert
  with check (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete LoRA artifacts for their projects
create policy "Users can delete lora artifacts for their projects"
  on lora_artifacts for delete
  using (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );

-- Indexes for lora_artifacts
create index if not exists idx_lora_artifacts_project_id on lora_artifacts(project_id);
create index if not exists idx_lora_artifacts_created_at on lora_artifacts(created_at);

-- ============================================================================
-- Payments Table
-- ============================================================================
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  project_id uuid not null references projects(id),
  job_id uuid references training_jobs(id),
  amount int not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_id text,
  created_at timestamptz not null default now()
);

-- Enable RLS for payments
alter table payments enable row level security;

-- RLS Policy: Users can view their own payments
create policy "Users can view own payments"
  on payments for select
  using (auth.uid() = user_id);

-- RLS Policy: Users can insert their own payments
create policy "Users can insert own payments"
  on payments for insert
  with check (auth.uid() = user_id);

-- RLS Policy: Users can update their own payments
create policy "Users can update own payments"
  on payments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes for payments
create index if not exists idx_payments_user_id on payments(user_id);
create index if not exists idx_payments_project_id on payments(project_id);
create index if not exists idx_payments_stripe_payment_id on payments(stripe_payment_id);
create index if not exists idx_payments_created_at on payments(created_at);

-- ============================================================================
-- Auto-Deletion via pg_cron
-- ============================================================================
-- Note: This requires pg_cron extension to be enabled on your Supabase project
-- If pg_cron is not available, you can use Supabase Edge Functions or a scheduled job service

-- Enable pg_cron extension (run this separately or via Supabase dashboard)
-- create extension if not exists pg_cron;

-- Schedule daily cleanup at 02:00 UTC
-- This will delete projects that have expired (older than 30 days)
-- To enable, uncomment the following and ensure pg_cron is enabled:
/*
select cron.schedule(
  'delete-expired-projects',
  '0 2 * * *',  -- daily at 02:00 UTC
  $$
  delete from projects
  where expires_at < now()
  $$
);
*/

-- Alternative: Manual cleanup function
-- You can call this function from your application or scheduled job service
create or replace function cleanup_expired_projects()
returns table(deleted_count int) as $$
declare
  v_deleted_count int;
begin
  delete from projects
  where expires_at < now();

  get diagnostics v_deleted_count = row_count;

  return query select v_deleted_count;
end;
$$ language plpgsql;

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Get user project count
create or replace function get_user_project_count(p_user_id uuid)
returns int as $$
  select count(*)::int from projects where user_id = p_user_id;
$$ language sql stable;

-- Get project with training job status
create or replace function get_project_with_status(p_project_id uuid)
returns table (
  project_id uuid,
  project_name text,
  status text,
  last_job_status text,
  last_job_created_at timestamptz
) as $$
  select
    p.id,
    p.name,
    p.status,
    tj.status,
    tj.created_at
  from projects p
  left join training_jobs tj on p.id = tj.project_id
  where p.id = p_project_id
  order by tj.created_at desc
  limit 1;
$$ language sql stable;

-- ============================================================================
-- Grants (if using separate service role)
-- ============================================================================
-- Uncomment if you have a separate service role that needs access:
-- grant all privileges on all tables in schema public to service_role;
-- grant all privileges on all functions in schema public to service_role;
