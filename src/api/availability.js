import { supabase, SUPABASE_READY } from '../lib/supabase';
import { generateAvailableSlots } from '../utils/timeSlots';

const SALON = {
  name: 'Wonder Cut',
  address: 'Brie-Comte-Robert, 77170',
  description: 'Barbershop premium — réservation en ligne, confirmation par SMS.',
};

/* Tous les créneaux de base : 9h–19h, toutes les 30 min */
const BASE_SLOTS = [];
for (let h = 9; h < 19; h++) {
  BASE_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  BASE_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

function dayKey(d) { return d.toISOString().slice(0, 10); }
function isSunday(d) { return d.getDay() === 0; }

/* Génère les N prochains jours ouvrés (lun–sam) */
function workingDays(n = 10) {
  const days = [];
  let i = 0;
  while (days.length < n) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    if (!isSunday(d)) days.push(d);
    i++;
  }
  return days;
}

/* ── Mode SUPABASE (production) ─────────────────────────────── */
async function fetchFromSupabase() {
  const days = workingDays(10);
  const startDate = dayKey(days[0]);
  const endDate   = dayKey(days[days.length - 1]);

  /* Créneaux déjà réservés */
  const { data: booked } = await supabase
    .from('appointments')
    .select('date, time')
    .eq('status', 'confirmed')
    .gte('date', startDate)
    .lte('date', endDate);

  /* Créneaux bloqués par le barbier */
  const { data: blocks } = await supabase
    .from('availability_blocks')
    .select('date, time')
    .gte('date', startDate)
    .lte('date', endDate);

  const bookedSet = new Set((booked ?? []).map(b => `${b.date}|${b.time}`));
  const blockedFullDays = new Set(
    (blocks ?? []).filter(b => !b.time).map(b => b.date)
  );
  const blockedSlots = new Set(
    (blocks ?? []).filter(b => b.time).map(b => `${b.date}|${b.time}`)
  );

  const availability = {};
  for (const d of days) {
    const key = dayKey(d);

    if (blockedFullDays.has(key)) {
      availability[key] = []; // journée bloquée = complet
      continue;
    }

    const allSlots = d.toDateString() === new Date().toDateString()
      ? generateAvailableSlots(d) // filtre les slots passés pour aujourd'hui
      : [...BASE_SLOTS];

    availability[key] = allSlots.filter(
      slot => !bookedSet.has(`${key}|${slot}`) && !blockedSlots.has(`${key}|${slot}`)
    );
  }

  return { salon: SALON, availability };
}

/* ── Mode MOCK (démo sans Supabase) ────────────────────────── */
function day(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return dayKey(d);
}

function fetchMock() {
  return Promise.resolve({
    salon: SALON,
    availability: {
      [day(0)]:  generateAvailableSlots(new Date()),
      [day(1)]:  ['09:30', '11:00', '14:00', '16:30'],
      [day(2)]:  [],
      [day(3)]:  ['10:00', '12:30', '15:00', '17:00'],
      [day(4)]:  ['09:00', '11:30', '14:00', '16:00'],
      [day(5)]:  [],
      [day(6)]:  ['10:30', '13:00'],
      [day(7)]:  ['09:30', '11:00', '14:30', '16:00'],
      [day(8)]:  ['10:00', '12:00', '15:30'],
      [day(9)]:  ['09:00', '11:30', '13:00', '17:00'],
    },
  });
}

/* ── Export principal ───────────────────────────────────────── */
export async function fetchAvailability() {
  if (SUPABASE_READY) {
    try {
      return await fetchFromSupabase();
    } catch (e) {
      console.warn('Supabase unavailable, falling back to mock:', e);
      return fetchMock();
    }
  }
  return fetchMock();
}

/* ── Subscription temps réel ────────────────────────────────── */
export function subscribeToAvailability(callback) {
  if (!SUPABASE_READY) return () => {};

  const channel = supabase
    .channel('availability-live')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'appointments' },
      callback
    )
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'appointments' },
      callback
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'availability_blocks' },
      callback
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
