-- Migration: 001_initial_schema.sql
-- Create uuid-ossp extension if not exists
create extension if not exists "uuid-ossp";

-- Create scans table
create table if not exists public.scans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message_source text not null default 'other'
    check (message_source in ('email','sms','whatsapp','social_media','other')),
  original_text text not null,
  is_scam boolean not null,
  risk_score integer not null check (risk_score >= 0 and risk_score <= 100),
  risk_level text not null check (risk_level in ('low','medium','high')),
  scam_type text not null default 'other',
  red_flags text[] not null default '{}',
  explanation text not null,
  recommended_action text not null,
  created_at timestamptz not null default now()
);

-- Indexes for optimal performance
create index if not exists scans_user_id_idx on public.scans (user_id);
create index if not exists scans_created_at_idx on public.scans (created_at desc);

-- Enable Row Level Security (RLS)
alter table public.scans enable row level security;

-- Row Level Security (RLS) Policies
-- 1. Users can view their own scans
drop policy if exists "Users can view their own scans" on public.scans;
create policy "Users can view their own scans"
  on public.scans for select
  using (auth.uid() = user_id);

-- 2. Users can insert their own scans
drop policy if exists "Users can insert their own scans" on public.scans;
create policy "Users can insert their own scans"
  on public.scans for insert
  with check (auth.uid() = user_id);

-- 3. Users can delete their own scans
drop policy if exists "Users can delete their own scans" on public.scans;
create policy "Users can delete their own scans"
  on public.scans for delete
  using (auth.uid() = user_id);
