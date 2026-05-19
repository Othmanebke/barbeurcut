import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScissorsIcon, DiamondDivider } from '../components/BarberIcons';
import { fetchAppointments, cancelBooking, blockSlot, unblockSlot, fetchBlocks } from '../api/booking';
import { SUPABASE_READY } from '../lib/supabase';

const ADMIN_PWD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'wonder2024!';
const AUTH_KEY  = 'wc_admin_auth';

/* ── Jours ouverts : mer(3) jeu(4) ven(5) sam(6) ── */
const OPEN = new Set([3, 4, 5, 6]);
const DAY_SLOTS = [];
for (let h = 9; h < 19; h++) {
  if (h === 12) continue;
  DAY_SLOTS.push(`${String(h).padStart(2,'0')}:00`);
  DAY_SLOTS.push(`${String(h).padStart(2,'0')}:30`);
}

function dayKey(d) { return d.toISOString().slice(0, 10); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function monday(ref = new Date()) {
  const d = new Date(ref);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return d;
}
function fmt(dateStr, opts = { weekday:'long', day:'2-digit', month:'long' }) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', opts);
}

/* ══════════════ PIN SCREEN ══════════════════════════════════ */
function PinScreen({ onSuccess }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (val === ADMIN_PWD) {
      sessionStorage.setItem(AUTH_KEY, '1');
      onSuccess();
    } else {
      setErr(true); setVal('');
      setTimeout(() => setErr(false), 1400);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-[380px]">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <span className="inline-flex h-8 w-8 bg-brand text-dark text-[9px] font-black items-center justify-center">WC</span>
          <span className="text-[10px] font-black uppercase tracking-[0.45em] text-dark">Wonder Cut</span>
        </div>

        <h1 className="text-4xl font-black uppercase tracking-[-0.03em] text-dark mb-1">Dashboard</h1>
        <p className="text-sm text-muted font-medium mb-8">Espace réservé au barbier.</p>

        <form onSubmit={submit} className="space-y-3">
          <motion.input
            type="password" value={val}
            onChange={e => setVal(e.target.value)}
            placeholder="Mot de passe"
            autoFocus
            animate={err ? { x: [0,-8,8,-8,0] } : {}}
            className={`w-full border-2 bg-creamMid px-5 py-4 text-dark text-sm font-medium outline-none transition-colors placeholder:text-muted/40 ${
              err ? 'border-red-400' : 'border-beige focus:border-dark'
            }`}
          />
          {err && <p className="text-xs text-red-500 font-medium">Mot de passe incorrect</p>}
          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-dark py-4 text-[10px] font-black uppercase tracking-[0.4em] text-cream hover:bg-brand hover:text-dark transition-colors">
            <ScissorsIcon className="w-3.5 h-3.5" /> Connexion
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

/* ══════════════ STAT CARD ═══════════════════════════════════ */
function StatCard({ label, value, sub }) {
  return (
    <div className="bg-cream border border-beige p-5 flex flex-col gap-1">
      <p className="text-[8px] uppercase tracking-[0.5em] text-muted font-bold">{label}</p>
      <p className="text-3xl font-black text-dark leading-none">{value}</p>
      {sub && <p className="text-xs text-muted font-medium mt-0.5">{sub}</p>}
    </div>
  );
}

/* ══════════════ DASHBOARD ═══════════════════════════════════ */
function Dashboard() {
  const [weekStart, setWeekStart] = useState(() => monday());
  const [appointments, setAppts]  = useState([]);
  const [blocks, setBlocks]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [view, setView]           = useState('list');
  const [blockModal, setBlockModal]   = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  /* Only show Wed–Sat (open days) */
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    .filter(d => OPEN.has(d.getDay()));

  const from    = dayKey(weekStart);
  const to      = dayKey(addDays(weekStart, 6));
  const todayKey = dayKey(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([fetchAppointments({ from, to }), fetchBlocks({ from, to })]);
      setAppts(a); setBlocks(b);
    } finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const todayAppts = appointments.filter(a => a.date === todayKey);
  const revenue    = appointments.reduce((s, a) => s + (a.service_price ?? 0), 0);
  const apptAt     = (d, t) => appointments.find(a => a.date === d && a.time === t);
  const isBlocked  = (d, t) => blocks.some(b => b.date === d && (b.time === t || !b.time));
  const isFullDay  = (d)    => blocks.some(b => b.date === d && !b.time);

  const handleBlock = async ({ date, time, fullDay }) => {
    await blockSlot(date, fullDay ? null : time, 'Bloqué');
    setBlockModal(null); load();
  };
  const handleUnblock = async (date, time) => { await unblockSlot(date, time); load(); };
  const handleCancel  = async (appt) => {
    if (!confirm(`Annuler le RDV de ${appt.client_name} ?`)) return;
    await cancelBooking(appt.id); setDetailModal(null); load();
  };
  const handleBlockDay = async (date) => {
    if (!confirm(`Fermer le ${fmt(date, { weekday:'long', day:'2-digit', month:'long' })} ?`)) return;
    await blockSlot(date, null, 'Fermé'); load();
  };

  return (
    <div className="min-h-screen bg-creamMid">

      {/* ── Header ── */}
      <div className="bg-dark sticky top-0 z-40 border-b border-cream/8">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-7 w-7 bg-brand text-dark text-[9px] font-black items-center justify-center">WC</span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cream">Dashboard</span>
          </div>
          <button onClick={() => { sessionStorage.removeItem(AUTH_KEY); window.location.reload(); }}
            className="text-[9px] uppercase tracking-[0.4em] text-cream/30 hover:text-cream font-bold transition-colors">
            Déconnexion
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-5">

        {!SUPABASE_READY && (
          <div className="border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700 font-medium">
            ⚠️ Mode démo — configure Supabase dans .env pour voir les vrais RDV.
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Aujourd'hui"   value={todayAppts.length} sub={`RDV${todayAppts.length > 1 ? 's' : ''} en cours`} />
          <StatCard label="Cette semaine" value={appointments.length} sub="RDV confirmés" />
          <StatCard label="CA semaine"    value={`${revenue}€`} sub="estimé" />
        </div>

        {/* ── Nav semaine + toggle vue ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekStart(w => addDays(w, -7))}
              className="h-9 w-9 border border-beige bg-cream text-dark font-bold text-sm hover:border-dark transition-colors flex items-center justify-center">
              ←
            </button>
            <span className="text-sm font-black text-dark px-2">
              {fmt(from, { day:'2-digit', month:'short' })} — {fmt(to, { day:'2-digit', month:'short', year:'numeric' })}
            </span>
            <button onClick={() => setWeekStart(w => addDays(w, 7))}
              className="h-9 w-9 border border-beige bg-cream text-dark font-bold text-sm hover:border-dark transition-colors flex items-center justify-center">
              →
            </button>
            <button onClick={() => setWeekStart(monday())}
              className="h-9 px-3 border border-brand text-brand text-[9px] font-black uppercase tracking-[0.3em] hover:bg-brand hover:text-dark transition-all">
              Auj.
            </button>
          </div>

          <div className="flex border border-beige overflow-hidden bg-cream">
            {[['list','Liste'],['week','Calendrier']].map(([v, l]) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 text-[9px] uppercase tracking-[0.35em] font-black transition-colors ${
                  view === v ? 'bg-dark text-cream' : 'text-muted hover:text-dark'
                }`}>{l}
              </button>
            ))}
          </div>
        </div>

        {/* ── Contenu ── */}
        {loading ? (
          <div className="bg-cream border border-beige p-16 flex justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
              <ScissorsIcon className="w-7 h-7 text-brand" />
            </motion.div>
          </div>
        ) : view === 'list' ? (

          /* ══ VUE LISTE ══ */
          <div className="space-y-3">
            {weekDays.map(d => {
              const k       = dayKey(d);
              const dayAppts = appointments.filter(a => a.date === k).sort((a,b) => a.time.localeCompare(b.time));
              const isToday  = k === todayKey;
              const full     = isFullDay(k);

              return (
                <div key={k} className="bg-cream border border-beige overflow-hidden">
                  {/* Day header */}
                  <div className={`px-6 py-4 flex items-center justify-between ${isToday ? 'bg-dark' : 'bg-creamMid'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${dayAppts.length > 0 ? 'bg-brand' : 'bg-beige'}`} />
                      <p className={`text-sm font-black uppercase tracking-[-0.01em] ${isToday ? 'text-cream' : 'text-dark'}`}>
                        {fmt(k, { weekday:'long', day:'2-digit', month:'long' })}
                      </p>
                      {isToday && <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-brand">Aujourd'hui</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      {dayAppts.length > 0 && (
                        <span className={`text-[9px] font-bold ${isToday ? 'text-cream/50' : 'text-muted'}`}>
                          {dayAppts.length} RDV · {dayAppts.reduce((s,a)=>s+(a.service_price??0),0)}€
                        </span>
                      )}
                      <button onClick={() => handleBlockDay(k)}
                        className={`text-[8px] uppercase tracking-[0.3em] font-bold transition-colors ${
                          full ? 'text-red-400 hover:text-red-600' : 'text-muted/50 hover:text-red-400'
                        }`}>
                        {full ? 'Rouvrir' : 'Fermer'}
                      </button>
                    </div>
                  </div>

                  {/* Appointments */}
                  {dayAppts.length > 0 ? (
                    <div className="divide-y divide-beige/40">
                      {dayAppts.map(a => (
                        <motion.div key={a.id} whileHover={{ backgroundColor: 'rgba(240,233,214,0.6)' }}
                          className="px-6 py-4 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                          onClick={() => setDetailModal(a)}>
                          <div className="flex items-center gap-4">
                            <span className="text-xl font-black text-brand w-16 shrink-0">{a.time}</span>
                            <div>
                              <p className="text-sm font-black text-dark">{a.client_name}</p>
                              <p className="text-xs text-muted font-medium">{a.service_title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-black text-brand">{a.service_price_label}</span>
                            <a href={`tel:${a.client_phone}`} onClick={e => e.stopPropagation()}
                              className="text-[9px] border border-beige px-3 py-1.5 text-muted hover:border-dark hover:text-dark transition-colors font-bold">
                              Appeler
                            </a>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-5 text-sm text-muted/40 font-medium italic">
                      {full ? 'Journée fermée' : 'Aucun rendez-vous'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        ) : (

          /* ══ VUE CALENDRIER ══ */
          <div className="bg-cream border border-beige overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">

                {/* Day headers */}
                <div className={`grid gap-px bg-beige`} style={{ gridTemplateColumns: `80px repeat(${weekDays.length}, 1fr)` }}>
                  <div className="bg-creamMid py-3" />
                  {weekDays.map(d => {
                    const k = dayKey(d);
                    const isToday = k === todayKey;
                    const cnt = appointments.filter(a => a.date === k).length;
                    return (
                      <div key={k} className={`px-3 py-3 text-center ${isToday ? 'bg-dark' : 'bg-creamMid'}`}>
                        <p className={`text-[8px] uppercase tracking-[0.4em] font-bold ${isToday ? 'text-brand' : 'text-muted'}`}>
                          {fmt(k, { weekday:'short' })}
                        </p>
                        <p className={`text-xl font-black ${isToday ? 'text-cream' : 'text-dark'}`}>{d.getDate()}</p>
                        {cnt > 0 && <p className="text-[7px] text-brand font-black mt-0.5">{cnt} RDV</p>}
                        <button onClick={() => handleBlockDay(k)}
                          className="mt-1 text-[7px] text-muted/40 hover:text-red-400 transition-colors">
                          {isFullDay(k) ? '+ Ouvrir' : '✕ Fermer'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Time rows */}
                <div className="divide-y divide-beige/40">
                  {DAY_SLOTS.map(slot => (
                    <div key={slot} className={`grid gap-px bg-beige/30`} style={{ gridTemplateColumns: `80px repeat(${weekDays.length}, 1fr)` }}>
                      <div className="bg-cream py-3 px-3 flex items-center">
                        <span className="text-[9px] font-bold text-muted/50">{slot}</span>
                      </div>
                      {weekDays.map(d => {
                        const k = dayKey(d);
                        const appt    = apptAt(k, slot);
                        const blocked = isBlocked(k, slot);
                        const full    = isFullDay(k);
                        return (
                          <div key={k} onClick={() => !full && !appt && setBlockModal({ date: k, time: slot })}
                            className={`relative min-h-[44px] px-2 py-1.5 flex flex-col justify-center transition-colors ${
                              full     ? 'bg-beige/20 cursor-not-allowed'
                              : appt   ? 'bg-brand/12 border-l-2 border-brand cursor-pointer hover:bg-brand/20'
                              : blocked? 'bg-red-50 cursor-pointer'
                              :          'bg-cream cursor-pointer hover:bg-creamMid'
                            }`}>
                            {appt && (
                              <div onClick={e => { e.stopPropagation(); setDetailModal(appt); }}>
                                <p className="text-[9px] font-black text-dark truncate">{appt.client_name.split(' ')[0]}</p>
                                <p className="text-[7px] text-muted truncate">{appt.service_title.split(' ')[0]}</p>
                              </div>
                            )}
                            {blocked && !appt && (
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] text-red-400 font-bold">Bloqué</span>
                                <button onClick={e => { e.stopPropagation(); handleUnblock(k, slot); }}
                                  className="text-[8px] text-red-300 hover:text-red-500">✕</button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ MODAL — Bloquer ══ */}
      <AnimatePresence>
        {blockModal && (
          <motion.div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setBlockModal(null)}>
            <motion.div className="bg-cream w-full max-w-sm p-8 space-y-4"
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}>
              <div>
                <p className="text-[8px] uppercase tracking-[0.5em] text-brand font-bold mb-1">Bloquer</p>
                <p className="text-lg font-black text-dark">{fmt(blockModal.date)}</p>
                <p className="text-2xl font-black text-brand">{blockModal.time}</p>
              </div>
              <DiamondDivider className="text-dark" />
              <div className="space-y-2">
                <button onClick={() => handleBlock({ date: blockModal.date, time: blockModal.time, fullDay: false })}
                  className="w-full bg-dark text-cream py-3.5 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-brand hover:text-dark transition-colors">
                  Bloquer {blockModal.time}
                </button>
                <button onClick={() => handleBlock({ date: blockModal.date, fullDay: true })}
                  className="w-full border border-dark text-dark py-3.5 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-dark hover:text-cream transition-colors">
                  Bloquer toute la journée
                </button>
                <button onClick={() => setBlockModal(null)}
                  className="w-full text-muted text-[9px] uppercase tracking-[0.35em] font-bold py-2 hover:text-dark transition-colors">
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ MODAL — Détail RDV ══ */}
      <AnimatePresence>
        {detailModal && (
          <motion.div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDetailModal(null)}>
            <motion.div className="bg-cream w-full max-w-sm p-8"
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}>
              <p className="text-[8px] uppercase tracking-[0.5em] text-brand font-bold mb-5">Rendez-vous</p>
              <div className="space-y-3 mb-6">
                {[
                  { l: 'Client',      v: detailModal.client_name },
                  { l: 'Téléphone',   v: detailModal.client_phone },
                  { l: 'Prestation',  v: detailModal.service_title },
                  { l: 'Tarif',       v: detailModal.service_price_label },
                  { l: 'Date',        v: fmt(detailModal.date) },
                  { l: 'Horaire',     v: detailModal.time },
                  { l: 'Réf.',        v: detailModal.confirmation_number },
                ].map(r => (
                  <div key={r.l} className="flex justify-between gap-4 border-b border-beige/50 pb-3 last:border-0 last:pb-0">
                    <span className="text-[8px] uppercase tracking-[0.4em] text-muted font-bold shrink-0">{r.l}</span>
                    <span className="text-sm font-bold text-dark text-right capitalize">{r.v}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a href={`tel:${detailModal.client_phone}`}
                  className="flex items-center justify-center border border-brand text-brand py-3 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand hover:text-dark transition-all">
                  Appeler
                </a>
                <button onClick={() => handleCancel(detailModal)}
                  className="border border-red-300 text-red-500 py-3 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all">
                  Annuler RDV
                </button>
              </div>
              <button onClick={() => setDetailModal(null)}
                className="w-full mt-3 text-muted text-[9px] uppercase tracking-[0.35em] font-bold py-2 hover:text-dark transition-colors">
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════ EXPORT ══════════════════════════════════════ */
export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');
  if (!authed) return <PinScreen onSuccess={() => setAuthed(true)} />;
  return <Dashboard />;
}
