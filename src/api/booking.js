import { supabase, SUPABASE_READY } from '../lib/supabase';

function generateConfirmationNumber() {
  return `WC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/* ── Création d'un RDV (Supabase + SMS) ─────────────────────── */
export async function createBooking({ service, date, time, clientName, clientPhone, clientEmail }) {
  const confirmationNumber = generateConfirmationNumber();

  if (!SUPABASE_READY) {
    /* Mode démo : simuler un délai */
    await new Promise(r => setTimeout(r, 1200));
    return confirmationNumber;
  }

  /* 1a. Vérifier que le barbier n'a pas bloqué ce jour ou ce créneau */
  const { data: blocks } = await supabase
    .from('availability_blocks')
    .select('time')
    .eq('date', date);

  const isAdminBlocked = (blocks ?? []).some(b => !b.time || b.time === time);
  if (isAdminBlocked) {
    throw new Error('Ce créneau n\'est plus disponible. Le barbier a fermé cette plage horaire.');
  }

  /* 1b. Vérifier que le créneau est encore libre (race condition protection) */
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
      service_duration:     service.duration ?? 30,
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
      clientEmail,
      clientName,
      serviceTitle:      service.title,
      servicePriceLabel: service.priceLabel,
      date,
      time,
      confirmationNumber,
    }),
  }).catch(err => console.warn('Notification non-critical:', err));

  return confirmationNumber;
}

/* ── Création de plusieurs RDV en une seule fois ────────────── */
export async function createBatchBooking({ service, bookings, clientName, clientPhone, clientEmail }) {
  // bookings = [{ date, time }]
  const results = [];
  for (const b of bookings) {
    const cn = await createBooking({
      service, date: b.date, time: b.time,
      clientName, clientPhone, clientEmail,
    });
    results.push({ date: b.date, time: b.time, confirmationNumber: cn });
  }
  return results; // [{date, time, confirmationNumber}]
}

/* ── Annuler un RDV — RPC admin (bypass RLS) ───────────────── */
export async function cancelBooking(appointmentId) {
  if (!SUPABASE_READY) throw new Error('Supabase non configuré.');
  const { error } = await supabase.rpc('admin_cancel_appointment', { p_id: appointmentId });
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

/* ── Bloquer un créneau / journée — RPC admin ───────────────── */
export async function blockSlot(date, time = null, reason = 'Indisponible') {
  if (!SUPABASE_READY) throw new Error('Supabase non configuré.');
  const { error } = await supabase.rpc('admin_block', { p_date: date, p_time: time, p_reason: reason });
  if (error) throw new Error(error.message);
}

/* ── Débloquer un créneau / journée — RPC admin ─────────────── */
export async function unblockSlot(date, time = null) {
  if (!SUPABASE_READY) throw new Error('Supabase non configuré.');
  const { error } = await supabase.rpc('admin_unblock', { p_date: date, p_time: time });
  if (error) throw new Error(error.message);
}

/* ── Ajouter une pause horaire — RPC admin ───────────────────── */
export async function addPauseBlock(date, startTime, endTime) {
  if (!SUPABASE_READY) throw new Error('Supabase non configuré.');
  const { error } = await supabase.rpc('admin_add_pause', {
    p_date: date, p_start: startTime, p_end: endTime,
  });
  if (error) throw new Error(error.message);
}

/* ── Récupérer les blocs ─────────────────────────────────────── */
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
