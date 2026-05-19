/* Vercel Serverless Function — envoi SMS via Brevo */

/* Convertit 0612... ou +33612... en +33612... pour l'API Brevo */
function toE164(phone) {
  const clean = (phone ?? '').replace(/[\s.\-()]/g, '');
  if (clean.startsWith('+33')) return clean;
  if (clean.startsWith('0'))   return '+33' + clean.slice(1);
  return '+33' + clean;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    clientPhone, clientName,
    serviceTitle, servicePriceLabel,
    date, time, confirmationNumber,
  } = req.body;

  const BREVO_KEY   = process.env.BREVO_API_KEY;
  const BARBER_PHONE = process.env.BARBER_PHONE;
  const SMS_SENDER  = process.env.SMS_SENDER ?? 'WonderCut';

  if (!BREVO_KEY) {
    return res.status(500).json({ error: 'BREVO_API_KEY not configured' });
  }

  /* Format date lisible */
  const formattedDate = new Date(date + 'T12:00:00')
    .toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' });

  /* SMS → CLIENT */
  const clientMsg =
    `Wonder Cut ✓ Réservation confirmée !\n` +
    `${serviceTitle} (${servicePriceLabel})\n` +
    `${formattedDate} à ${time}\n` +
    `N° ${confirmationNumber}\n` +
    `L'adresse t'arrivera par SMS la veille. 💈`;

  /* SMS → BARBIER */
  const barberMsg =
    `💈 Nouveau RDV Wonder Cut\n` +
    `${clientName} — ${serviceTitle}\n` +
    `${formattedDate} à ${time}\n` +
    `📞 ${clientPhone}`;

  async function sendSMS(to, content) {
    const r = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
      method: 'POST',
      headers: {
        'api-key':     BREVO_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sender: SMS_SENDER, recipient: to, content, type: 'transactional' }),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  const clientPhoneE164 = toE164(clientPhone);
  const barberPhoneE164 = BARBER_PHONE ? toE164(BARBER_PHONE) : null;

  console.log('[send-sms] client:', clientPhoneE164, '| barber:', barberPhoneE164);

  try {
    const promises = [sendSMS(clientPhoneE164, clientMsg)];
    if (barberPhoneE164) promises.push(sendSMS(barberPhoneE164, barberMsg));
    const results = await Promise.all(promises);
    console.log('[send-sms] success:', JSON.stringify(results));
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('[send-sms] error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
