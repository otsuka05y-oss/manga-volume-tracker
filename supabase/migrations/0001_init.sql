create extension if not exists pgcrypto;

create table series (
  id                       uuid primary key default gen_random_uuid(),
  title                    text not null,
  author                   text,
  publisher                text,

  owned_volume             integer not null default 0,
  last_updated_at          timestamptz not null default now(),

  next_volume_number       integer,
  next_volume_release_date date,
  next_volume_isbn         text,
  release_date_source      text check (release_date_source in ('api', 'manual')),
  release_date_checked_at  timestamptz,

  notified_for_volume      integer,
  notified_at              timestamptz,

  created_at               timestamptz not null default now()
);

create index idx_series_title on series using gin (to_tsvector('simple', title));

create table push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);

-- The app only ever talks to Supabase from the server using the
-- service_role key, which bypasses RLS entirely. Enabling RLS here with no
-- policies just means anon/authenticated keys get denied by default if
-- they're ever used against these tables — pure defense in depth.
alter table series enable row level security;
alter table push_subscriptions enable row level security;
