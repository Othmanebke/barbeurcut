import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScissorsIcon, DiamondDivider } from '../components/BarberIcons';
import { fetchAppointments, cancelBooking, blockSlot, unblockSlot, fetchBlocks, addPauseBlock } from '../api/booking';
import { SUPABASE_READY } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo.png';

const ADMIN_PWD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'wonder2024!';
const AUTH_KEY  = 'wc_admin_auth';

const OPEN = new Set([3, 4, 5, 6]);

/* Créneaux 10h–19h30 pas 30 min */
const DAY_SLOTS = [];
for (let m = 10 * 60; m < 19 * 60 + 30; m += 30) {
  DAY_SLOTS.push(`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`);
}

function dayKey(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function monday(ref = new Date()) {
  const d = new Date(ref); const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1)); return d;
}
function fmt(dateStr, opts = { weekday:'long', day:'2-digit', month:'long' }) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', opts);
}

/* ══ PIN SCREEN ══ */
function PinScreen({ onSuccess }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (val === ADMIN_PWD) { sessionStorage.setItem(AUTH_KEY, '1'); onSuccess(); }
    else { setErr(true); setVal(''); setTimeout(() => setErr(false), 1400); }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-[380px]">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-10 w-10 bg-brand flex items-center justify-center shrink-0">
            <img src={logo} alt="Wonderclub" className="h-7 w-7 object-contain" style={{ filter: 'invert(1)' }} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.45em] text-white">Wonderclub</span>
        </div>
        <h1 className="text-4xl font-black uppercase tracking-[-0.03em] text-white mb-1">Dashboard</h1>
        <p className="text-sm text-cream/50 font-medium mb-8">Espace réservé au barbier.</p>
        <form onSubmit={submit} className="space-y-3">
          <motion.input type="password" value={val} onChange={e => setVal(e.target.value)}
            placeholder="Mot de passe" autoFocus
            animate={err ? { x: [0,-8,8,-8,0] } : {}}
            className={`w-full border-2 bg-denim px-5 py-4 text-white text-sm font-medium outline-none transition-colors placeholder:text-white/25 ${
              err ? 'border-red-400' : 'border-white/10 focus:border-brand'
            }`}
          />
          {err && <p className="text-xs text-red-400 font-medium">Mot de passe incorrect</p>}
          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-brand py-4 text-[10px] font-black uppercase tracking-[0.4em] text-dark hover:bg-brandDark transition-colors">
            <ScissorsIcon className="w-3.5 h-3.5" /> Connexion
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

