import { OPEN_DAYS } from '../utils/timeSlots';
import { supabase, SUPABASE_READY } from '../lib/supabase';

export const SALON = {
  name:        'Wonderclub',
  address:     '1 Rue de la Madeleine, 77170 Brie-Comte-Robert',
  description: 'Barbier indépendant certifié BP. Ouvert mer–sam, 10h–19h30. Réservation en ligne, confirmation par email et SMS.',
};

function dayKey(d) { return d.toISOString().slice(0, 10); }

function openDayRange(count = 14) {
  const days = [];
  let offset = 0;
  while (days.length < count) {
    const d = new Date();
    d.setDate(d.getDate() + offset++);
    if (OPEN_DAYS.has(d.getDay())) days.push(d);
  }
  return days;
}

/* ── Supabase : retourne les bookings bruts + blocs par date ─ */
async function fetchFromSupabase() {
  const days      = openDayRange(14);
  const startDate = dayKey(days[0]);
  const endDate   = dayKey(days[days.length - 1]);

  const [{ data: booked }, { data: blocks }, { data: locks }] = await Promise.all([
    supabase
      .from('appointments')
      .select('date, time, service_duration')
      .eq('status', 'confirmed')
      .gte('date', startDate)
      .lte('date', endDate),
    supabase
      .from('availability_blocks')
      .select('date, time, end_time')
      .gte('date', startDate)
      .lte('date', endDate),
    supabase
      .from('slot_locks')
      .select('date, time')
      .gte('locked_until', new Date().toISOString())
      .gte('date', startDate)
      .lte('date', endDate),
  ]);

  // Organise par date
  const dateBookings = {};
  const dateBlocks   = {};
  const fullDayOff   = new Set();

  for (const b of (booked ?? [])) {
    if (!dateBookings[b.date]) dateBookings[b.date] = [];
    dateBookings[b.date].push({ time: b.time, duration: b.service_duration ?? 30 });
  }

  // Verrous actifs traités comme des bookings de 30 min
  for (const l of (locks ?? [])) {
    if (!dateBookings[l.date]) dateBookings[l.date] = [];
    dateBookings[l.date].push({ time: l.time, duration: 30 });
  }

  for (const bl of (blocks ?? [])) {
    if (!bl.time) { fullDayOff.add(bl.date); continue; }
    if (!dateBlocks[bl.date]) dateBlocks[bl.date] = [];
    dateBlocks[bl.date].push({ time: bl.time, endTime: bl.end_time });
  }

  return { salon: SALON, days, dateBookings, dateBlocks, fullDayOff };
}

/* ── Mode mock ───────────────────────────────────────────────── */
function fetchMock() {
  const days = openDayRange(14);
  return Promise.resolve({
    salon: SALON,
    days,
    dateBookings: {},
    dateBlocks:   {},
    fullDayOff:   new Set(),
  });
}

export async function fetchAvailability() {
  if (SUPABASE_READY) {
    try { return await fetchFromSupabase(); }
    catch (e) {
      console.warn('[availability] Supabase error, fallback mock:', e.message);
      return fetchMock();
    }
  }
  return fetchMock();
}

export function subscribeToAvailability(callback) {
  if (!SUPABASE_READY) return () => {};

  const channel = supabase
    .channel('availability-live')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments'        }, callback)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'appointments'        }, callback)
    .on('postgres_changes', { event: '*',      schema: 'public', table: 'availability_blocks' }, callback)
    .on('postgres_changes', { event: '*',      schema: 'public', table: 'slot_locks'          }, callback)
    .subscribe();

  return () => supabase.removeChannel(channel);
}
