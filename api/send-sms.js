/* Vercel Serverless Function — notifications réservation Wonderclub
   · Email de confirmation → client (Brevo email, GRATUIT)
   · SMS de notif → barbier (Brevo SMS, payant — optionnel)
*/

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

/* ── Email via Brevo (gratuit 300/jour) ── */
async function sendEmail({ apiKey, to, toName, subject, html, senderEmail, senderName }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender:      { name: senderName ?? 'Wonderclub', email: senderEmail },
      to:          [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ── SMS via Brevo (payant) ── */
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    clientPhone, clientEmail, clientName,
    serviceTitle, servicePriceLabel,
    date, time, confirmationNumber,
  } = req.body;

  const BREVO_KEY     = process.env.BREVO_API_KEY;
  const BARBER_PHONE  = process.env.BARBER_PHONE;
  const BARBER_EMAIL  = process.env.BARBER_EMAIL;
  const SENDER_EMAIL  = process.env.SENDER_EMAIL;   /* email vérifié dans Brevo */
  const SMS_SENDER    = process.env.SMS_SENDER ?? 'Wonderclub';

  if (!BREVO_KEY) return res.status(500).json({ error: 'BREVO_API_KEY missing' });

  const formattedDate = formatDate(date);
  const results = { email: null, sms: null, errors: [] };

  /* ── 1. EMAIL CLIENT (gratuit) ── */
  if (clientEmail && SENDER_EMAIL) {
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Réservation confirmée — Wonderclub</title>
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
          table { border-collapse: collapse; }
          img { max-width: 100%; height: auto; display: block; }
        </style>
      </head>
      <body style="background:#F4EFEA;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFEA;padding:40px 20px;">
          <tr><td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

              <!-- ── HEADER ── -->
              <tr><td style="background:#5C4031;padding:32px 40px;border-bottom:4px solid #F4EFEA;">
                <table width="100%" cellpadding="0" cellspacing="0"><tr>
                  <!-- Logo/Marque -->
                  <td style="vertical-align:middle;">
                    <span style="font-size:18px;font-weight:900;text-transform:uppercase;
                                 letter-spacing:6px;color:#F4EFEA;display:block;">Wonderclub</span>
                  </td>
                  <!-- Statut -->
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:3px;
                                 color:#F4EFEA;font-weight:700;display:block;">✓ Confirmé</span>
                  </td>
                </tr></table>
              </td></tr>

              <!-- ── BODY ── -->
              <tr><td style="background:#FFFFFF;padding:40px 40px 28px;">

                <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;
                           letter-spacing:3px;color:#5C4031;font-weight:700;">Bonjour ${clientName},</p>

                <h1 style="margin:0 0 32px;font-size:28px;font-weight:900;
                            text-transform:uppercase;letter-spacing:-1px;color:#5C4031;line-height:1.15;">
                  Ton rendez-vous<br>est confirmé.
                </h1>

                <!-- Récap -->
                <table width="100%" cellpadding="0" cellspacing="0"
                       style="background:#F9F6F2;margin-bottom:32px;border:1px solid #EBE3DB;">
                  ${[
                    ['Prestation',  `<strong>${serviceTitle}</strong> — ${servicePriceLabel}`],
                    ['Date & Heure', `${formattedDate} à ${time}`],
                    ['Adresse',     '1 Rue de la Madeleine<br>77170 Brie-Comte-Robert'],
                    ['Référence',   `<strong>#${confirmationNumber}</strong>`],
                  ].map(([label, val]) => `
                    <tr>
                      <td style="padding:13px 16px;font-size:10px;text-transform:uppercase;
                                 letter-spacing:2px;color:#5C4031;font-weight:700;
                                 border-bottom:1px solid #EBE3DB;width:35%;vertical-align:top;">${label}</td>
                      <td style="padding:13px 16px;font-size:14px;font-weight:500;color:#3D2A1E;
                                 border-bottom:1px solid #EBE3DB;">${val}</td>
                    </tr>
                  `).join('')}
                </table>

                <p style="margin:0 0 24px;font-size:14px;line-height:1.8;
                           color:#5C4031;font-weight:500;">
                  Je suis barbier indépendant et je loue mon siège à cette adresse. 
                  <strong>Présente-toi directement à l'heure prévue.</strong>
                </p>

                <!-- CTA -->
                <a href="https://barbeurcut.vercel.app"
                   style="display:inline-block;background:#5C4031;color:#F4EFEA;
                          padding:15px 36px;font-size:11px;font-weight:900;
                          text-transform:uppercase;letter-spacing:3px;text-decoration:none;border:none;border-radius:0;">
                  → Visiter le site
                </a>

              </td></tr>

              <!-- ── DIVIDER ── -->
              <tr><td style="height:1px;background:#EBE3DB;"></td></tr>

              <!-- ── FOOTER ── -->
              <tr><td style="background:#F9F6F2;padding:24px 40px;">
                <p style="margin:0;font-size:10px;color:#5C4031;
                           text-transform:uppercase;letter-spacing:2px;font-weight:600;text-align:center;">
                  Wonderclub • Barbier indépendant • Brie-Comte-Robert
                </p>
                <p style="margin:12px 0 0;font-size:9px;color:rgba(92,64,49,0.50);
                           text-align:center;letter-spacing:1px;">
                  © ${new Date().getFullYear()} — 1 Rue de la Madeleine, 77170
                </p>
              </td></tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    try {
      results.email = await sendEmail({
        apiKey:      BREVO_KEY,
        to:          clientEmail,
        toName:      clientName,
        subject:     `Wonderclub ✓ — Réservation confirmée (${confirmationNumber})`,
        html,
        senderEmail: SENDER_EMAIL,
        senderName:  'Wonderclub',
      });
      console.log('[send-notification] email sent to', clientEmail);
    } catch (e) {
      console.error('[send-notification] email error:', e.message);
      results.errors.push({ type: 'email', error: e.message });
    }
  }

  /* ── 2. EMAIL BARBIER (alerte nouveau RDV, gratuit) ── */
  if (BARBER_EMAIL && SENDER_EMAIL) {
    const barberHtml = `
      <!DOCTYPE html><html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
          table { border-collapse: collapse; }
        </style>
      </head>
      <body style="background:#F4EFEA;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFEA;padding:40px 20px;">
          <tr><td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
              <!-- ── HEADER ── -->
              <tr><td style="background:#5C4031;padding:32px 40px;border-bottom:4px solid #F4EFEA;">
                <span style="font-size:18px;font-weight:900;text-transform:uppercase;
                             letter-spacing:6px;color:#F4EFEA;">Nouveau RDV ✓</span>
              </td></tr>
              
              <!-- ── BODY ── -->
              <tr><td style="background:#FFFFFF;padding:40px 40px 28px;">
                <h1 style="margin:0 0 28px;font-size:28px;font-weight:900;
                            text-transform:uppercase;color:#5C4031;letter-spacing:-1px;">
                  ${clientName}
                </h1>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F6F2;margin-bottom:28px;border:1px solid #EBE3DB;">
                  ${[
                    ['Prestation', `<strong>${serviceTitle}</strong> — ${servicePriceLabel}`],
                    ['Date & Heure',    `${formattedDate} à ${time}`],
                    ['Téléphone',  `<strong><a href="tel:${clientPhone}" style="color:#5C4031;text-decoration:none;">${clientPhone}</a></strong>`],
                    ['Email',      clientEmail || '—'],
                    ['Référence',  `<strong>#${confirmationNumber}</strong>`],
                  ].map(([label, val]) => `
                    <tr>
                      <td style="padding:13px 16px;font-size:10px;text-transform:uppercase;
                                 letter-spacing:2px;color:#5C4031;font-weight:700;
                                 border-bottom:1px solid #EBE3DB;width:35%;vertical-align:top;">${label}</td>
                      <td style="padding:13px 16px;font-size:14px;font-weight:500;color:#3D2A1E;
                                 border-bottom:1px solid #EBE3DB;">${val}</td>
                    </tr>
                  `).join('')}
                </table>
                
                <a href="tel:${clientPhone}"
                   style="display:inline-block;background:#5C4031;color:#F4EFEA;
                          padding:15px 36px;font-size:11px;font-weight:900;
                          text-transform:uppercase;letter-spacing:3px;text-decoration:none;">
                  ☎ Appeler
                </a>
              </td></tr>
              
              <!-- ── DIVIDER ── -->
              <tr><td style="height:1px;background:#EBE3DB;"></td></tr>
              
              <!-- ── FOOTER ── -->
              <tr><td style="background:#F9F6F2;padding:20px 40px;">
                <p style="margin:0;font-size:10px;color:#5C4031;
                           text-transform:uppercase;letter-spacing:2px;font-weight:600;text-align:center;">
                  Wonderclub Admin
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `;
    try {
      await sendEmail({
        apiKey:      BREVO_KEY,
        to:          BARBER_EMAIL,
        toName:      'Wonderclub',
        subject:     `Nouveau RDV — ${clientName} · ${formattedDate} à ${time}`,
        html:        barberHtml,
        senderEmail: SENDER_EMAIL,
        senderName:  'Wonderclub Réservations',
      });
      console.log('[send-notification] email sent to barber');
    } catch (e) {
      console.error('[send-notification] barber email error:', e.message);
      results.errors.push({ type: 'emailBarber', error: e.message });
    }
  }

  /* ── 3. SMS CLIENT (confirmation, nécessite crédits Brevo ~0,07€/SMS) ── */
  if (clientPhone) {
    const clientMsg =
      `Wonderclub ✓ RDV confirmé\n` +
      `${serviceTitle}\n` +
      `${formattedDate} à ${time}\n` +
      `1 Rue de la Madeleine, 77170 Brie-Comte-Robert\n` +
      `Ref: ${confirmationNumber}`;

    try {
      results.smsClient = await sendSMS(BREVO_KEY, toE164(clientPhone), clientMsg, SMS_SENDER);
      console.log('[send-notification] SMS sent to client');
    } catch (e) {
      console.warn('[send-notification] client SMS skipped (no credits?):', e.message);
      results.errors.push({ type: 'smsClient', error: e.message });
    }
  }

  /* ── 3. SMS BARBIER (alerte nouveau RDV, nécessite crédits Brevo) ── */
  if (BARBER_PHONE) {
    const barberMsg =
      `Nouveau RDV Wonderclub\n` +
      `${clientName} - ${serviceTitle} (${servicePriceLabel})\n` +
      `${formattedDate} à ${time}\n` +
      `Tel: ${clientPhone}`;

    try {
      results.smsBarber = await sendSMS(BREVO_KEY, toE164(BARBER_PHONE), barberMsg, SMS_SENDER);
      console.log('[send-notification] SMS sent to barber');
    } catch (e) {
      console.warn('[send-notification] barber SMS skipped (no credits?):', e.message);
      results.errors.push({ type: 'smsBarber', error: e.message });
    }
  }

  return res.status(200).json({ success: true, results });
}
