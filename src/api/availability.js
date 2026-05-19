import { generateAvailableSlots, OPEN_DAYS } from '../utils/timeSlots';
import { supabase, SUPABASE_READY } from '../lib/supabase';

export const SALON = {
  name:        'Wonder Cut',
  address:     '1 Rue de la Madeleine, 77170 Brie-Comte-Robert',
  description: 'Barbier certifié CAP Coiffure. Ouvert mer–sam, 9h–12h et 13h–19h. Réservation en ligne, confirmation par email.',
};

function dayKey(d) { return d.toISOString().slice(0, 10); }

/* Prochains jours ouverts (Mer–Sam) */
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

/* ── Mode SUPABASE (production) ──────────────────────────── */
async function fetchFromSupabase() {
  const days      = openDayRange(14);
  const startDate = dayKey(days[0]);
  const endDate   = dayKey(days[days.length - 1]);

  const [{ data: booked }, { data: blocks }] = await Promise.all([
    supabase
      .from('appointments')
      .select('date, time')
      .eq('status', 'confirmed')
      .gte('date', startDate)
      .lte('date', endDate),
    supabase
      .from('availability_blocks')
      .select('date, time')
      .gte('date', startDate)
      .lte('date', endDate),
  ]);

  const bookedSet      = new Set((booked  ?? []).map(b => `${b.date}|${b.time}`));
  const blockedFullDay = new Set((blocks  ?? []).filter(b => !b.time).map(b => b.date));
  const blockedSlots   = new Set((blocks  ?? []).filter(b =>  b.time).map(b => `${b.date}|${b.time}`));

  const availability = {};
  for (const d of days) {
    const key = dayKey(d);
    if (blockedFullDay.has(key)) { availability[key] = []; continue; }
    const allSlots = generateAvailableSlots(d);
    availability[key] = allSlots.filter(
      slot => !bookedSet.has(`${key}|${slot}`) && !blockedSlots.has(`${key}|${slot}`)
    );
  }

  return { salon: SALON, availability };
}

/* ── Mode MOCK (démo sans Supabase) ──────────────────────── */
function fetchMock() {
  const days = openDayRange(14);
  const availability = {};

  days.forEach((d, i) => {
    const key = dayKey(d);
    /* Jours 2 et 5 simulés complets */
    availability[key] = (i === 2 || i === 5) ? [] : generateAvailableSlots(d);
  });

  return Promise.resolve({ salon: SALON, availability });
}

/* ── Export principal ─────────────────────────────────────── */
export async function fetchAvailability() {
  if (SUPABASE_READY) {
    try {
      return await fetchFromSupabase();
    } catch (e) {
      console.warn('[availability] Supabase error, fallback mock:', e.message);
      return fetchMock();
    }
  }
  return fetchMock();
}

/* ── Subscription temps réel ─────────────────────────────── */
export function subscribeToAvailability(callback) {
  if (!SUPABASE_READY) return () => {};

  const channel = supabase
    .channel('availability-live')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments'        }, callback)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'appointments'        }, callback)
    .on('postgres_changes', { event: '*',      schema: 'public', table: 'availability_blocks' }, callback)
    .subscribe();

  return () => supabase.removeChannel(channel);
}
