import { supabase, SUPABASE_READY } from '../lib/supabase';

/* Tente d'acquérir un verrou de 5 min sur un créneau.
   Renvoie true si le verrou est obtenu, false si déjà pris. */
export async function acquireLock(date, time, sessionId) {
  if (!SUPABASE_READY) return true;

  const { data, error } = await supabase.rpc('try_lock_slot', {
    p_date:             date,
    p_time:             time,
    p_session_id:       sessionId,
    p_duration_minutes: 5,
  });

  if (error) throw new Error(error.message);
  return Boolean(data);
}

/* Libère le verrou appartenant à cette session. */
export async function releaseLock(date, time, sessionId) {
  if (!SUPABASE_READY) return;

  await supabase.rpc('release_slot_lock', {
    p_date:       date,
    p_time:       time,
    p_session_id: sessionId,
  });
}