/* ══ STAT CARD ══ */
function StatCard({ label, value, sub }) {
  return (
    <div className="relative overflow-hidden border border-white/8 p-6 sm:p-8 flex flex-col justify-between min-h-[120px]"
         style={{ background: '#405568' }}>
      {/* Numéro fantôme en fond */}
      <span className="absolute right-3 bottom-0 font-black leading-none pointer-events-none select-none"
            style={{ fontSize: '5rem', color: 'rgba(255,255,255,0.05)' }}>
        {value}
      </span>
      <p className="text-[8px] uppercase tracking-[0.5em] font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </p>
      <div>
        <p className="font-black text-white leading-none" style={{ fontSize: '2.8rem' }}>{value}</p>
        {sub && <p className="text-xs font-medium mt-1.5" style={{ color: 'rgba(244,239,234,0.45)' }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ══ DASHBOARD ══ */
function Dashboard() {
  const [weekStart, setWeekStart]     = useState(() => monday());
  const [appointments, setAppts]      = useState([]);
  const [blocks, setBlocks]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [view, setView]               = useState('list');
  const [blockModal, setBlockModal]     = useState(null);
  const [detailModal, setDetailModal]   = useState(null);
  const [pauseModal, setPauseModal]     = useState(null);
  const [cancelModal, setCancelModal]   = useState(null); // { appt }
  const [cancelMsg, setCancelMsg]       = useState('');
  const [cancelSending, setCancelSending] = useState(false);
  const [pauseStart, setPauseStart]   = useState('12:00');
  const [pauseEnd, setPauseEnd]       = useState('13:00');

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).filter(d => OPEN.has(d.getDay()));
  const from     = dayKey(weekStart);
  const to       = dayKey(addDays(weekStart, 6));
  const todayKey = dayKey(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([fetchAppointments({ from, to }), fetchBlocks({ from, to })]);
      setAppts(a); setBlocks(b);
    } finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  /* ── Temps réel : reload quand un RDV ou un bloc change ── */
  useEffect(() => {
    if (!SUPABASE_READY) return;
    const ch = supabase
      .channel('admin-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments'        }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'availability_blocks' }, load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [load]);

  const todayAppts = appointments.filter(a => a.date === todayKey);
  const apptAt     = (d, t) => appointments.find(a => a.date === d && a.time === t);
  const isBlocked  = (d, t) => blocks.some(b => b.date === d && (b.time === t || !b.time));
  const isFullDay  = (d)    => blocks.some(b => b.date === d && !b.time);
  const isPause    = (d, t) => blocks.some(b => b.date === d && b.time && b.reason === 'Pause' && b.time === t);

  /* Créneaux calendrier = slots fixes 30min + horaires réels des RDV (pour les durées dynamiques) */
  const calendarSlots = [...new Set([
    ...DAY_SLOTS,
    ...appointments.map(a => a.time),
  ])].sort();

  const handleBlock    = async ({ date, time, fullDay }) => { await blockSlot(date, fullDay ? null : time, 'Bloqué'); setBlockModal(null); load(); };
  const handleUnblock  = async (date, time) => { await unblockSlot(date, time); load(); };
  const handleCancel   = async (appt) => {
    setCancelModal({ appt });
    setCancelMsg('Votre rendez-vous a été annulé. N\'hésitez pas à reprendre rendez-vous en ligne.');
    setDetailModal(null);
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal) return;
    setCancelSending(true);
    try {
      const { appt } = cancelModal;
      await cancelBooking(appt.id);
      // Envoyer email d'annulation avec message
      if (appt.client_email || appt.email) {
        fetch('/api/send-cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientEmail:        appt.client_email || appt.email || '',
            clientName:         appt.client_name,
            serviceTitle:       appt.service_title,
            date:               appt.date,
            time:               appt.time,
            confirmationNumber: appt.confirmation_number,
            barberMessage:      cancelMsg,
          }),
        }).catch(() => {});
      }
      setCancelModal(null);
      load();
    } catch (e) {
      alert('Erreur : ' + e.message);
    } finally {
      setCancelSending(false);
    }
  };
  const handleBlockDay = async (date) => { if (!confirm(`Fermer le ${fmt(date, { weekday:'long', day:'2-digit', month:'long' })} ?`)) return; await blockSlot(date, null, 'Fermé'); load(); };

  const handleAddPause = async () => {
    if (!pauseModal) return;
    try { await addPauseBlock(pauseModal.date, pauseStart, pauseEnd); setPauseModal(null); load(); }
    catch (e) { alert('Erreur : ' + e.message); }
  };

  return (
    <div className="min-h-screen" style={{ background: '#3D2A1E' }}>

      {/* Header avec ligne accent */}
      <div className="sticky top-0 z-40 border-b" style={{ background: '#2E1F14', borderColor: 'rgba(255,255,255,0.06)' }}>
        {/* Ligne accent top */}
        <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0.3) 40%, transparent 100%)' }} />
        <div className="mx-auto max-w-6xl px-6 sm:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-brand flex items-center justify-center shrink-0">
              <img src={logo} alt="Wonderclub" className="h-5 w-5 object-contain" style={{ filter: 'invert(1)' }} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Dashboard</span>
            <span className="hidden sm:block text-[8px] uppercase tracking-[0.35em] font-bold ml-2"
                  style={{ color: 'rgba(255,255,255,0.20)' }}>
              Wonderclub · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </span>
          </div>
          <button onClick={() => { sessionStorage.removeItem(AUTH_KEY); window.location.reload(); }}
            className="text-[9px] uppercase tracking-[0.4em] text-white/30 hover:text-white font-bold transition-colors">
            Déconnexion
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-5">

        {!SUPABASE_READY && (
          <div className="border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm text-amber-300 font-medium">
            ⚠️ Mode démo — configure Supabase dans .env pour voir les vrais RDV.
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Aujourd'hui"   value={todayAppts.length} sub={`RDV${todayAppts.length > 1 ? 's' : ''} en cours`} />
          <StatCard label="Cette semaine" value={appointments.length} sub="RDV confirmés" />
        </div>

        {/* Nav semaine + vue */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5"
             style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekStart(w => addDays(w, -7))}
              className="h-9 w-9 border border-white/10 text-white font-bold text-sm hover:border-white/40 transition-colors flex items-center justify-center"
              style={{ background: '#405568' }}>←</button>
            <span className="text-sm font-black text-white px-2">
              {fmt(from, { day:'2-digit', month:'short' })} — {fmt(to, { day:'2-digit', month:'short', year:'numeric' })}
            </span>
            <button onClick={() => setWeekStart(w => addDays(w, 7))}
              className="h-9 w-9 border border-white/10 text-white font-bold text-sm hover:border-white/40 transition-colors flex items-center justify-center"
              style={{ background: '#405568' }}>→</button>
            <button onClick={() => setWeekStart(monday())}
              className="h-9 px-3 border border-white/30 text-white text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-dark transition-all"
              style={{ color: 'rgba(255,255,255,0.70)' }}>
              Auj.
            </button>
          </div>
          <div className="flex border border-white/10 overflow-hidden">
            {[['list','Liste'],['week','Calendrier']].map(([v, l]) => (
              <button key={v} onClick={() => setView(v)}
                className="px-4 py-2 text-[9px] uppercase tracking-[0.35em] font-black transition-colors"
                style={{
                  background: view === v ? '#FFFFFF' : '#405568',
                  color: view === v ? '#3D2A1E' : 'rgba(255,255,255,0.40)',
                }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="border border-white/8 p-16 flex justify-center" style={{ background: '#405568' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
              <ScissorsIcon className="w-7 h-7 text-white" />
            </motion.div>
          </div>
        ) : view === 'list' ? (

          /* VUE LISTE */
          <div className="space-y-3">
            {weekDays.map(d => {
              const k        = dayKey(d);
              const dayAppts = appointments.filter(a => a.date === k).sort((a,b) => a.time.localeCompare(b.time));
              const isToday  = k === todayKey;
              const full     = isFullDay(k);
              const pauses   = blocks.filter(b => b.date === k && b.time && b.reason === 'Pause');

              return (
                <div key={k}
                  className="overflow-hidden border"
                  style={{
                    background: isToday ? '#405568' : '#3D2A1E',
                    borderColor: isToday ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.06)',
                    borderLeft: isToday ? '3px solid #FFFFFF' : '3px solid transparent',
                  }}>
                  <div className="px-6 py-4 flex items-center justify-between"
                       style={{ background: isToday ? '#344558' : 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full"
                           style={{ background: dayAppts.length > 0 ? '#FFFFFF' : 'rgba(255,255,255,0.18)' }} />
                      <p className="text-sm font-black uppercase text-white">
                        {fmt(k, { weekday:'long', day:'2-digit', month:'long' })}
                      </p>
                      {isToday && (
                        <span className="text-[8px] font-black uppercase tracking-[0.4em] px-2 py-0.5 border border-white/30 text-white/70">
                          Auj.
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {dayAppts.length > 0 && (
                        <span className="text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.40)' }}>
                          {dayAppts.length} RDV
                        </span>
                      )}
                      <button onClick={() => setPauseModal({ date: k })}
                        className="text-[8px] uppercase tracking-[0.3em] font-bold transition-colors hover:text-white px-2"
                        style={{ color: 'rgba(255,255,255,0.35)' }}>
                        + Pause
                      </button>
                      <button
                        onClick={() => full ? handleUnblock(k, null) : handleBlockDay(k)}
                        className={`text-[8px] uppercase tracking-[0.3em] font-bold transition-colors ${
                          full ? 'text-green-400 hover:text-green-300' : 'hover:text-red-400'
                        }`}
                        style={{ color: full ? undefined : 'rgba(255,255,255,0.22)' }}>
                        {full ? 'Rouvrir' : 'Fermer'}
                      </button>
                    </div>
                  </div>

                  {/* Pauses du jour */}
                  {pauses.length > 0 && (
                    <div className="px-6 py-2 flex flex-wrap gap-2 border-b border-white/5">
                      {pauses.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 px-3 py-1">
                          <span className="text-[9px] font-bold text-amber-300">Pause {p.time}{p.end_time ? ` → ${p.end_time}` : ''}</span>
                          <button onClick={() => handleUnblock(p.date, p.time)} className="text-amber-400/60 hover:text-amber-300 text-xs">✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {dayAppts.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {dayAppts.map(a => (
                        <motion.div key={a.id} whileHover={{ backgroundColor: 'rgba(64,85,104,0.8)' }}
                          className="px-6 py-4 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                          onClick={() => setDetailModal(a)}>
                          <div className="flex items-center gap-4">
                            <span className="text-xl font-black text-brand w-16 shrink-0">{a.time}</span>
                            <div>
                              <p className="text-sm font-black text-white">{a.client_name}</p>
                              <p className="text-xs text-white/50 font-medium">{a.service_title}{a.service_duration ? ` · ${a.service_duration}min` : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-black text-brand">{a.service_price_label}</span>
                            <a href={`tel:${a.client_phone}`} onClick={e => e.stopPropagation()}
                              className="text-[9px] border border-white/15 px-3 py-1.5 text-white/50 hover:border-brand hover:text-brand transition-colors font-bold">
                              Appeler
                            </a>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-5 text-sm text-white/25 font-medium italic">
                      {full ? 'Journée fermée' : 'Aucun rendez-vous'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        ) : (

          /* VUE CALENDRIER */
          <div className="bg-denim border border-white/8 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid gap-px bg-white/5" style={{ gridTemplateColumns: `80px repeat(${weekDays.length}, 1fr)` }}>
                  <div className="bg-darkMid py-3" />
                  {weekDays.map(d => {
                    const k = dayKey(d); const isToday = k === todayKey;
                    const cnt = appointments.filter(a => a.date === k).length;
                    return (
                      <div key={k} className={`px-3 py-3 text-center ${isToday ? 'bg-darkMid' : 'bg-denim'}`}>
                        <p className={`text-[8px] uppercase tracking-[0.4em] font-bold ${isToday ? 'text-brand' : 'text-white/40'}`}>
                          {fmt(k, { weekday:'short' })}
                        </p>
                        <p className="text-xl font-black text-white">{d.getDate()}</p>
                        {cnt > 0 && <p className="text-[7px] text-brand font-black mt-0.5">{cnt} RDV</p>}
                        <button onClick={() => setPauseModal({ date: k })} className="mt-1 text-[7px] text-brand/50 hover:text-brand transition-colors">+ Pause</button>
                      </div>
                    );
                  })}
                </div>
                <div className="divide-y divide-white/5">
                  {calendarSlots.map(slot => (
                    <div key={slot} className="grid gap-px bg-white/5" style={{ gridTemplateColumns: `80px repeat(${weekDays.length}, 1fr)` }}>
                      <div className="bg-darkMid py-3 px-3 flex items-center">
                        <span className="text-[9px] font-bold text-white/30">{slot}</span>
                      </div>
                      {weekDays.map(d => {
                        const k = dayKey(d);
                        const appt    = apptAt(k, slot);
                        const blocked = isBlocked(k, slot);
                        const full    = isFullDay(k);
                        const pause   = isPause(k, slot);
                        return (
                          <div key={k} onClick={() => !full && !appt && setBlockModal({ date: k, time: slot })}
                            className={`relative min-h-[44px] px-2 py-1.5 flex flex-col justify-center transition-colors ${
                              full   ? 'bg-white/5 cursor-not-allowed'
                              : appt ? 'bg-brand/15 border-l-2 border-brand cursor-pointer hover:bg-brand/25'
                              : pause? 'bg-amber-500/15 cursor-pointer'
                              : blocked?'bg-red-500/15 cursor-pointer'
                              :        'bg-denim cursor-pointer hover:bg-white/5'
                            }`}>
                            {appt && (
                              <div onClick={e => { e.stopPropagation(); setDetailModal(appt); }}>
                                <p className="text-[9px] font-black text-white truncate">{appt.client_name.split(' ')[0]}</p>
                                <p className="text-[7px] text-white/50 truncate">{appt.service_title.split(' ')[0]}</p>
                              </div>
                            )}
                            {pause && !appt && <span className="text-[8px] text-amber-300 font-bold">Pause</span>}
                            {blocked && !appt && !pause && (
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] text-red-400 font-bold">Bloqué</span>
                                <button onClick={e => { e.stopPropagation(); handleUnblock(k, slot); }} className="text-[8px] text-red-400/60 hover:text-red-400">✕</button>
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

      {/* MODAL — Pause */}
      <AnimatePresence>
        {pauseModal && (
          <motion.div className="fixed inset-0 bg-dark/70 backdrop-blur-sm z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPauseModal(null)}>
            <motion.div className="bg-denim border border-white/10 w-full max-w-sm p-8 space-y-5"
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}>
              <div>
                <p className="text-[8px] uppercase tracking-[0.5em] text-brand font-bold mb-1">Bloquer une pause</p>
                <p className="text-lg font-black text-white">{fmt(pauseModal.date)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[9px] uppercase tracking-[0.4em] text-white/50 font-bold block mb-1">Début</span>
                  <input type="time" value={pauseStart} onChange={e => setPauseStart(e.target.value)}
                    className="w-full bg-dark border border-white/10 px-3 py-2.5 text-white text-sm font-medium outline-none focus:border-brand" />
                </label>
                <label className="block">
                  <span className="text-[9px] uppercase tracking-[0.4em] text-white/50 font-bold block mb-1">Fin</span>
                  <input type="time" value={pauseEnd} onChange={e => setPauseEnd(e.target.value)}
                    className="w-full bg-dark border border-white/10 px-3 py-2.5 text-white text-sm font-medium outline-none focus:border-brand" />
                </label>
              </div>
              <div className="space-y-2">
                <button onClick={handleAddPause}
                  className="w-full bg-brand text-dark py-3.5 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-brandDark transition-colors">
                  Bloquer la pause
                </button>
                <button onClick={() => setPauseModal(null)}
                  className="w-full text-white/40 text-[9px] uppercase tracking-[0.35em] font-bold py-2 hover:text-white transition-colors">
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL — Bloquer créneau */}
      <AnimatePresence>
        {blockModal && (
          <motion.div className="fixed inset-0 bg-dark/70 backdrop-blur-sm z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setBlockModal(null)}>
            <motion.div className="bg-denim border border-white/10 w-full max-w-sm p-8 space-y-4"
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}>
              <div>
                <p className="text-[8px] uppercase tracking-[0.5em] text-brand font-bold mb-1">Bloquer</p>
                <p className="text-lg font-black text-white">{fmt(blockModal.date)}</p>
                <p className="text-2xl font-black text-brand">{blockModal.time}</p>
              </div>
              <DiamondDivider className="text-white/20" />
              <div className="space-y-2">
                <button onClick={() => handleBlock({ date: blockModal.date, time: blockModal.time, fullDay: false })}
                  className="w-full bg-white text-dark py-3.5 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-cream transition-colors">
                  Bloquer {blockModal.time}
                </button>
                <button onClick={() => handleBlock({ date: blockModal.date, fullDay: true })}
                  className="w-full border border-white/20 text-white py-3.5 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-white/10 transition-colors">
                  Bloquer toute la journée
                </button>
                <button onClick={() => setBlockModal(null)}
                  className="w-full text-white/40 text-[9px] uppercase tracking-[0.35em] font-bold py-2 hover:text-white transition-colors">
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL — Annulation avec message */}
      <AnimatePresence>
        {cancelModal && (
          <motion.div className="fixed inset-0 bg-dark/70 backdrop-blur-sm z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCancelModal(null)}>
            <motion.div className="bg-denim border border-white/10 w-full max-w-sm p-8 space-y-5"
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}>
              <div>
                <p className="text-[8px] uppercase tracking-[0.5em] text-red-400 font-bold mb-1">Annuler le RDV</p>
                <p className="text-base font-black text-white">{cancelModal.appt.client_name}</p>
                <p className="text-xs text-white/50">{fmt(cancelModal.appt.date)} à {cancelModal.appt.time}</p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-white/50 mb-2">
                  Message au client (envoyé par email)
                </p>
                <textarea
                  value={cancelMsg}
                  onChange={e => setCancelMsg(e.target.value)}
                  rows={4}
                  className="w-full bg-dark border border-white/10 px-4 py-3 text-white text-sm font-medium outline-none focus:border-white/40 resize-none transition-colors"
                  placeholder="Raison de l'annulation..."
                />
              </div>

              <div className="space-y-2">
                <button onClick={handleConfirmCancel} disabled={cancelSending}
                  className="w-full bg-red-500 text-white py-3.5 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-red-600 transition-colors disabled:opacity-50">
                  {cancelSending ? 'Envoi…' : 'Confirmer l\'annulation'}
                </button>
                <button onClick={() => setCancelModal(null)}
                  className="w-full text-white/40 text-[9px] uppercase tracking-[0.35em] font-bold py-2 hover:text-white transition-colors">
                  Retour
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL — Détail RDV */}
      <AnimatePresence>
        {detailModal && (
          <motion.div className="fixed inset-0 bg-dark/70 backdrop-blur-sm z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDetailModal(null)}>
            <motion.div className="bg-denim border border-white/10 w-full max-w-sm p-8"
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}>
              <p className="text-[8px] uppercase tracking-[0.5em] text-brand font-bold mb-5">Rendez-vous</p>
              <div className="space-y-3 mb-6">
                {[
                  { l: 'Client',      v: detailModal.client_name },
                  { l: 'Téléphone',   v: detailModal.client_phone },
                  { l: 'Prestation',  v: detailModal.service_title },
                  { l: 'Durée',       v: detailModal.service_duration ? `${detailModal.service_duration} min` : '—' },
                  { l: 'Tarif',       v: detailModal.service_price_label },
                  { l: 'Date',        v: fmt(detailModal.date) },
                  { l: 'Horaire',     v: detailModal.time },
                  { l: 'Réf.',        v: detailModal.confirmation_number },
                ].map(r => (
                  <div key={r.l} className="flex justify-between gap-4 border-b border-white/8 pb-3 last:border-0 last:pb-0">
                    <span className="text-[8px] uppercase tracking-[0.4em] text-white/40 font-bold shrink-0">{r.l}</span>
                    <span className="text-sm font-bold text-white text-right capitalize">{r.v}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a href={`tel:${detailModal.client_phone}`}
                  className="flex items-center justify-center border border-brand text-brand py-3 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand hover:text-dark transition-all">
                  Appeler
                </a>
                <button onClick={() => handleCancel(detailModal)}
                  className="border border-red-500/40 text-red-400 py-3 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all">
                  Annuler RDV
                </button>
              </div>
              <button onClick={() => setDetailModal(null)}
                className="w-full mt-3 text-white/30 text-[9px] uppercase tracking-[0.35em] font-bold py-2 hover:text-white transition-colors">
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');
  if (!authed) return <PinScreen onSuccess={() => setAuthed(true)} />;
  return <Dashboard />;
}
