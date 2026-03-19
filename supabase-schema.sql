-- ── Wellness Compass – Supabase Schema ────────────────────────────────────────
-- Run this in Supabase SQL Editor to set up the database.

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── Users (anonymous sessions) ────────────────────────────────────────────────
create table if not exists users (
  id           uuid primary key default gen_random_uuid(),
  anonymous_id text unique not null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists users_anon_idx on users(anonymous_id);

-- ── Survey Results ────────────────────────────────────────────────────────────
create table if not exists survey_results (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid, -- Authenticated user ID
  anonymous_id  text not null,
  type          text not null check (type in ('oecd', 'perma')),
  oecd_scores   jsonb,
  perma_scores  jsonb,
  scores        jsonb,
  created_at    timestamptz default now()
);

create index if not exists survey_results_user_idx  on survey_results(user_id);

create index if not exists survey_results_anon_idx  on survey_results(anonymous_id);
create index if not exists survey_results_type_idx  on survey_results(type);
create index if not exists survey_results_date_idx  on survey_results(created_at desc);

-- ── Plans (7-day habit plans) ─────────────────────────────────────────────────
create table if not exists plans (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid, -- Authenticated user ID
  anonymous_id text not null,
  plan         jsonb not null,
  created_at   timestamptz default now()
);

create index if not exists plans_user_idx on plans(user_id);

create index if not exists plans_anon_idx on plans(anonymous_id);

-- ── Habits ────────────────────────────────────────────────────────────────────
create table if not exists habits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid, -- Authenticated user ID
  anonymous_id text not null,
  plan_id      uuid references plans(id) on delete cascade,
  day          text not null,
  habit_text   text not null,
  completed    boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists habits_user_idx on habits(user_id);

create index if not exists habits_anon_idx on habits(anonymous_id);
create index if not exists habits_plan_idx on habits(plan_id);

-- ── Messages (AI chat history) ────────────────────────────────────────────────
create table if not exists messages (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid, -- Authenticated user ID
  anonymous_id text not null,
  role         text not null check (role in ('user', 'assistant')),
  content      text not null,
  created_at   timestamptz default now()
);

create index if not exists messages_user_idx  on messages(user_id);

create index if not exists messages_anon_idx  on messages(anonymous_id);
create index if not exists messages_date_idx  on messages(created_at desc);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Enable RLS (optional but recommended)
alter table users          enable row level security;
alter table survey_results enable row level security;
alter table plans          enable row level security;
alter table habits         enable row level security;
alter table messages       enable row level security;

-- Allow anonymous inserts/reads via anon key from the backend
-- (Backend uses service key or anon key with the below policies)
create policy "anon_all" on users          for all using (true) with check (true);
create policy "anon_all" on survey_results for all using (true) with check (true);
create policy "anon_all" on plans          for all using (true) with check (true);
create policy "anon_all" on habits         for all using (true) with check (true);
create policy "anon_all" on messages       for all using (true) with check (true);
