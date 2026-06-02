-- ═══════════════════════════════════════════════════════════
-- Wonderclub — Créneaux dynamiques + pauses admin (idempotent)
-- ═══════════════════════════════════════════════════════════

-- ── Durée de prestation sur les RDV ─────────────────────────
alter table appointments
  add column if not exists service_duration integer default 30;

-- ── Heure de fin sur les blocs (pour les pauses) ────────────
alter table availability_blocks
  add column if not exists end_time text;

-- ── Index ────────────────────────────────────────────────────
create index if not exists idx_appointments_date_time
  on appointments(date, time);
