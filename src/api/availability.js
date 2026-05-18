import { generateAvailableSlots, OPEN_DAYS } from '../utils/timeSlots';

const SALON = {
  name:        'Wonder Cut',
  address:     '1 Rue de la Madeleine, 77170 Brie-Comte-Robert',
  description: 'Barbier certifié CAP Coiffure. Ouvert mer–sam, 9h–12h et 13h–19h. Réservation en ligne, confirmation par SMS.',
};

function dayKey(d) { return d.toISOString().slice(0, 10); }

/* Génère la date à N jours dans le futur */
function day(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
}

/* Construit la fenêtre de dispo sur les 14 prochains jours ouverts */
function buildAvailability() {
  const av = {};
  let added = 0;
  let i = 0;

  while (added < 14) {
    const d   = day(i++);
    const dow = d.getDay();

    if (!OPEN_DAYS.has(dow)) continue; /* lun, mar, dim : fermé */

    const key   = dayKey(d);
    const slots = generateAvailableSlots(d);

    /* Simulation : quelques jours complets pour la démo */
    if (added === 2 || added === 5) {
      av[key] = [];       /* complet */
    } else {
      av[key] = slots;
    }
    added++;
  }

  return av;
}

export function fetchAvailability() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ salon: SALON, availability: buildAvailability() });
    }, 350);
  });
}

/* ── Subscription temps réel (Supabase) ── */
import { supabase, SUPABASE_READY } from '../lib/supabase';

export function subscribeToAvailability(callback) {
  if (!SUPABASE_READY) return () => {};
  const channel = supabase
    .channel('availability-live')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, callback)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'appointments' }, callback)
    .on('postgres_changes', { event: '*',      schema: 'public', table: 'availability_blocks' }, callback)
    .subscribe();
  return () => supabase.removeChannel(channel);
}
