import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchAppointmentsRange } from '../api/booking';
import { supabase, SUPABASE_READY } from '../lib/supabase';
import { serviceCategories } from '../data/services';
import { ScissorsIcon } from './BarberIcons';

const MONTHS_COMPARED = 6;
const HISTORY_PAGE    = 25;

const SERVICE_TITLES = Object.fromEntries(
  serviceCategories.flatMap(c => c.services).map(s => [s.id, s.title]),
);

function dayKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function monthKey(d) { return dayKey(d).slice(0, 7); }
function addMonths(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
function monthLabel(d, opts = { month: 'long', year: 'numeric' }) {
  return d.toLocaleDateString('fr-FR', opts);
}
/* RDV de test ignorés dans les stats :
   - les tests du lancement (mai 2026), par identifiant exact ;
   - à l'avenir, tout RDV dont le nom contient « test ». */
const TEST_BOOKING_IDS = new Set([
  'fe3b516e-7970-4867-b4a2-0059262c4a0e', '65acf397-6dca-4e19-89f4-24f82fe295d8',
  'ef33fd6e-a364-47fd-b80c-8605a0c60fb6', 'f8bf2c7e-19ac-4059-996a-01c286087b4a',
  'ee3144ba-1a11-42d8-809a-baf29d089f64', '318085d6-d7c0-4419-aaca-313252b92931',
  'd2e36684-9be7-4a29-8d02-f60edd4ec023', 'cc9b3a71-8a7d-4ef7-9463-f65ce26a41ec',
  'fc1eb90d-30d1-4710-82de-90d0a69ad87d', '8f3c2db8-80e3-40fd-89ed-26e3e2187cc5',
]);
const isTestBooking = (a) => TEST_BOOKING_IDS.has(a.id) || /test/i.test(a.client_name ?? '');

const euro = (n) => `${Math.round(n).toLocaleString('fr-FR')} €`;
const price = (a) => a.service_price ?? 0;

/* Variation en % (null si pas de base de comparaison) */
function delta(cur, prev) {
  if (!prev) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

function DeltaBadge({ value }) {
  if (value === null) return <span className="text-[10px] font-bold text-cream/40">— vs mois préc.</span>;
  const up = value >= 0;
  return (
    <span className={`text-[10px] font-black ${up ? 'text-emerald-300' : 'text-red-300'}`}>
      {up ? '▲' : '▼'} {Math.abs(value)} % <span className="font-bold text-cream/40">vs mois préc.</span>
    </span>
  );
}

function Kpi({ label, value, sub }) {
  return (
    <div className="bg-dark border border-white/10 p-5 sm:p-6 flex flex-col justify-between min-h-[120px] shadow-[0_1px_2px_rgba(46,31,20,0.04)]">
      <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-cream/60">{label}</p>
      <div>
        <p className="font-black text-cream leading-none text-3xl sm:text-4xl tabular-nums">{value}</p>
        {sub && <div className="mt-2">{sub}</div>}
      </div>
    </div>
  );
}

function Card({ title, right, children }) {
  return (
    <section className="bg-dark border border-white/10">
      <header className="px-5 sm:px-6 py-4 border-b border-white/10 bg-darkMid flex items-center justify-between gap-3">
        <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-cream">{title}</h2>
        {right}
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export default function AdminStats() {
  const [month, setMonth]     = useState(() => addMonths(new Date(), 0));
  const [appts, setAppts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [shown, setShown]     = useState(HISTORY_PAGE);

  const rangeFrom = dayKey(addMonths(month, -(MONTHS_COMPARED - 1)));
  const rangeTo   = dayKey(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  const todayKey  = dayKey(new Date());
  const isCurrentMonth = monthKey(month) === monthKey(new Date());

  const load = useCallback(async () => {
    setError('');
    try {
      const all = await fetchAppointmentsRange({ from: rangeFrom, to: rangeTo });
      setAppts(all.filter(a => !isTestBooking(a)));
    }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [rangeFrom, rangeTo]);

  useEffect(() => { setLoading(true); load(); }, [load]);
  useEffect(() => { setShown(HISTORY_PAGE); }, [month, search]);

  useEffect(() => {
    if (!SUPABASE_READY) return;
    const ch = supabase
      .channel('admin-stats-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [load]);

  const stats = useMemo(() => {
    const mk       = monthKey(month);
    const prevMk   = monthKey(addMonths(month, -1));
    const cur      = appts.filter(a => a.date.startsWith(mk));
    const prev     = appts.filter(a => a.date.startsWith(prevMk));
    const revenue  = cur.reduce((s, a) => s + price(a), 0);
    const prevRev  = prev.reduce((s, a) => s + price(a), 0);
    const done     = cur.filter(a => a.date < todayKey || (a.date === todayKey && a.time <= new Date().toTimeString().slice(0, 5)));
    const doneRev  = done.reduce((s, a) => s + price(a), 0);
    const priced   = cur.filter(a => a.service_price != null);
    const onQuote  = cur.length - priced.length;

    /* Répartition par prestation */
    const byService = {};
    for (const a of cur) {
      const id = a.service_id || a.service_title;
      if (!byService[id]) byService[id] = { id, title: SERVICE_TITLES[a.service_id] ?? a.service_title, count: 0, revenue: 0 };
      byService[id].count   += 1;
      byService[id].revenue += price(a);
    }
    const services = Object.values(byService).sort((a, b) => b.count - a.count || b.revenue - a.revenue);

    /* Comparaison mensuelle */
    const months = Array.from({ length: MONTHS_COMPARED }, (_, i) => {
      const d  = addMonths(month, i - (MONTHS_COMPARED - 1));
      const k  = monthKey(d);
      const ms = appts.filter(a => a.date.startsWith(k));
      return { key: k, date: d, count: ms.length, revenue: ms.reduce((s, a) => s + price(a), 0) };
    });

    return {
      cur, revenue, prevRev, count: cur.length, prevCount: prev.length,
      doneRev, upcomingRev: revenue - doneRev,
      avg: priced.length ? revenue / priced.length : 0,
      onQuote, services, months,
    };
  }, [appts, month, todayKey]);

  const history = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...stats.cur]
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
      .filter(a => !q || [a.client_name, a.client_phone, a.confirmation_number, a.service_title]
        .some(v => (v ?? '').toLowerCase().includes(q)));
  }, [stats.cur, search]);

  const maxMonthRev = Math.max(1, ...stats.months.map(m => m.revenue));

  return (
    <div className="space-y-5">

      {/* Sélecteur de mois */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setMonth(m => addMonths(m, -1))} aria-label="Mois précédent"
            className="h-9 w-9 bg-dark border border-white/10 text-cream font-bold hover:border-sky transition-colors">←</button>
          <span className="text-base font-black text-ink px-2 capitalize min-w-[150px] text-center">{monthLabel(month)}</span>
          <button onClick={() => setMonth(m => addMonths(m, 1))} aria-label="Mois suivant"
            className="h-9 w-9 bg-dark border border-white/10 text-cream font-bold hover:border-sky transition-colors">→</button>
          {!isCurrentMonth && (
            <button onClick={() => setMonth(addMonths(new Date(), 0))}
              className="h-9 px-3 border border-denim text-denim text-[9px] font-black uppercase tracking-[0.3em] hover:bg-denim hover:text-white transition-colors">
              Ce mois
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="border border-red-300 bg-red-50 px-5 py-3 text-sm text-red-800 font-medium">Erreur : {error}</div>
      )}

      {loading ? (
        <div className="bg-dark border border-white/10 p-16 flex justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
            <ScissorsIcon className="w-7 h-7 text-sky" />
          </motion.div>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi label="Chiffre d'affaires" value={euro(stats.revenue)}
              sub={<DeltaBadge value={delta(stats.revenue, stats.prevRev)} />} />
            <Kpi label="Rendez-vous" value={stats.count}
              sub={<DeltaBadge value={delta(stats.count, stats.prevCount)} />} />
            <Kpi label="Panier moyen" value={euro(stats.avg)}
              sub={<span className="text-[10px] font-bold text-cream/50">par RDV avec tarif</span>} />
            <Kpi label={isCurrentMonth ? 'Réalisé / à venir' : 'Réalisé'}
              value={euro(stats.doneRev)}
              sub={<span className="text-[10px] font-bold text-cream/50">
                {stats.upcomingRev > 0 ? `+ ${euro(stats.upcomingRev)} à venir` : 'tous RDV passés'}
              </span>} />
          </div>
          {stats.onQuote > 0 && (
            <p className="text-xs text-inkSoft font-medium">
              ℹ️ {stats.onQuote} RDV « sur devis » ce mois-ci ne sont pas comptés dans le chiffre d'affaires (prix non fixé).
            </p>
          )}

          <div className="grid lg:grid-cols-5 gap-5">
            {/* Répartition + CA par prestation */}
            <div className="lg:col-span-3">
              <Card title="Prestations du mois">
                {stats.services.length === 0 ? (
                  <p className="text-sm text-cream/60 italic">Aucun rendez-vous ce mois-ci.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 text-[8px] uppercase tracking-[0.35em] font-bold text-cream/50">
                      <span>Prestation</span><span className="w-14 text-right">Part</span><span className="w-20 text-right">CA</span>
                    </div>
                    {stats.services.map(s => {
                      const pct = Math.round((s.count / stats.count) * 100);
                      return (
                        <div key={s.id}>
                          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 items-baseline">
                            <p className="text-sm font-bold text-cream truncate">
                              {s.title} <span className="text-xs font-semibold text-cream/60">· {s.count} RDV</span>
                            </p>
                            <span className="w-14 text-right text-sm font-black text-cream tabular-nums">{pct} %</span>
                            <span className="w-20 text-right text-sm font-bold text-cream/60 tabular-nums">
                              {s.revenue ? euro(s.revenue) : 'devis'}
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 bg-darkMid overflow-hidden">
                            <motion.div className="h-full bg-denim" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            {/* Comparaison mensuelle */}
            <div className="lg:col-span-2">
              <Card title={`Comparaison ${MONTHS_COMPARED} mois`}>
                <div className="flex items-end gap-2 h-48">
                  {stats.months.map(m => {
                    const sel = m.key === monthKey(month);
                    const h   = Math.max(2, Math.round((m.revenue / maxMonthRev) * 100));
                    return (
                      <button key={m.key} onClick={() => setMonth(m.date)} title={`${monthLabel(m.date)} : ${euro(m.revenue)} · ${m.count} RDV`}
                        className="flex-1 h-full flex flex-col justify-end items-center gap-1 group">
                        <span className={`text-[10px] font-black tabular-nums ${sel ? 'text-cream' : 'text-cream/60'}`}>
                          {m.revenue ? `${Math.round(m.revenue)}€` : ''}
                        </span>
                        <motion.div className={`w-full ${sel ? 'bg-denim' : 'bg-white/20 group-hover:bg-white/30'} transition-colors`}
                          initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-2 border-t border-white/10 pt-2">
                  {stats.months.map(m => (
                    <div key={m.key} className="flex-1 text-center">
                      <p className={`text-[9px] uppercase font-black ${m.key === monthKey(month) ? 'text-cream' : 'text-cream/50'}`}>
                        {monthLabel(m.date, { month: 'short' }).replace('.', '')}
                      </p>
                      <p className="text-[9px] font-bold text-cream/50 tabular-nums">{m.count} RDV</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Historique */}
          <Card title="Historique des réservations"
            right={<span className="text-[10px] font-bold text-cream/60">{history.length} RDV</span>}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un client, téléphone, réf…"
              className="w-full mb-4 bg-darkMid border border-white/10 px-4 py-2.5 text-sm text-cream font-medium outline-none focus:border-sky placeholder:text-cream/40" />
            {history.length === 0 ? (
              <p className="text-sm text-cream/60 italic">Aucune réservation{search ? ' pour cette recherche' : ' ce mois-ci'}.</p>
            ) : (
              <>
                <div className="overflow-x-auto -mx-5 sm:-mx-6">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="text-left text-[8px] uppercase tracking-[0.35em] text-cream/50">
                        <th className="font-bold px-5 sm:px-6 pb-2">Date</th>
                        <th className="font-bold pb-2">Client</th>
                        <th className="font-bold pb-2">Prestation</th>
                        <th className="font-bold pb-2 text-right">Prix</th>
                        <th className="font-bold pb-2 px-5 sm:px-6 text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {history.slice(0, shown).map(a => {
                        const past = a.date < todayKey;
                        return (
                          <tr key={a.id} className="hover:bg-darkMid">
                            <td className="px-5 sm:px-6 py-3 whitespace-nowrap">
                              <span className="font-bold text-cream capitalize">
                                {new Date(a.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}
                              </span>
                              <span className="text-cream/60 font-semibold"> · {a.time}</span>
                            </td>
                            <td className="py-3">
                              <p className="font-bold text-cream">{a.client_name}</p>
                              <p className="text-xs text-cream/60">{a.client_phone}</p>
                            </td>
                            <td className="py-3 text-cream/60 font-medium">{a.service_title}</td>
                            <td className="py-3 text-right font-black text-cream tabular-nums whitespace-nowrap">{a.service_price_label}</td>
                            <td className="px-5 sm:px-6 py-3 text-right">
                              <span className={`text-[8px] font-black uppercase tracking-[0.25em] px-2 py-1 ${
                                past ? 'bg-darkMid text-cream/60' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40'
                              }`}>
                                {past ? 'Passé' : a.date === todayKey ? 'Auj.' : 'À venir'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {history.length > shown && (
                  <button onClick={() => setShown(n => n + HISTORY_PAGE)}
                    className="mt-4 w-full border border-white/10 py-3 text-[9px] font-black uppercase tracking-[0.35em] text-cream hover:border-sky transition-colors">
                    Voir plus ({history.length - shown})
                  </button>
                )}
              </>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
