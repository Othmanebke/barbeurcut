/**
 * Cron : chaque lundi à 7h00 UTC
 * Envoie au barbier un résumé SMS de sa semaine.
 *
 * Supabase Dashboard > Edge Functions > Cron :
 *   schedule : "0 7 * * 1"   (lundi 7h UTC)
 *   function  : weekly-summary
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')!;
const BARBER_PHONE  = Deno.env.get('BARBER_PHONE')!;
const SMS_SENDER    = Deno.env.get('SMS_SENDER') ?? 'WonderCut';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

/* Lundi de cette semaine → Samedi */
function getWeekRange() {
  const now   = new Date();
  const day   = now.getDay(); // 0=dim, 1=lun...
  const diff  = (day === 0 ? -6 : 1 - day); // décalage vers lundi
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);
  return {
    start: monday.toISOString().slice(0, 10),
    end:   saturday.toISOString().slice(0, 10),
  };
}

function fmt(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', {
    weekday: 'short', day: '2-digit', month: 'short',
  });
}

async function sendSMS(to: string, content: string) {
  const res = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: SMS_SENDER, recipient: to, content, type: 'transactional' }),
  });
  if (!res.ok) throw new Error(await res.text());
}

serve(async () => {
  const { start, end } = getWeekRange();

  const { data: appts } = await supabase
    .from('appointments')
    .select('date, time, client_name, service_title, service_price_label')
    .gte('date', start)
    .lte('date', end)
    .eq('status', 'confirmed')
    .order('date').order('time');

  const list = appts ?? [];

  /* Grouper par jour */
  const byDay: Record<string, typeof list> = {};
  for (const a of list) {
    if (!byDay[a.date]) byDay[a.date] = [];
    byDay[a.date].push(a);
  }

  /* Estimer le CA */
  const revenue = list.reduce((sum, a) => sum + (a.service_price ?? 0), 0);

  /* Construire le SMS */
  const dayLines = Object.entries(byDay)
    .map(([date, dayAppts]) =>
      `${fmt(date)} : ${dayAppts.map(a => `${a.time} ${a.client_name.split(' ')[0]}`).join(' / ')}`
    )
    .join('\n');

  const msg =
    `💈 Wonder Cut — Semaine du ${fmt(start)}\n` +
    `${list.length} RDV · ~${revenue}€\n` +
    `────────────\n` +
    (dayLines || 'Aucun RDV cette semaine.') +
    `\n────────────\nBonne semaine !`;

  await sendSMS(BARBER_PHONE, msg);

  console.log(`weekly-summary: ${list.length} appts, revenue ~${revenue}€`);
  return new Response(JSON.stringify({ sent: true, count: list.length, revenue }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
