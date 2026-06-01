/* Vercel Serverless Function — notifications réservation Wonder Cut
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
      sender:      { name: senderName ?? 'Wonder Cut', email: senderEmail },
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
  const SENDER_EMAIL  = process.env.SENDER_EMAIL;   /* email vérifié dans Brevo */
  const SMS_SENDER    = process.env.SMS_SENDER ?? 'WonderCut';

  if (!BREVO_KEY) return res.status(500).json({ error: 'BREVO_API_KEY missing' });

  const formattedDate = formatDate(date);
  const results = { email: null, sms: null, errors: [] };

  /* ── 1. EMAIL CLIENT (gratuit) ── */
  if (clientEmail && SENDER_EMAIL) {
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#FFF8E7;font-family:Montserrat,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8E7;padding:40px 20px;">
          <tr><td align="center">
            <table width="100%" max-width="560" cellpadding="0" cellspacing="0"
                   style="max-width:560px;background:#4A2F1A;color:#FFF8E7;">

              <!-- Header -->
              <tr><td style="padding:32px 40px;border-bottom:2px solid #C68E17;">
                <table width="100%"><tr>
                  <td>
                    <span style="display:inline-block;width:32px;height:32px;background:#C68E17;
                                 color:#4A2F1A;font-weight:900;font-size:11px;text-align:center;
                                 line-height:32px;letter-spacing:2px;">WC</span>
                    <span style="margin-left:10px;font-size:11px;font-weight:900;
                                 letter-spacing:5px;text-transform:uppercase;color:#FFF8E7;">Wonder Cut</span>
                  </td>
                  <td align="right">
                    <span style="font-size:10px;text-transform:uppercase;letter-spacing:4px;
                                 color:#C68E17;font-weight:700;">Réservation ✓</span>
                  </td>
                </tr></table>
              </td></tr>

              <!-- Body -->
              <tr><td style="padding:40px 40px 32px;">
                <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;
                           letter-spacing:4px;color:#C68E17;font-weight:700;">Confirmation</p>
                <h1 style="margin:0 0 32px;font-size:28px;font-weight:900;
                            text-transform:uppercase;letter-spacing:-1px;color:#FFF8E7;line-height:1.1;">
                  Réservation<br>confirmée !
                </h1>

                <!-- Recap -->
                <table width="100%" cellpadding="0" cellspacing="0"
                       style="background:#3D2710;margin-bottom:24px;">
                  ${[
                    ['Prestation',  `${serviceTitle} (${servicePriceLabel})`],
                    ['Date',        formattedDate],
                    ['Horaire',     time],
                    ['N° de réf.',  confirmationNumber],
                  ].map(([label, val]) => `
                    <tr>
                      <td style="padding:12px 16px;font-size:9px;text-transform:uppercase;
                                 letter-spacing:3px;color:#FFF8E7;opacity:0.4;font-weight:700;
                                 border-bottom:1px solid rgba(255,248,231,0.08);width:40%;">${label}</td>
                      <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#FFF8E7;
                                 border-bottom:1px solid rgba(255,248,231,0.08);">${val}</td>
                    </tr>
                  `).join('')}
                </table>

                <p style="margin:0 0 32px;font-size:13px;line-height:1.8;
                           color:rgba(255,248,231,0.65);font-weight:500;">
                  Présente-toi à l'adresse indiquée ci-dessus à l'heure prévue.<br>
                  <strong style="color:#C68E17;">Wonder Cut est un barbier indépendant</strong> qui loue son siège au 1 Rue de la Madeleine, 77170 Brie-Comte-Robert.
                </p>

                <!-- CTA -->
                <a href="https://barbeurcut.vercel.app/prestations"
                   style="display:inline-block;background:#C68E17;color:#4A2F1A;
                          padding:14px 32px;font-size:10px;font-weight:900;
                          text-transform:uppercase;letter-spacing:4px;text-decoration:none;">
                  Voir nos services
                </a>
              </td></tr>

              <!-- Footer -->
              <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,248,231,0.1);">
                <p style="margin:0;font-size:9px;color:rgba(255,248,231,0.25);
                           text-transform:uppercase;letter-spacing:3px;font-weight:500;">
                  © ${new Date().getFullYear()} Wonder Cut · 1 Rue de la Madeleine, 77170 Brie-Comte-Robert
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
        subject:     `Wonder Cut ✓ — Réservation confirmée (${confirmationNumber})`,
        html,
        senderEmail: SENDER_EMAIL,
        senderName:  'Wonder Cut',
      });
      console.log('[send-notification] email sent to', clientEmail);
    } catch (e) {
      console.error('[send-notification] email error:', e.message);
      results.errors.push({ type: 'email', error: e.message });
    }
  }

  /* ── 2. SMS CLIENT (confirmation, nécessite crédits Brevo ~0,07€/SMS) ── */
  if (clientPhone) {
    const clientMsg =
      `Wonder Cut - RDV confirme !\n` +
      `${serviceTitle}\n` +
      `${formattedDate} a ${time}\n` +
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
      `Nouveau RDV Wonder Cut\n` +
      `${clientName} - ${serviceTitle}\n` +
      `${formattedDate} a ${time}\n` +
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
