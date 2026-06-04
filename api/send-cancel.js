/* Vercel Serverless — Email d'annulation de RDV au client */

function formatDate(date) {
  return new Date(date + 'T12:00:00')
    .toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    clientEmail, clientName,
    serviceTitle, date, time,
    confirmationNumber, barberMessage,
  } = req.body;

  const BREVO_KEY   = process.env.BREVO_API_KEY;
  const SENDER_EMAIL = process.env.SENDER_EMAIL;

  if (!BREVO_KEY || !SENDER_EMAIL || !clientEmail) {
    return res.status(200).json({ skipped: true });
  }

  const formattedDate = formatDate(date);
  const message = barberMessage?.trim() ||
    'Nous nous excusons pour ce désagrément. N\'hésitez pas à reprendre rendez-vous.';

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#F4EFEA;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFEA;padding:40px 20px;">
        <tr><td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

            <!-- HEADER -->
            <tr><td style="background:#5C4031;padding:28px 36px;border-bottom:3px solid #F4EFEA;">
              <table width="100%"><tr>
                <td style="font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:6px;color:#F4EFEA;">
                  Wonderclub
                </td>
                <td align="right" style="font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#F4EFEA;font-weight:700;">
                  RDV annulé
                </td>
              </tr></table>
            </td></tr>

            <!-- BODY -->
            <tr><td style="background:#FFFFFF;padding:36px 36px 28px;">
              <p style="margin:0 0 6px;font-size:10px;text-transform:uppercase;letter-spacing:3px;color:#5C4031;font-weight:700;">
                Bonjour ${clientName},
              </p>
              <h1 style="margin:0 0 28px;font-size:24px;font-weight:900;text-transform:uppercase;color:#5C4031;letter-spacing:-1px;line-height:1.2;">
                Ton rendez-vous<br>a été annulé.
              </h1>

              <!-- Récap RDV annulé -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F6F2;margin-bottom:24px;border:1px solid #EBE3DB;">
                <tr>
                  <td style="padding:11px 16px;font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#5C4031;font-weight:700;border-bottom:1px solid #EBE3DB;width:35%;">Prestation</td>
                  <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#3D2A1E;border-bottom:1px solid #EBE3DB;">${serviceTitle}</td>
                </tr>
                <tr>
                  <td style="padding:11px 16px;font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#5C4031;font-weight:700;border-bottom:1px solid #EBE3DB;">Date</td>
                  <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#3D2A1E;border-bottom:1px solid #EBE3DB;">${formattedDate} à ${time}</td>
                </tr>
                <tr>
                  <td style="padding:11px 16px;font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#5C4031;font-weight:700;">Référence</td>
                  <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#3D2A1E;">#${confirmationNumber}</td>
                </tr>
              </table>

              <!-- Message du barbier -->
              <div style="border-left:3px solid #5C4031;padding:12px 16px;background:#F9F6F2;margin-bottom:28px;">
                <p style="margin:0 0 4px;font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#5C4031;font-weight:700;">Message de Steevy</p>
                <p style="margin:0;font-size:14px;color:#3D2A1E;line-height:1.7;font-weight:500;">${message}</p>
              </div>

              <!-- CTA reprendre RDV -->
              <a href="https://s-wonder.vercel.app/prestations"
                style="display:inline-block;background:#5C4031;color:#F4EFEA;padding:14px 32px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:3px;text-decoration:none;">
                Reprendre rendez-vous →
              </a>
            </td></tr>

            <!-- FOOTER -->
            <tr><td style="background:#F9F6F2;padding:18px 36px;border-top:1px solid #EBE3DB;text-align:center;">
              <p style="margin:0;font-size:9px;color:#5C4031;text-transform:uppercase;letter-spacing:2px;font-weight:600;">
                Wonderclub · Barbier indépendant · Brie-Comte-Robert
              </p>
            </td></tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender:      { name: 'Wonderclub', email: SENDER_EMAIL },
        to:          [{ email: clientEmail, name: clientName }],
        subject:     `Wonderclub — Annulation de votre rendez-vous du ${formattedDate}`,
        htmlContent: html,
      }),
    });
    if (!r.ok) throw new Error(await r.text());
    return res.status(200).json({ sent: true });
  } catch (e) {
    console.error('[send-cancel] error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
