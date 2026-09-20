-- Civic Governance & Clean Mysuru
-- Follow-through MVP
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'CITIZEN'
    check (role in ('CITIZEN', 'AUTHORITY', 'ADMIN')),
  created_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  citizen_id uuid references auth.users(id) on delete set null,
  issue_type text not null,
  title text not null check (char_length(trim(title)) >= 3),
  description text not null check (char_length(trim(description)) >= 10),
  location_lat double precision not null check (location_lat between -90 and 90),
  location_lng double precision not null check (location_lng between -180 and 180),
  location_text text not null,
  priority text not null default 'MEDIUM'
    check (priority in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status text not null default 'SUBMITTED'
    check (status in ('SUBMITTED', 'ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
  assigned_authority text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  risk_score numeric,
  risk_level text
);

create table if not exists public.status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  old_status text check (old_status is null or old_status in ('SUBMITTED', 'ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
  new_status text not null check (new_status in ('SUBMITTED', 'ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
  remarks text,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.risk_assessments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  score numeric not null check (score >= 0),
  level text not null,
  reasons jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists complaints_status_idx on public.complaints(status);
create index if not exists complaints_priority_idx on public.complaints(priority);
create index if not exists complaints_citizen_idx on public.complaints(citizen_id);
create index if not exists complaints_created_idx on public.complaints(created_at desc);
create index if not exists status_history_complaint_idx on public.status_history(complaint_id, created_at);
create index if not exists risk_assessments_complaint_idx on public.risk_assessments(complaint_id, created_at desc);

alter table public.users enable row level security;
alter table public.complaints enable row level security;
alter table public.status_history enable row level security;
alter table public.risk_assessments enable row level security;

-- Backend uses the service-role key, so these tables can remain locked down
-- to client-side access. Add narrower client policies later if direct reads
-- from the browser are required.
