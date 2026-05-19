-- ═══════════════════════════════════════════════════════════
-- Wonder Cut — Schéma Supabase (idempotent, safe à relancer)
-- ═══════════════════════════════════════════════════════════

-- ── Tables ──────────────────────────────────────────────────
create table if not exists appointments (
  id                   uuid default gen_random_uuid() primary key,
  client_name          text not null,
  client_phone         text not null,
  service_id           text not null,
  service_title        text not null,
  service_price        integer,
  service_price_label  text not null,
  date                 date not null,
  time                 text not null,
  status               text not null default 'confirmed'
                         check (status in ('confirmed', 'cancelled', 'completed')),
  confirmation_number  text not null unique,
  notes                text,
  created_at           timestamptz default now()
);

create table if not exists availability_blocks (
  id         uuid default gen_random_uuid() primary key,
  date       date not null,
  time       text,
  reason     text default 'Indisponible',
  created_at timestamptz default now(),
  unique (date, time)
);

-- ── Index ────────────────────────────────────────────────────
create index if not exists idx_appointments_date   on appointments(date);
create index if not exists idx_appointments_status on appointments(status);
create index if not exists idx_blocks_date         on availability_blocks(date);

-- ── Row Level Security ───────────────────────────────────────
alter table appointments        enable row level security;
alter table availability_blocks enable row level security;

-- Supprimer les politiques existantes avant de les recréer
drop policy if exists "public_read_appointments"      on appointments;
drop policy if exists "public_insert_appointments"    on appointments;
drop policy if exists "public_read_blocks"            on availability_blocks;
drop policy if exists "service_role_all_appointments" on appointments;
drop policy if exists "service_role_all_blocks"       on availability_blocks;

-- Clients : lecture des RDV confirmés (pour vérifier dispo)
create policy "public_read_appointments" on appointments
  for select using (status = 'confirmed');

-- Clients : créer un RDV
create policy "public_insert_appointments" on appointments
  for insert with check (true);

-- Clients : lire les blocs (jours/créneaux fermés)
create policy "public_read_blocks" on availability_blocks
  for select using (true);

-- Admin (service_role) : tout faire
create policy "service_role_all_appointments" on appointments
  for all using (auth.role() = 'service_role');

create policy "service_role_all_blocks" on availability_blocks
  for all using (auth.role() = 'service_role');

-- ── Vue dashboard barbier ────────────────────────────────────
create or replace view upcoming_appointments as
  select id, client_name, client_phone, service_title,
         service_price_label, date, time, status,
         confirmation_number, created_at
  from appointments
  where date >= current_date and status = 'confirmed'
  order by date, time;
