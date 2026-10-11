/* Vercel Serverless Function — notifications réservation Wonderclub
   · Email de confirmation → client (Brevo email, GRATUIT)
   · Email d'alerte → barbier (BARBER_EMAIL, sinon SENDER_EMAIL)
   · SMS de notif → barbier (Brevo SMS, payant — optionnel)

   Diagnostic sans envoi : GET /api/send-sms?check=1
*/

const ADDRESS_LINE1 = '1 Rue de la Madeleine';
const ADDRESS_LINE2 = '77170 Brie-Comte-Robert';
const SITE_URL      = 'https://s-wonder.vercel.app';
const MAPS_URL      = 'https://www.google.com/maps/search/?api=1&query=' +
                      encodeURIComponent(`${ADDRESS_LINE1}, ${ADDRESS_LINE2}`);

/* Palette du site */
const C = {
  brown:  '#5C4031',
  dark:   '#3D2A1E',
  cream:  '#F4EFEA',
  sand:   '#F9F6F2',
  line:   '#EBE3DB',
  muted:  '#8A7466',
};

function toE164(phone) {
  const clean = (phone ?? '').replace(/[\s.\-()]/g, '');
  if (clean.startsWith('+')) return clean;
  if (clean.startsWith('0')) return '+33' + clean.slice(1);
  return '+33' + clean;
}

