-- ═══════════════════════════════════════════════════════════
-- Wonder Cut — Schéma Supabase
-- Exécuter dans : Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ── Table des rendez-vous ────────────────────────────────────
create table if not exists appointments (
  id                   uuid default gen_random_uuid() primary key,
  client_name          text not null,
  client_phone         text not null,
  service_id           text not null,
  service_title        text not null,
  service_price        integer,           -- null = sur devis
  service_price_label  text not null,
  date                 date not null,
  time                 text not null,     -- format "HH:MM"
  status               text not null default 'confirmed'
                         check (status in ('confirmed', 'cancelled', 'completed')),
  confirmation_number  text not null unique,
  notes                text,
  created_at           timestamptz default now()
);

-- ── Table des créneaux bloqués par le barbier ────────────────
create table if not exists availability_blocks (
  id         uuid default gen_random_uuid() primary key,
  date       date not null,
  time       text,                        -- null = journée entière bloquée
  reason     text default 'Indisponible',
  created_at timestamptz default now(),
  unique (date, time)
);

-- ── Index pour les requêtes fréquentes ──────────────────────
create index if not exists idx_appointments_date      on appointments(date);
create index if not exists idx_appointments_status    on appointments(status);
create index if not exists idx_blocks_date            on availability_blocks(date);

-- ── Row Level Security ───────────────────────────────────────
alter table appointments         enable row level security;
alter table availability_blocks  enable row level security;

-- Lecture publique des appointments (date+heure uniquement, pour la dispo)
create policy "public_read_appointments" on appointments
  for select using (status = 'confirmed');

-- Création publique d'appointments (réservation client)
create policy "public_insert_appointments" on appointments
  for insert with check (true);

-- Lecture publique des blocs (pour afficher les jours fermés)
create policy "public_read_blocks" on availability_blocks
  for select using (true);

-- Seul le service_role (fonctions Edge + admin) peut modifier
create policy "service_role_all_appointments" on appointments
  for all using (auth.role() = 'service_role');

create policy "service_role_all_blocks" on availability_blocks
  for all using (auth.role() = 'service_role');

-- ── Vue utile pour le dashboard barbier ─────────────────────
create or replace view upcoming_appointments as
  select
    id,
    client_name,
    client_phone,
    service_title,
    service_price_label,
    date,
    time,
    status,
    confirmation_number,
    created_at
  from appointments
  where date >= current_date
    and status = 'confirmed'
  order by date asc, time asc;

-- ── Fonction : créneaux disponibles pour une date ───────────
create or replace function get_available_slots(target_date date)
returns table(slot text) as $$
declare
  all_slots text[] := array[
    '09:00','09:30','10:00','10:30','11:00','11:30',
    '12:00','12:30','13:00','13:30','14:00','14:30',
    '15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30'
  ];
  s text;
begin
  -- Journée entière bloquée ?
  if exists (
    select 1 from availability_blocks
    where date = target_date and time is null
  ) then
    return;
  end if;

  foreach s in array all_slots loop
    -- Créneau non réservé et non bloqué
    if not exists (
      select 1 from appointments
      where date = target_date and time = s and status = 'confirmed'
    ) and not exists (
      select 1 from availability_blocks
      where date = target_date and time = s
    ) then
      return query select s;
    end if;
  end loop;
end;
$$ language plpgsql security definer;
