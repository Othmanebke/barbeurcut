/* Vercel Cron — Rappel SMS 24h avant le rendez-vous
   Déclenché chaque jour à 10h00 UTC via vercel.json
   Envoie un SMS à chaque client ayant un RDV le lendemain.
*/

import { createClient } from '@supabase/supabase-js';

function toE164(phone) {
  const clean = (phone ?? '').replace(/[\s.\-()]/g, '');
  if (clean.startsWith('+33')) return clean;
  if (clean.startsWith('0'))   return '+33' + clean.slice(1);
  return '+33' + clean;
}

function formatDate(date) {
  return new Date(date + 'T12:00:00')
    .toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' });
}

async function sendSMS(apiKey, to, content, sender) {
  const res = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender, recipient: to, content, type: 'transactional' }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default async function handler(req, res) {
  /* Vérification sécurité Vercel Cron */
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const BREVO_KEY  = process.env.BREVO_API_KEY;
  const SMS_SENDER = process.env.SMS_SENDER ?? 'Wonderclub';

  if (!BREVO_KEY) return res.status(500).json({ error: 'BREVO_API_KEY missing' });

  /* Supabase avec la clé service_role pour lire tous les RDV */
  const supabase = createClient(
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  /* Date de demain — heure locale (même fix que Booking.jsx pour éviter le décalage UTC) */
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr =
    tomorrow.getFullYear() + '-' +
    String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' +
    String(tomorrow.getDate()).padStart(2, '0');

  /* Récupérer les RDV confirmés pour demain */
  const { data: appts, error } = await supabase
    .from('appointments')
    .select('client_name, client_phone, service_title, date, time')
    .eq('date', tomorrowStr)
    .eq('status', 'confirmed');

  if (error) return res.status(500).json({ error: error.message });

  let sent = 0;
  const errors = [];

  for (const appt of appts ?? []) {
    if (!appt.client_phone) continue;

    const msg =
      `Wonderclub - Rappel RDV\n` +
      `${appt.service_title}\n` +
      `Demain ${formatDate(appt.date)} a ${appt.time}\n` +
      `1 Rue de la Madeleine, 77170 Brie-Comte-Robert`;

    try {
      await sendSMS(BREVO_KEY, toE164(appt.client_phone), msg, SMS_SENDER);
      sent++;
    } catch (e) {
      errors.push({ phone: appt.client_phone, error: e.message });
    }
  }

  console.log(`[send-reminder] ${sent} SMS envoyés pour le ${tomorrowStr}`);
  return res.status(200).json({ date: tomorrowStr, sent, errors });
}
