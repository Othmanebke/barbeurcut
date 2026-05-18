import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScissorsIcon, CombIcon, RazorIcon, DiamondDivider } from '../components/BarberIcons';
import { fetchAppointments, cancelBooking, blockSlot, unblockSlot, fetchBlocks } from '../api/booking';
import { SUPABASE_READY } from '../lib/supabase';

/* ─── PIN Auth ──────────────────────────────────────────────── */
const ADMIN_PWD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'wonder2024!';
const AUTH_KEY  = 'wc_admin_auth';

function PinScreen({ onSuccess }) {
  const [val, setVal]   = useState('');
  const [err, setErr]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (val === ADMIN_PWD) {
      sessionStorage.setItem(AUTH_KEY, '1');
      onSuccess();
    } else {
      setErr(true);
      setVal('');
      setTimeout(() => setErr(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center grain px-6"
         style={{ paddingTop: 'var(--navbar-h, 72px)' }}>
      <ScissorsIcon className="absolute top-24 right-16 w-40 h-40 text-brand/5 pointer-events-none hidden lg:block" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-8">
          <span className="inline-flex h-9 w-9 items-center justify-center bg-brand text-dark text-[9px] font-black">WC</span>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cream">Dashboard Barbier</span>
        </div>

        <h1 className="text-3xl font-black uppercase tracking-[-0.03em] text-cream mb-2">Accès sécurisé</h1>
        <p className="text-sm text-cream/40 font-medium mb-8">Entre ton mot de passe pour accéder à ton calendrier.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.input
            type="password"
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder="Mot de passe"
            autoFocus
            animate={err ? { x: [0, -8, 8, -8, 0] } : {}}
            transition={{ duration: 0.3 }}
            className={`w-full border-2 px-5 py-4 text-cream bg-white/5 placeholder:text-cream/20 outline-none text-sm font-medium transition-colors ${
              err ? 'border-red-500 bg-red-500/5' : 'border-cream/15 focus:border-brand'
            }`}
          />
          {err && <p className="text-xs text-red-400 font-medium">Mot de passe incorrect.</p>}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 bg-brand py-4 text-[10px] font-black uppercase tracking-[0.35em] text-dark hover:bg-brandDark transition-colors"
          >
            <ScissorsIcon className="w-3.5 h-3.5" /> Connexion
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Helpers date ──────────────────────────────────────────── */
function dayKey(d) { return d.toISOString().slice(0, 10); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function monday(ref = new Date()) {
  const d = new Date(ref);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return d;
}
function fmtFR(dateStr, opts) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', opts);
}

const BASE_SLOTS = [];
for (let h = 9; h < 19; h++) {
  BASE_SLOTS.push(`${String(h).padStart(2,'0')}:00`);
  BASE_SLOTS.push(`${String(h).padStart(2,'0')}:30`);
}

/* ─── Dashboard ─────────────────────────────────────────────── */
function Dashboard() {
  const [weekStart, setWeekStart]       = useState(() => monday());
  const [appointments, setAppointments] = useState([]);
  const [blocks, setBlocks]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [view, setView]                 = useState('week');   // 'week' | 'list'
  const [blockModal, setBlockModal]     = useState(null);     // { date, time }
  const [detailModal, setDetailModal]   = useState(null);     // appointment

  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)); // lun–sam
  const from = dayKey(weekStart);
  const to   = dayKey(addDays(weekStart, 5));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [appts, blks] = await Promise.all([
        fetchAppointments({ from, to }),
        fetchBlocks({ from, to }),
      ]);
      setAppointments(appts);
      setBlocks(blks);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  /* Quick stats */
  const totalWeek = appointments.length;
  const todayKey  = dayKey(new Date());
  const todayAppts = appointments.filter(a => a.date === todayKey);
  const revenue   = appointments.reduce((s, a) => s + (a.service_price ?? 0), 0);

  /* Lookup helpers */
  const apptAt = (date, time) => appointments.find(a => a.date === date && a.time === time);
  const isBlocked = (date, time) => blocks.some(b => b.date === date && (b.time === time || !b.time));
  const isFullDay = (date) => blocks.some(b => b.date === date && !b.time);

  /* Handlers */
  const handleCellClick = (date, time) => {
    const appt = apptAt(date, time);
    if (appt) { setDetailModal(appt); return; }
    setBlockModal({ date, time });
  };

  const handleBlock = async ({ date, time, fullDay }) => {
    await blockSlot(date, fullDay ? null : time, 'Bloqué');
    setBlockModal(null);
    load();
  };

  const handleUnblock = async (date, time) => {
    await unblockSlot(date, time);
    load();
  };

  const handleCancel = async (appt) => {
    if (!confirm(`Annuler le RDV de ${appt.client_name} ?`)) return;
    await cancelBooking(appt.id);
    setDetailModal(null);
    load();
  };

  const handleBlockDay = async (date) => {
    if (!confirm(`Bloquer toute la journée du ${fmtFR(date, { weekday:'long', day:'2-digit', month:'long' })} ?`)) return;
    await blockSlot(date, null, 'Journée fermée');
    load();
  };

  return (
    <div className="min-h-screen bg-cream" style={{ paddingTop: 'var(--navbar-h, 72px)' }}>

      {/* ── Top bar ── */}
      <div className="bg-dark border-b border-cream/8">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center bg-brand text-dark text-[9px] font-black">WC</span>
            <div>
              <p className="text-[9px] uppercase tracking-[0.45em] text-cream/30 font-medium">Dashboard</p>
              <p className="text-sm font-black text-cream">Wonder Cut</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Stats */}
            {[
              { label: "Aujourd'hui", val: todayAppts.length },
              { label: 'Cette semaine', val: totalWeek },
              { label: 'CA estimé', val: `${revenue}€` },
            ].map(s => (
              <div key={s.label} className="text-center hidden sm:block">
                <p className="text-lg font-black text-brand">{s.val}</p>
                <p className="text-[8px] uppercase tracking-[0.35em] text-cream/30">{s.label}</p>
              </div>
            ))}
            <button
              onClick={() => { sessionStorage.removeItem(AUTH_KEY); window.location.reload(); }}
              className="text-[9px] uppercase tracking-[0.35em] text-cream/30 hover:text-cream font-bold transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">

        {/* ── Week nav + view toggle ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setWeekStart(w => addDays(w, -7))}
              className="border border-beige px-3 py-2 text-sm font-bold text-dark hover:border-dark transition-colors">←</button>
            <span className="text-sm font-black text-dark">
              Semaine du {fmtFR(from, { day:'2-digit', month:'short' })} — {fmtFR(to, { day:'2-digit', month:'short', year:'numeric' })}
            </span>
            <button onClick={() => setWeekStart(w => addDays(w, 7))}
              className="border border-beige px-3 py-2 text-sm font-bold text-dark hover:border-dark transition-colors">→</button>
            <button onClick={() => setWeekStart(monday())}
              className="border border-brand px-3 py-2 text-[9px] uppercase tracking-[0.3em] font-black text-brand hover:bg-brand hover:text-dark transition-all">
              Auj.
            </button>
          </div>
          <div className="flex border border-beige overflow-hidden">
            {['week','list'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 text-[9px] uppercase tracking-[0.35em] font-black transition-colors ${
                  view === v ? 'bg-dark text-cream' : 'text-muted hover:text-dark'
                }`}
              >
                {v === 'week' ? 'Calendrier' : 'Liste'}
              </button>
            ))}
          </div>
        </div>

        {!SUPABASE_READY && (
          <div className="mb-5 border border-amber-200 bg-amber-50 px-5 py-3 flex items-center gap-3">
            <span className="text-amber-500">⚠️</span>
            <p className="text-sm text-amber-700 font-medium">
              Mode démo — Supabase non configuré. Configure <code className="bg-amber-100 px-1">.env</code> pour activer les vraies données.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
              <ScissorsIcon className="w-8 h-8 text-brand" />
            </motion.div>
          </div>
        ) : view === 'week' ? (
          /* ══════ VUE CALENDRIER ══════ */
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-px bg-beige mb-px">
                {weekDays.map(d => {
                  const k = dayKey(d);
                  const isToday = k === todayKey;
                  const full = isFullDay(k);
                  const cnt = appointments.filter(a => a.date === k).length;
                  return (
                    <div key={k} className={`px-3 py-3 text-center ${isToday ? 'bg-dark' : 'bg-creamMid'}`}>
                      <p className={`text-[8px] uppercase tracking-[0.4em] font-bold ${isToday ? 'text-brand' : 'text-muted'}`}>
                        {fmtFR(k, { weekday:'short' })}
                      </p>
                      <p className={`text-xl font-black ${isToday ? 'text-cream' : 'text-dark'}`}>
                        {d.getDate()}
                      </p>
                      {cnt > 0 && <p className="text-[8px] text-brand font-bold">{cnt} RDV</p>}
                      {full && <p className="text-[8px] text-red-400 font-bold">Fermé</p>}
                      <button
                        onClick={() => handleBlockDay(k)}
                        className="mt-1 text-[7px] uppercase tracking-wider text-muted/50 hover:text-red-400 transition-colors"
                      >
                        {full ? '+ Rouvrir' : '✕ Fermer'}
                      </button>
                    </div>
                  );
                })}
                <div className="bg-beige/50 px-3 py-3 text-center">
                  <p className="text-[8px] uppercase tracking-[0.4em] font-bold text-muted/40">DIM</p>
                  <p className="text-xl font-black text-muted/25">
                    {addDays(weekStart, 6).getDate()}
                  </p>
                  <p className="text-[8px] text-muted/30 font-bold">Fermé</p>
                </div>
              </div>

              {/* Time slots rows */}
              <div className="grid gap-px bg-beige/40">
                {BASE_SLOTS.map(slot => (
                  <div key={slot} className="grid grid-cols-7 gap-px bg-beige/40">
                    {weekDays.map(d => {
                      const k = dayKey(d);
                      const appt = apptAt(k, slot);
                      const blocked = isBlocked(k, slot);
                      const full = isFullDay(k);
                      const isToday = k === todayKey;

                      return (
                        <div
                          key={k}
                          onClick={() => !full && handleCellClick(k, slot)}
                          className={`relative min-h-[52px] flex flex-col justify-center px-2 py-1.5 transition-all duration-150 ${
                            full     ? 'bg-beige/30 cursor-not-allowed'
                            : appt   ? 'bg-brand/15 border-l-2 border-brand cursor-pointer hover:bg-brand/25'
                            : blocked? 'bg-red-50 cursor-pointer'
                            : isToday? 'bg-cream cursor-pointer hover:bg-brand/8'
                            :          'bg-cream cursor-pointer hover:bg-creamMid'
                          }`}
                        >
                          <p className={`text-[9px] font-bold ${appt ? 'text-brand' : blocked ? 'text-red-400' : 'text-muted/40'}`}>
                            {slot}
                          </p>
                          {appt && (
                            <p className="text-[9px] font-black text-dark truncate">
                              {appt.client_name.split(' ')[0]} · {appt.service_title.split(' ')[0]}
                            </p>
                          )}
                          {blocked && !appt && (
                            <p className="text-[8px] text-red-400/60 font-bold">Bloqué</p>
                          )}
                          {blocked && !appt && (
                            <button
                              onClick={e => { e.stopPropagation(); handleUnblock(k, slot); }}
                              className="absolute top-1 right-1 text-[7px] text-red-300 hover:text-red-500 font-black"
                            >✕</button>
                          )}
                        </div>
                      );
                    })}
                    {/* Sunday — always closed */}
                    <div className="bg-beige/15 min-h-[52px]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ══════ VUE LISTE ══════ */
          <div className="space-y-4">
            {weekDays.map(d => {
              const k = dayKey(d);
              const dayAppts = appointments.filter(a => a.date === k);
              return (
                <div key={k} className="border border-beige overflow-hidden">
                  <div className={`px-6 py-4 flex items-center justify-between ${k === todayKey ? 'bg-dark' : 'bg-creamMid'}`}>
                    <div className="flex items-center gap-3">
                      <ScissorsIcon className={`w-4 h-4 ${k === todayKey ? 'text-brand' : 'text-brand/50'}`} />
                      <p className={`text-sm font-black uppercase ${k === todayKey ? 'text-cream' : 'text-dark'}`}>
                        {fmtFR(k, { weekday:'long', day:'2-digit', month:'long' })}
                      </p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-[0.3em] ${dayAppts.length ? 'text-brand' : 'text-muted/40'}`}>
                      {dayAppts.length ? `${dayAppts.length} RDV` : 'Libre'}
                    </span>
                  </div>
                  {dayAppts.length > 0 ? (
                    <div className="divide-y divide-beige/60 bg-cream">
                      {dayAppts.map(a => (
                        <div key={a.id} className="px-6 py-4 flex items-center justify-between gap-4 group hover:bg-creamMid transition-colors">
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-black text-brand w-14 shrink-0">{a.time}</span>
                            <div>
                              <p className="text-sm font-black text-dark">{a.client_name}</p>
                              <p className="text-xs text-muted font-medium">{a.service_title} · {a.service_price_label}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <a href={`tel:${a.client_phone}`}
                              className="text-[9px] font-bold text-brand/60 hover:text-brand transition-colors border border-brand/20 px-2.5 sm:px-3 py-1.5 hover:border-brand whitespace-nowrap">
                              📞 <span className="hidden sm:inline">{a.client_phone}</span><span className="sm:hidden">Appeler</span>
                            </a>
                            <button
                              onClick={() => handleCancel(a)}
                              className="text-[9px] font-bold text-red-400/50 hover:text-red-500 transition-colors border border-red-200/30 px-2.5 sm:px-3 py-1.5 hover:border-red-300 whitespace-nowrap"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-cream px-6 py-3 text-sm text-muted/40 font-medium">Aucun rendez-vous</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════ MODAL — Bloquer un créneau ══════ */}
      <AnimatePresence>
        {blockModal && (
          <motion.div
            className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setBlockModal(null)}
          >
            <motion.div
              className="bg-cream w-full max-w-sm p-8"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <p className="text-[9px] uppercase tracking-[0.5em] text-brand font-bold mb-2">Bloquer</p>
              <h3 className="text-xl font-black text-dark mb-1">
                {fmtFR(blockModal.date, { weekday:'long', day:'2-digit', month:'long' })}
              </h3>
              <p className="text-2xl font-black text-brand mb-6">{blockModal.time}</p>
              <div className="space-y-3">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleBlock({ date: blockModal.date, time: blockModal.time, fullDay: false })}
                  className="w-full bg-dark text-cream py-3.5 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-brand hover:text-dark transition-colors">
                  Bloquer ce créneau ({blockModal.time})
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleBlock({ date: blockModal.date, time: null, fullDay: true })}
                  className="w-full border border-dark text-dark py-3.5 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-dark hover:text-cream transition-colors">
                  Bloquer toute la journée
                </motion.button>
                <button onClick={() => setBlockModal(null)}
                  className="w-full text-muted text-[9px] uppercase tracking-[0.35em] font-bold py-2 hover:text-dark transition-colors">
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════ MODAL — Détail RDV ══════ */}
      <AnimatePresence>
        {detailModal && (
          <motion.div
            className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDetailModal(null)}
          >
            <motion.div
              className="bg-cream w-full max-w-sm p-8"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <p className="text-[9px] uppercase tracking-[0.5em] text-brand font-bold mb-4">Rendez-vous</p>
              <DiamondDivider className="text-dark mb-5" />
              {[
                { label: 'Client',      val: detailModal.client_name },
                { label: 'Téléphone',   val: detailModal.client_phone },
                { label: 'Prestation',  val: detailModal.service_title },
                { label: 'Tarif',       val: detailModal.service_price_label },
                { label: 'Date',        val: fmtFR(detailModal.date, { weekday:'long', day:'2-digit', month:'long' }) },
                { label: 'Horaire',     val: detailModal.time },
                { label: 'N°',          val: detailModal.confirmation_number },
              ].map(r => (
                <div key={r.label} className="flex justify-between gap-3 py-2 border-b border-beige/50 last:border-0">
                  <span className="text-[9px] uppercase tracking-[0.35em] text-muted font-bold">{r.label}</span>
                  <span className="text-sm font-bold text-dark text-right capitalize">{r.val}</span>
                </div>
              ))}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <a href={`tel:${detailModal.client_phone}`}
                  className="flex items-center justify-center border border-brand px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-brand hover:bg-brand hover:text-dark transition-all">
                  Appeler
                </a>
                <button onClick={() => handleCancel(detailModal)}
                  className="border border-red-300 px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-red-500 hover:bg-red-500 hover:text-white transition-all">
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

/* ─── Page Admin (auth guard) ───────────────────────────────── */
export default function Admin() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(AUTH_KEY) === '1'
  );

  if (!authed) return <PinScreen onSuccess={() => setAuthed(true)} />;
  return <Dashboard />;
}
