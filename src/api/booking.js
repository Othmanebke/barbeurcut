import { supabase, SUPABASE_READY } from '../lib/supabase';

function generateConfirmationNumber() {
  return `WC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/* ── Création d'un RDV (Supabase + SMS) ─────────────────────── */
export async function createBooking({ service, date, time, clientName, clientPhone }) {
  const confirmationNumber = generateConfirmationNumber();

  if (!SUPABASE_READY) {
    /* Mode démo : simuler un délai */
    await new Promise(r => setTimeout(r, 1200));
    return confirmationNumber;
  }

  /* 1. Vérifier que le créneau est encore libre (race condition protection) */
  const { data: conflict } = await supabase
    .from('appointments')
    .select('id')
    .eq('date', date)
    .eq('time', time)
    .eq('status', 'confirmed')
    .maybeSingle();

  if (conflict) {
    throw new Error('Ce créneau vient d\'être réservé. Veuillez en choisir un autre.');
  }

  /* 2. Insérer le RDV */
  const { error: insertError } = await supabase
    .from('appointments')
    .insert([{
      client_name:          clientName,
      client_phone:         clientPhone,
      service_id:           service.id,
      service_title:        service.title,
      service_price:        service.price,
      service_price_label:  service.priceLabel,
      date,
      time,
      status:               'confirmed',
      confirmation_number:  confirmationNumber,
    }]);

  if (insertError) throw new Error(insertError.message);

  /* 3. Envoyer les SMS via Vercel API route (non-bloquant) */
  fetch('/api/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientPhone,
      clientName,
      serviceTitle:      service.title,
      servicePriceLabel: service.priceLabel,
      date,
      time,
      confirmationNumber,
    }),
  }).catch(err => console.warn('SMS non-critical:', err));

  return confirmationNumber;
}

/* ── Annuler un RDV (dashboard barbier) ─────────────────────── */
export async function cancelBooking(appointmentId) {
  if (!SUPABASE_READY) throw new Error('Supabase non configuré.');

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId);

  if (error) throw new Error(error.message);
}

/* ── Récupérer les RDV (admin) ──────────────────────────────── */
export async function fetchAppointments({ from, to }) {
  if (!SUPABASE_READY) return [];

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .gte('date', from)
    .lte('date', to)
    .eq('status', 'confirmed')
    .order('date')
    .order('time');

  if (error) throw new Error(error.message);
  return data ?? [];
}

/* ── Bloquer / débloquer un créneau (admin) ─────────────────── */
export async function blockSlot(date, time = null, reason = 'Indisponible') {
  if (!SUPABASE_READY) throw new Error('Supabase non configuré.');

  const { error } = await supabase
    .from('availability_blocks')
    .upsert([{ date, time, reason }], { onConflict: 'date,time' });

  if (error) throw new Error(error.message);
}

export async function unblockSlot(date, time = null) {
  if (!SUPABASE_READY) throw new Error('Supabase non configuré.');

  let query = supabase.from('availability_blocks').delete().eq('date', date);
  if (time) query = query.eq('time', time);
  else query = query.is('time', null);

  const { error } = await query;
  if (error) throw new Error(error.message);
}

export async function fetchBlocks({ from, to }) {
  if (!SUPABASE_READY) return [];

  const { data, error } = await supabase
    .from('availability_blocks')
    .select('*')
    .gte('date', from)
    .lte('date', to);

  if (error) throw new Error(error.message);
  return data ?? [];
}
