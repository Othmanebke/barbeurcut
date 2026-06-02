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
      </head>
      <body style="margin:0;padding:0;background:#FFF8E7;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8E7;padding:40px 16px;">
          <tr><td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

              <!-- ── HEADER ── -->
              <tr><td style="background:#4A2F1A;padding:28px 36px;border-bottom:3px solid #C68E17;">
                <table width="100%" cellpadding="0" cellspacing="0"><tr>

                  <!-- Logo -->
                  <td style="vertical-align:middle;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="background:#C68E17;width:38px;height:38px;text-align:center;vertical-align:middle;">
                        <img src="https://barbeurcut.vercel.app/logo.png"
                             width="26" height="26" alt="W"
                             style="display:block;margin:auto;" />
                      </td>
                    </tr></table>
                  </td>

                  <!-- Statut -->
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-size:10px;text-transform:uppercase;letter-spacing:4px;
                                 color:#C68E17;font-weight:700;">Réservation confirmée ✓</span>
                  </td>

                </tr></table>
              </td></tr>

              <!-- ── BODY ── -->
              <tr><td style="background:#4A2F1A;padding:36px 36px 32px;">

                <p style="margin:0 0 6px;font-size:10px;text-transform:uppercase;
                           letter-spacing:4px;color:#C68E17;font-weight:700;">Bonjour ${clientName}</p>
                <h1 style="margin:0 0 28px;font-size:26px;font-weight:900;
                            text-transform:uppercase;letter-spacing:-1px;color:#FFF8E7;line-height:1.1;">
                  Ton rendez-vous<br>est confirmé.
                </h1>

                <!-- Récap -->
                <table width="100%" cellpadding="0" cellspacing="0"
                       style="background:#3D2710;margin-bottom:28px;">
                  ${[
                    ['Prestation',  `${serviceTitle} — ${servicePriceLabel}`],
                    ['Date',        formattedDate],
                    ['Horaire',     time],
                    ['Adresse',     '1 Rue de la Madeleine, 77170 Brie-Comte-Robert'],
                    ['Référence',   confirmationNumber],
                  ].map(([label, val]) => `
                    <tr>
                      <td style="padding:11px 16px;font-size:9px;text-transform:uppercase;
                                 letter-spacing:3px;color:#C68E17;font-weight:700;
                                 border-bottom:1px solid rgba(255,248,231,0.07);width:38%;">${label}</td>
                      <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#FFF8E7;
                                 border-bottom:1px solid rgba(255,248,231,0.07);">${val}</td>
                    </tr>
                  `).join('')}
                </table>

                <p style="margin:0 0 28px;font-size:13px;line-height:1.9;
                           color:rgba(255,248,231,0.60);font-weight:400;">
                  Je suis barbier indépendant et je loue mon siège à cette adresse.
                  Présente-toi directement sur place à l'heure prévue.
                </p>

                <!-- CTA -->
                <a href="https://barbeurcut.vercel.app"
                   style="display:inline-block;background:#C68E17;color:#4A2F1A;
                          padding:14px 32px;font-size:10px;font-weight:900;
                          text-transform:uppercase;letter-spacing:4px;text-decoration:none;">
                  Voir le site
                </a>

              </td></tr>

              <!-- ── FOOTER ── -->
              <tr><td style="background:#3D2710;padding:18px 36px;border-top:1px solid rgba(255,248,231,0.08);">
                <p style="margin:0;font-size:9px;color:rgba(255,248,231,0.20);
                           text-transform:uppercase;letter-spacing:3px;font-weight:500;text-align:center;">
                  © ${new Date().getFullYear()} Wonderclub · Barbier indépendant · Brie-Comte-Robert 77170
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
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#FFF8E7;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8E7;padding:32px 16px;">
          <tr><td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#4A2F1A;color:#FFF8E7;">
              <tr><td style="padding:24px 32px;border-bottom:3px solid #C68E17;">
                <span style="font-size:12px;font-weight:900;text-transform:uppercase;
                             letter-spacing:5px;color:#C68E17;">Nouveau RDV ✓</span>
              </td></tr>
              <tr><td style="padding:28px 32px;">
                <h1 style="margin:0 0 24px;font-size:22px;font-weight:900;
                            text-transform:uppercase;color:#FFF8E7;letter-spacing:-1px;">
                  ${clientName}
                </h1>
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#3D2710;margin-bottom:20px;">
                  ${[
                    ['Prestation', `${serviceTitle} — ${servicePriceLabel}`],
                    ['Date',       formattedDate],
                    ['Horaire',    time],
                    ['Téléphone',  clientPhone],
                    ['Email',      clientEmail || 'Non renseigné'],
                    ['Référence',  confirmationNumber],
                  ].map(([label, val]) => `
                    <tr>
                      <td style="padding:10px 14px;font-size:9px;text-transform:uppercase;
                                 letter-spacing:3px;color:#C68E17;font-weight:700;
                                 border-bottom:1px solid rgba(255,248,231,0.07);width:36%;">${label}</td>
                      <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#FFF8E7;
                                 border-bottom:1px solid rgba(255,248,231,0.07);">${val}</td>
                    </tr>
                  `).join('')}
                </table>
                <a href="tel:${clientPhone}"
                   style="display:inline-block;background:#C68E17;color:#4A2F1A;
                          padding:12px 28px;font-size:10px;font-weight:900;
                          text-transform:uppercase;letter-spacing:4px;text-decoration:none;">
                  Appeler le client
                </a>
              </td></tr>
              <tr><td style="padding:16px 32px;border-top:1px solid rgba(255,248,231,0.08);">
                <p style="margin:0;font-size:9px;color:rgba(255,248,231,0.20);
                           text-transform:uppercase;letter-spacing:3px;text-align:center;">
                  Wonderclub · Barbier indépendant
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
      `Wonderclub - RDV confirme !\n` +
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
      `Nouveau RDV Wonderclub\n` +
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
