-- ═══════════════════════════════════════════════════════════
-- Wonder Cut — Verrous de créneaux (5 min, idempotent)
-- ═══════════════════════════════════════════════════════════

-- ── Table ────────────────────────────────────────────────────
create table if not exists slot_locks (
  id           uuid default gen_random_uuid() primary key,
  date         date not null,
  time         text not null,
  session_id   text not null,
  locked_until timestamptz not null,
  created_at   timestamptz default now(),
  unique (date, time)
);

create index if not exists idx_slot_locks_date on slot_locks(date);

-- ── Row Level Security ───────────────────────────────────────
alter table slot_locks enable row level security;

drop policy if exists "public_read_locks"      on slot_locks;
drop policy if exists "service_role_all_locks" on slot_locks;

-- Lecture publique (pour exclure les créneaux verrouillés de la dispo)
create policy "public_read_locks" on slot_locks
  for select using (true);

-- Admin (service_role) : tout faire
create policy "service_role_all_locks" on slot_locks
  for all using (auth.role() = 'service_role');

-- ── RPC : acquérir un verrou atomiquement ────────────────────
-- Renvoie TRUE si le verrou a été obtenu, FALSE sinon.
create or replace function try_lock_slot(
  p_date             date,
  p_time             text,
  p_session_id       text,
  p_duration_minutes int default 5
) returns boolean
language plpgsql
security definer
as $$
declare
  v_owned boolean;
begin
  -- Supprimer les verrous expirés sur ce créneau
  delete from slot_locks
  where date = p_date and time = p_time and locked_until < now();

  -- Tenter l'insertion (no-op si un verrou actif existe déjà)
  insert into slot_locks (date, time, session_id, locked_until)
  values (
    p_date,
    p_time,
    p_session_id,
    now() + (p_duration_minutes || ' minutes')::interval
  )
  on conflict (date, time) do nothing;

  -- Vérifier si notre session possède maintenant le verrou
  select exists(
    select 1 from slot_locks
    where date = p_date and time = p_time and session_id = p_session_id
  ) into v_owned;

  return v_owned;
end;
$$;

-- ── RPC : libérer un verrou ──────────────────────────────────
-- Ne supprime que le verrou appartenant à la session appelante.
create or replace function release_slot_lock(
  p_date       date,
  p_time       text,
  p_session_id text
) returns void
language plpgsql
security definer
as $$
begin
  delete from slot_locks
  where date = p_date and time = p_time and session_id = p_session_id;
end;
$$;
