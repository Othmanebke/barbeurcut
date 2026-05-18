import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')!;
const BARBER_PHONE  = Deno.env.get('BARBER_PHONE')!;
const SMS_SENDER    = Deno.env.get('SMS_SENDER') ?? 'WonderCut';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/* ── Envoi SMS via Brevo ── */
async function sendSMS(to: string, content: string): Promise<void> {
  const res = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: SMS_SENDER, recipient: to, content, type: 'transactional' }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Brevo SMS error:', err);
    throw new Error(`SMS failed: ${err}`);
  }
}

/* ── Formatage date lisible ── */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const {
      clientPhone, clientName, serviceTitle, servicePriceLabel,
      date, time, confirmationNumber,
    } = await req.json();

    const formattedDate = formatDate(date);

    /* SMS confirmation → CLIENT */
    const clientSMS =
      `Wonder Cut ✓ Réservation confirmée !\n` +
      `${serviceTitle} — ${formattedDate} à ${time}\n` +
      `N° ${confirmationNumber}\n` +
      `L'adresse exacte t'arrivera par SMS la veille. 💈`;

    /* SMS notification → BARBIER */
    const barberSMS =
      `💈 Nouveau RDV Wonder Cut\n` +
      `${clientName} — ${serviceTitle} (${servicePriceLabel})\n` +
      `${formattedDate} à ${time}\n` +
      `📞 ${clientPhone}`;

    await Promise.all([
      sendSMS(clientPhone, clientSMS),
      sendSMS(BARBER_PHONE, barberSMS),
    ]);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
