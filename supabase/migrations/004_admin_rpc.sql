-- ═══════════════════════════════════════════════════════════
-- Wonderclub — RPCs admin (security definer, bypass RLS)
-- L'accès est protégé côté app par le PIN dashboard.
-- ═══════════════════════════════════════════════════════════

-- ── Bloquer un créneau ou une journée entière ────────────────
create or replace function admin_block(
  p_date   date,
  p_time   text,          -- null = journée entière
  p_reason text default 'Bloqué'
) returns void
language plpgsql security definer as $$
begin
  insert into availability_blocks (date, time, reason)
  values (p_date, p_time, p_reason)
  on conflict (date, time) do update set reason = excluded.reason;
end;
$$;

-- ── Débloquer un créneau ou une journée ─────────────────────
create or replace function admin_unblock(
  p_date date,
  p_time text   -- null = journée entière
) returns void
language plpgsql security definer as $$
begin
  if p_time is null then
    delete from availability_blocks where date = p_date and time is null;
  else
    delete from availability_blocks where date = p_date and time = p_time;
  end if;
end;
$$;

-- ── Ajouter une pause (plage horaire) ───────────────────────
create or replace function admin_add_pause(
  p_date  date,
  p_start text,
  p_end   text
) returns void
language plpgsql security definer as $$
begin
  insert into availability_blocks (date, time, end_time, reason)
  values (p_date, p_start, p_end, 'Pause')
  on conflict (date, time) do update
    set end_time = excluded.end_time,
        reason   = 'Pause';
end;
$$;

-- ── Annuler un RDV ──────────────────────────────────────────
create or replace function admin_cancel_appointment(
  p_id uuid
) returns void
language plpgsql security definer as $$
begin
  update appointments set status = 'cancelled' where id = p_id;
end;
$$;
