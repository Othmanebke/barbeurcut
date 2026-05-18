/**
 * Cron : s'exécute chaque soir à 18h
 * Envoie l'adresse exacte à chaque client qui a un RDV le lendemain.
 *
 * Configurer dans Supabase Dashboard > Edge Functions > Cron :
 *   schedule : "0 18 * * *"   (tous les jours à 18h UTC)
 *   function  : send-address-sms
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')!;
const SALON_ADDRESS = Deno.env.get('SALON_ADDRESS')!;
const SMS_SENDER    = Deno.env.get('SMS_SENDER') ?? 'WonderCut';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function sendSMS(to: string, content: string) {
  const res = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: SMS_SENDER, recipient: to, content, type: 'transactional' }),
  });
  if (!res.ok) throw new Error(await res.text());
}

function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

serve(async () => {
  const tomorrowDate = tomorrow();

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('client_name, client_phone, service_title, time, confirmation_number')
    .eq('date', tomorrowDate)
    .eq('status', 'confirmed');

  if (error) {
    console.error('Supabase error:', error);
    return new Response('error', { status: 500 });
  }

  let sent = 0;
  for (const appt of appointments ?? []) {
    const msg =
      `Wonder Cut 📍 Rappel RDV demain à ${appt.time}\n` +
      `${appt.service_title}\n` +
      `Adresse : ${SALON_ADDRESS}\n` +
      `N° ${appt.confirmation_number}`;

    try {
      await sendSMS(appt.client_phone, msg);
      sent++;
    } catch (e) {
      console.error(`SMS failed for ${appt.client_phone}:`, e);
    }
  }

  console.log(`send-address-sms: ${sent}/${appointments?.length ?? 0} SMS sent for ${tomorrowDate}`);
  return new Response(JSON.stringify({ sent, date: tomorrowDate }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