function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatDate(date) {
  const s = new Date(date + 'T12:00:00')
    .toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* Lien "Ajouter à Google Agenda" (heure locale Paris via ctz) */
function calendarUrl({ title, date, time, duration }) {
  const [h, m] = (time ?? '00:00').split(':').map(Number);
  const start = new Date(Date.UTC(2000, 0, 1, h, m));
  const end   = new Date(start.getTime() + (Number(duration) || 30) * 60000);
  const hhmm  = d => String(d.getUTCHours()).padStart(2, '0') + String(d.getUTCMinutes()).padStart(2, '0') + '00';
  const day   = date.replace(/-/g, '');
  const params = new URLSearchParams({
    action:   'TEMPLATE',
    text:     `Wonderclub — ${title}`,
    dates:    `${day}T${hhmm(start)}/${day}T${hhmm(end)}`,
    ctz:      'Europe/Paris',
    location: `${ADDRESS_LINE1}, ${ADDRESS_LINE2}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/* ── Brevo ── */
async function brevo(apiKey, path, body) {
  const res = await fetch(`https://api.brevo.com/v3${path}`, {
    method:  body ? 'POST' : 'GET',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json' },
    body:    body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

function sendEmail(apiKey, { to, toName, subject, html, text, senderEmail, senderName, replyTo }) {
  return brevo(apiKey, '/smtp/email', {
    sender:      { name: senderName, email: senderEmail },
    to:          [{ email: to, ...(toName ? { name: toName } : {}) }],
    ...(replyTo ? { replyTo } : {}),
    subject,
    htmlContent: html,
    textContent: text,
  });
}

function sendSMS(apiKey, to, content, sender) {
  return brevo(apiKey, '/transactionalSMS/sms', { sender, recipient: to, content, type: 'transactional' });
}

/* ── Gabarit email mobile-first ──
   Une seule colonne, labels empilés au-dessus des valeurs,
   boutons pleine largeur (zone tactile ≥ 48px). */
function layout({ preheader, badge, body }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>Wonderclub</title>
<style>
  body{margin:0!important;padding:0!important;width:100%!important;-webkit-text-size-adjust:100%;}
  table{border-collapse:collapse;}
  a{text-decoration:none;}
  @media only screen and (max-width:480px){
    .wrap{padding:0!important;}
    .px{padding-left:22px!important;padding-right:22px!important;}
    .h1{font-size:26px!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.cream};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};">
<tr><td class="wrap" align="center" style="padding:24px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;">

    <tr><td class="px" style="background:${C.brown};padding:22px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:15px;font-weight:900;letter-spacing:5px;text-transform:uppercase;color:${C.cream};">Wonderclub</td>
        <td align="right"><span style="display:inline-block;border:1px solid rgba(244,239,234,.45);padding:6px 10px;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${C.cream};">${badge}</span></td>
      </tr></table>
    </td></tr>

    ${body}

    <tr><td class="px" style="background:${C.sand};padding:20px 32px;border-top:1px solid ${C.line};">
      <p style="margin:0;font-size:11px;line-height:1.6;color:${C.muted};text-align:center;">
        Wonderclub · Barbier indépendant<br>${ADDRESS_LINE1}, ${ADDRESS_LINE2}
      </p>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}

function rows(items) {
  return items.map(([label, value], i) => `
    <tr><td style="padding:14px 18px;${i < items.length - 1 ? `border-bottom:1px solid ${C.line};` : ''}">
      <div style="font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${C.muted};margin-bottom:4px;">${label}</div>
      <div style="font-size:16px;line-height:1.4;font-weight:600;color:${C.dark};">${value}</div>
    </td></tr>`).join('');
}

function button(href, label, primary = true) {
  const style = primary
    ? `background:${C.brown};color:${C.cream};border:2px solid ${C.brown};`
    : `background:#FFFFFF;color:${C.brown};border:2px solid ${C.brown};`;
  return `
    <tr><td style="padding:0 0 10px;">
      <a href="${href}" style="display:block;${style}padding:15px 12px;text-align:center;font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">${label}</a>
    </td></tr>`;
}

function clientEmailHtml(d) {
  const body = `
    <tr><td class="px" style="padding:30px 32px 8px;">
      <p style="margin:0 0 6px;font-size:14px;color:${C.muted};">Salut ${esc(d.clientName)} 👋</p>
      <h1 class="h1" style="margin:0;font-size:30px;line-height:1.1;font-weight:900;letter-spacing:-.5px;color:${C.brown};">C'est réservé.</h1>
    </td></tr>

    <tr><td class="px" style="padding:20px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.brown};">
        <tr><td style="padding:20px 18px;">
          <div style="font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:rgba(244,239,234,.65);margin-bottom:6px;">Ton rendez-vous</div>
          <div style="font-size:20px;font-weight:900;color:${C.cream};line-height:1.25;">${esc(d.formattedDate)}</div>
          <div style="font-size:34px;font-weight:900;color:${C.cream};line-height:1.1;margin-top:2px;">${esc(d.time)}</div>
        </td></tr>
      </table>
    </td></tr>

    <tr><td class="px" style="padding:12px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.sand};border:1px solid ${C.line};">
        ${rows([
          ['Prestation', `${esc(d.serviceTitle)} <span style="color:${C.muted};font-weight:500;">· ${esc(d.servicePriceLabel)}</span>`],
          ['Adresse',    `${ADDRESS_LINE1}<br>${ADDRESS_LINE2}`],
          ['Référence',  `#${esc(d.confirmationNumber)}`],
        ])}
      </table>
    </td></tr>

    <tr><td class="px" style="padding:20px 32px 6px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${button(MAPS_URL, 'Itinéraire')}
        ${button(d.calendarUrl, 'Ajouter à mon agenda', false)}
      </table>
    </td></tr>

    <tr><td class="px" style="padding:10px 32px 28px;">
      <p style="margin:0;font-size:14px;line-height:1.6;color:${C.dark};">
        Présente-toi directement à l'heure prévue. Paiement sur place.<br>
        <span style="color:${C.muted};">Un empêchement ? Réponds simplement à cet email.</span>
      </p>
    </td></tr>`;

  return layout({
    preheader: `${d.formattedDate} à ${d.time} — ${d.serviceTitle}`,
    badge:     '✓ Confirmé',
    body,
  });
}

function barberEmailHtml(d) {
  const tel = toE164(d.clientPhone);
  const wa  = tel.replace('+', '');
  const body = `
    <tr><td class="px" style="padding:30px 32px 8px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${C.muted};">Nouveau rendez-vous</p>
      <h1 class="h1" style="margin:0;font-size:30px;line-height:1.1;font-weight:900;letter-spacing:-.5px;color:${C.brown};">${esc(d.clientName)}</h1>
    </td></tr>

    <tr><td class="px" style="padding:20px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.brown};">
        <tr><td style="padding:20px 18px;">
          <div style="font-size:20px;font-weight:900;color:${C.cream};line-height:1.25;">${esc(d.formattedDate)}</div>
          <div style="font-size:34px;font-weight:900;color:${C.cream};line-height:1.1;margin-top:2px;">${esc(d.time)}</div>
        </td></tr>
      </table>
    </td></tr>

    <tr><td class="px" style="padding:12px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.sand};border:1px solid ${C.line};">
        ${rows([
          ['Prestation', `${esc(d.serviceTitle)} <span style="color:${C.muted};font-weight:500;">· ${esc(d.servicePriceLabel)}</span>`],
          ['Téléphone',  `<a href="tel:${esc(tel)}" style="color:${C.dark};">${esc(d.clientPhone)}</a>`],
          ['Email',      d.clientEmail ? esc(d.clientEmail) : '—'],
          ['Référence',  `#${esc(d.confirmationNumber)}`],
        ])}
      </table>
    </td></tr>

    <tr><td class="px" style="padding:20px 32px 22px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${button(`tel:${esc(tel)}`, 'Appeler')}
        ${button(`https://wa.me/${esc(wa)}`, 'WhatsApp', false)}
        ${button(`${SITE_URL}/admin`, 'Ouvrir le planning', false)}
      </table>
    </td></tr>`;

  return layout({
    preheader: `${d.clientName} · ${d.serviceTitle} · ${d.formattedDate} à ${d.time}`,
    badge:     'Nouveau',
    body,
  });
}

export default async function handler(req, res) {
  const BREVO_KEY    = process.env.BREVO_API_KEY;
  const SENDER_EMAIL = process.env.SENDER_EMAIL;   /* email vérifié dans Brevo */
  const BARBER_EMAIL = process.env.BARBER_EMAIL || SENDER_EMAIL;
  const BARBER_PHONE = process.env.BARBER_PHONE;
  const SMS_SENDER   = process.env.SMS_SENDER ?? 'Wonderclub';

  /* ── Diagnostic (aucun envoi) ── */
  if (req.method === 'GET' && req.query?.check) {
    const out = {
      env: {
        BREVO_API_KEY:   Boolean(BREVO_KEY),
        SENDER_EMAIL:    Boolean(SENDER_EMAIL),
        BARBER_EMAIL:    Boolean(process.env.BARBER_EMAIL),
        BARBER_PHONE:    Boolean(BARBER_PHONE),
      },
    };
    if (BREVO_KEY) {
      try {
        const acc = await brevo(BREVO_KEY, '/account');
        out.account = { ok: true, plan: acc.plan };
      } catch (e) { out.account = { ok: false, error: e.message }; }
      try {
        const { senders = [] } = await brevo(BREVO_KEY, '/senders');
        const match = senders.find(s => s.email?.toLowerCase() === SENDER_EMAIL?.toLowerCase());
        out.sender = match ? { found: true, active: match.active } : { found: false, count: senders.length };
      } catch (e) { out.sender = { error: e.message }; }
    }
    return res.status(200).json(out);
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body ?? {});
  const {
    clientPhone, clientEmail, clientName,
    serviceTitle, servicePriceLabel, serviceDuration,
    date, time, confirmationNumber,
  } = body;

  if (!BREVO_KEY)    return res.status(500).json({ error: 'BREVO_API_KEY missing' });
  if (!SENDER_EMAIL) return res.status(500).json({ error: 'SENDER_EMAIL missing' });
  if (!date || !time) return res.status(400).json({ error: 'date/time missing' });

  const d = {
    clientPhone, clientEmail, clientName, serviceTitle, servicePriceLabel,
    time, confirmationNumber,
    formattedDate: formatDate(date),
    calendarUrl:   calendarUrl({ title: serviceTitle, date, time, duration: serviceDuration }),
  };

  const tasks = [];

  /* 1. Email client */
  if (clientEmail) {
    tasks.push(['emailClient', sendEmail(BREVO_KEY, {
      to:          clientEmail,
      toName:      clientName,
      subject:     `✓ RDV confirmé — ${d.formattedDate} à ${time}`,
      html:        clientEmailHtml(d),
      text:        `Salut ${clientName},\n\nTon rendez-vous Wonderclub est confirmé.\n\n` +
                   `${serviceTitle} (${servicePriceLabel})\n${d.formattedDate} à ${time}\n` +
                   `${ADDRESS_LINE1}, ${ADDRESS_LINE2}\nRéférence : #${confirmationNumber}\n\n` +
                   `Itinéraire : ${MAPS_URL}\n`,
      senderEmail: SENDER_EMAIL,
      senderName:  'Wonderclub',
      replyTo:     BARBER_EMAIL ? { email: BARBER_EMAIL, name: 'Wonderclub' } : undefined,
    })]);
  }

  /* 2. Email barbier */
  if (BARBER_EMAIL) {
    tasks.push(['emailBarber', sendEmail(BREVO_KEY, {
      to:          BARBER_EMAIL,
      subject:     `Nouveau RDV · ${clientName} · ${d.formattedDate} ${time}`,
      html:        barberEmailHtml(d),
      text:        `Nouveau RDV\n${clientName} — ${serviceTitle} (${servicePriceLabel})\n` +
                   `${d.formattedDate} à ${time}\nTél : ${clientPhone}\nEmail : ${clientEmail || '—'}\n` +
                   `Réf : #${confirmationNumber}\n`,
      senderEmail: SENDER_EMAIL,
      senderName:  'Wonderclub Réservations',
      replyTo:     clientEmail ? { email: clientEmail, name: clientName } : undefined,
    })]);
  }

  /* 3. SMS barbier (nécessite crédits Brevo) */
  if (BARBER_PHONE) {
    tasks.push(['smsBarber', sendSMS(
      BREVO_KEY,
      toE164(BARBER_PHONE),
      `Nouveau RDV Wonderclub\n${clientName} - ${serviceTitle} (${servicePriceLabel})\n` +
      `${d.formattedDate} à ${time}\nTel: ${clientPhone}`,
      SMS_SENDER,
    )]);
  }

  /* Envois en parallèle — un échec n'empêche pas les autres */
  const settled = await Promise.allSettled(tasks.map(([, p]) => p));
  const results = {}, errors = [];
  settled.forEach((r, i) => {
    const type = tasks[i][0];
    if (r.status === 'fulfilled') results[type] = 'sent';
    else {
      results[type] = 'failed';
      errors.push({ type, error: r.reason?.message });
      console.error(`[send-notification] ${type} error:`, r.reason?.message);
    }
  });

  const emailFailed = errors.some(e => e.type.startsWith('email'));
  return res.status(emailFailed ? 502 : 200).json({ success: !emailFailed, results, errors });
}
