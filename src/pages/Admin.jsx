import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScissorsIcon, DiamondDivider } from '../components/BarberIcons';
import { fetchAppointments, cancelBooking, blockSlot, unblockSlot, fetchBlocks, addPauseBlock } from '../api/booking';
import { SUPABASE_READY } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo.png';
import AdminStats from '../components/AdminStats';
import { OPEN_DAYS, ON_DEMAND_DAYS, OPEN_REASON } from '../utils/timeSlots';

const ADMIN_PWD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'wonder2024!';
const AUTH_KEY  = 'wc_admin_auth';

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
    <div className="min-h-screen bg-sand flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-[380px] bg-white border border-line p-8 sm:p-10 shadow-[0_12px_40px_rgba(46,31,20,0.08)]">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-10 w-10 bg-black flex items-center justify-center shrink-0">
            <img src={logo} alt="Wonderclub" className="h-7 w-7 object-contain" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.45em] text-ink">Wonderclub</span>
        </div>
        <h1 className="text-4xl font-black uppercase tracking-[-0.03em] text-ink mb-1">Dashboard</h1>
        <p className="text-sm text-inkSoft font-medium mb-8">Espace réservé au barbier.</p>
        <form onSubmit={submit} className="space-y-3">
          <motion.input type="password" value={val} onChange={e => setVal(e.target.value)}
            placeholder="Mot de passe" autoFocus
            animate={err ? { x: [0,-8,8,-8,0] } : {}}
            className={`w-full border-2 bg-sand px-5 py-4 text-ink text-sm font-medium outline-none transition-colors placeholder:text-inkSoft/50 ${
              err ? 'border-red-500' : 'border-line focus:border-bark'
            }`}
          />
          {err && <p className="text-xs text-red-700 font-medium">Mot de passe incorrect</p>}
          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-bark py-4 text-[10px] font-black uppercase tracking-[0.4em] text-white hover:bg-ink transition-colors">
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
    <div className="bg-white border border-line p-5 sm:p-7 flex flex-col justify-between min-h-[110px] shadow-[0_1px_2px_rgba(46,31,20,0.04)]">
      <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-inkSoft">{label}</p>
      <div>
        <p className="font-black text-ink leading-none text-4xl tabular-nums">{value}</p>
        {sub && <p className="text-xs font-semibold mt-1.5 text-inkSoft">{sub}</p>}
      </div>
    </div>
  );
}

const MODAL_BACKDROP = 'fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center px-6';
const MODAL_BOX      = 'bg-white border border-line shadow-xl w-full max-w-sm p-8';
const INPUT          = 'w-full bg-sand border border-line px-3 py-2.5 text-ink text-sm font-medium outline-none focus:border-bark';
const BTN_PRIMARY    = 'w-full bg-bark text-white py-3.5 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-ink transition-colors disabled:opacity-50';
const BTN_GHOST      = 'w-full text-inkSoft text-[9px] uppercase tracking-[0.35em] font-bold py-2 hover:text-ink transition-colors';

/* ══ DASHBOARD ══ */
function Dashboard() {
  const [tab, setTab]                 = useState('planning');
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

  /* Mer–sam + mardi (jour sur demande, fermé tant que le barbier ne l'ouvre pas) */
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    .filter(d => OPEN_DAYS.has(d.getDay()) || ON_DEMAND_DAYS.has(d.getDay()));
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
  const isBlocked  = (d, t) => blocks.some(b => b.date === d && b.time === t);
  const isPause    = (d, t) => blocks.some(b => b.date === d && b.time && b.reason === 'Pause' && b.time === t);
  const isOnDemand = (d)    => ON_DEMAND_DAYS.has(new Date(d + 'T12:00:00').getDay());
  const isOpenedOnDemand = (d) => blocks.some(b => b.date === d && !b.time && b.reason === OPEN_REASON);
  /* Jour fermé : fermeture manuelle, ou jour sur demande (mardi) pas encore ouvert */
  const isFullDay  = (d) => isOnDemand(d)
    ? !isOpenedOnDemand(d)
    : blocks.some(b => b.date === d && !b.time && b.reason !== OPEN_REASON);

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

  /* Mardi : ouverture / fermeture à la demande — répercuté en temps réel sur le site */
  const handleToggleOnDemand = async (date) => {
    try {
      if (isOpenedOnDemand(date)) {
        const n = appointments.filter(a => a.date === date).length;
        const warn = n ? `\n\n⚠️ Les ${n} RDV déjà pris ce jour restent maintenus (annule-les un par un si besoin).` : '';
        if (!confirm(`Fermer le ${fmt(date)} ? Il ne sera plus réservable en ligne.${warn}`)) return;
        await unblockSlot(date, null);
      } else {
        await blockSlot(date, null, OPEN_REASON);
      }
      load();
    } catch (e) { alert('Erreur : ' + e.message); }
  };

  const handleAddPause = async () => {
    if (!pauseModal) return;
    try { await addPauseBlock(pauseModal.date, pauseStart, pauseEnd); setPauseModal(null); load(); }
    catch (e) { alert('Erreur : ' + e.message); }
  };

  return (
    <div className="min-h-screen bg-sand text-ink">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-line">
        <div className="h-[3px] w-full bg-bark" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 bg-black flex items-center justify-center shrink-0">
              <img src={logo} alt="Wonderclub" className="h-5 w-5 object-contain" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-ink">Dashboard</span>
            <span className="hidden md:block text-[9px] uppercase tracking-[0.3em] font-bold ml-2 text-inkSoft/70 truncate">
              Wonderclub · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </span>
          </div>
          <button onClick={() => { sessionStorage.removeItem(AUTH_KEY); window.location.reload(); }}
            className="text-[9px] uppercase tracking-[0.35em] text-inkSoft hover:text-ink font-bold transition-colors shrink-0">
            Déconnexion
          </button>
        </div>
        {/* Onglets */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex gap-6">
          {[['planning', 'Planning'], ['stats', 'Statistiques']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`relative pb-3 pt-1 text-[10px] font-black uppercase tracking-[0.35em] transition-colors ${
                tab === k ? 'text-ink' : 'text-inkSoft/60 hover:text-ink'
              }`}>
              {l}
              {tab === k && <motion.span layoutId="admin-tab" className="absolute left-0 right-0 -bottom-px h-[3px] bg-bark" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-5">

        {!SUPABASE_READY && (
          <div className="border border-amber-300 bg-amber-50 px-5 py-3 text-sm text-amber-900 font-medium">
            ⚠️ Mode démo — configure Supabase dans .env pour voir les vrais RDV.
          </div>
        )}

        {tab === 'stats' ? <AdminStats /> : (<>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Aujourd'hui"   value={todayAppts.length} sub={`RDV aujourd'hui`} />
          <StatCard label="Cette semaine" value={appointments.length} sub="RDV confirmés" />
        </div>

        {/* Nav semaine + vue */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekStart(w => addDays(w, -7))} aria-label="Semaine précédente"
              className="h-9 w-9 bg-white border border-line text-ink font-bold text-sm hover:border-bark transition-colors flex items-center justify-center">←</button>
            <span className="text-sm font-black text-ink px-2">
              {fmt(from, { day:'2-digit', month:'short' })} — {fmt(to, { day:'2-digit', month:'short', year:'numeric' })}
            </span>
            <button onClick={() => setWeekStart(w => addDays(w, 7))} aria-label="Semaine suivante"
              className="h-9 w-9 bg-white border border-line text-ink font-bold text-sm hover:border-bark transition-colors flex items-center justify-center">→</button>
            <button onClick={() => setWeekStart(monday())}
              className="h-9 px-3 border border-bark text-bark text-[9px] font-black uppercase tracking-[0.3em] hover:bg-bark hover:text-white transition-colors">
              Auj.
            </button>
          </div>
          <div className="flex border border-line overflow-hidden">
            {[['list','Liste'],['week','Calendrier']].map(([v, l]) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 text-[9px] uppercase tracking-[0.35em] font-black transition-colors ${
                  view === v ? 'bg-bark text-white' : 'bg-white text-inkSoft hover:text-ink'
                }`}>{l}</button>
            ))}
          </div>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="bg-white border border-line p-16 flex justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
              <ScissorsIcon className="w-7 h-7 text-bark" />
            </motion.div>
          </div>
        ) : view === 'list' ? (

          /* VUE LISTE */
          <div className="space-y-3">
            {weekDays.map(d => {
              const k        = dayKey(d);
              const dayAppts = appointments.filter(a => a.date === k).sort((a,b) => a.time.localeCompare(b.time));
              const isToday  = k === todayKey;
              const onDemand = isOnDemand(k);
              const full     = isFullDay(k);
              const pauses   = blocks.filter(b => b.date === k && b.time && b.reason === 'Pause');

              return (
                <div key={k}
                  className={`overflow-hidden border bg-white ${isToday ? 'border-bark/40' : 'border-line'}`}
                  style={{ borderLeft: `4px solid ${isToday ? '#5C4031' : full ? '#CBBBA9' : '#E4D9CD'}` }}>
                  <div className={`px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-line ${isToday ? 'bg-[#F1E8DE]' : 'bg-paper'}`}>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className={`h-2 w-2 rounded-full ${dayAppts.length ? 'bg-bark' : 'bg-line'}`} />
                      <p className={`text-sm font-black uppercase ${full && !dayAppts.length ? 'text-inkSoft' : 'text-ink'}`}>
                        {fmt(k, { weekday:'long', day:'2-digit', month:'long' })}
                      </p>
                      {isToday && (
                        <span className="text-[8px] font-black uppercase tracking-[0.35em] px-2 py-0.5 bg-bark text-white">Auj.</span>
                      )}
                      {onDemand && (
                        <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-2 py-0.5 border ${
                          full ? 'border-line text-inkSoft bg-white' : 'border-emerald-300 text-emerald-800 bg-emerald-50'
                        }`}>
                          {full ? 'Sur demande · fermé' : 'Ouvert en ligne'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-3">
                      {dayAppts.length > 0 && (
                        <span className="text-[10px] font-bold text-inkSoft mr-1">{dayAppts.length} RDV</span>
                      )}
                      {!full && (
                        <button onClick={() => setPauseModal({ date: k })}
                          className="text-[9px] uppercase tracking-[0.25em] font-bold text-inkSoft hover:text-ink px-2 py-1 transition-colors">
                          + Pause
                        </button>
                      )}
                      {onDemand ? (
                        <button onClick={() => handleToggleOnDemand(k)}
                          className={`text-[9px] uppercase tracking-[0.25em] font-black px-3 py-1.5 transition-colors ${
                            full ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'border border-red-300 text-red-700 hover:bg-red-50'
                          }`}>
                          {full ? 'Ouvrir ce mardi' : 'Fermer'}
                        </button>
                      ) : (
                        <button
                          onClick={() => full ? handleUnblock(k, null) : handleBlockDay(k)}
                          className={`text-[9px] uppercase tracking-[0.25em] font-bold px-2 py-1 transition-colors ${
                            full ? 'text-emerald-700 hover:text-emerald-900' : 'text-inkSoft hover:text-red-700'
                          }`}>
                          {full ? 'Rouvrir' : 'Fermer'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pauses du jour */}
                  {pauses.length > 0 && (
                    <div className="px-4 sm:px-6 py-2 flex flex-wrap gap-2 border-b border-line">
                      {pauses.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 bg-amber-50 border border-amber-300 px-3 py-1">
                          <span className="text-[10px] font-bold text-amber-900">Pause {p.time}{p.end_time ? ` → ${p.end_time}` : ''}</span>
                          <button onClick={() => handleUnblock(p.date, p.time)} aria-label="Supprimer la pause"
                            className="text-amber-700 hover:text-amber-950 text-xs">✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {dayAppts.length > 0 ? (
                    <div className="divide-y divide-line">
                      {dayAppts.map(a => (
                        <div key={a.id}
                          className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-paper transition-colors"
                          onClick={() => setDetailModal(a)}>
                          <div className="flex items-center gap-4 min-w-0">
                            <span className="text-xl font-black text-bark w-16 shrink-0 tabular-nums">{a.time}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-ink truncate">{a.client_name}</p>
                              <p className="text-xs text-inkSoft font-medium truncate">{a.service_title}{a.service_duration ? ` · ${a.service_duration}min` : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-black text-ink">{a.service_price_label}</span>
                            <a href={`tel:${a.client_phone}`} onClick={e => e.stopPropagation()}
                              className="hidden sm:inline-block text-[9px] border border-line px-3 py-1.5 text-inkSoft hover:border-bark hover:text-bark transition-colors font-bold">
                              Appeler
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 sm:px-6 py-5 text-sm text-inkSoft/80 font-medium italic">
                      {onDemand && full
                        ? 'Mardi fermé — clique sur « Ouvrir ce mardi » pour le rendre réservable sur le site.'
                        : full ? 'Journée fermée' : 'Aucun rendez-vous'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        ) : (

          /* VUE CALENDRIER */
          <div className="bg-white border border-line overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[680px]">
                <div className="grid gap-px bg-line" style={{ gridTemplateColumns: `72px repeat(${weekDays.length}, 1fr)` }}>
                  <div className="bg-paper py-3" />
                  {weekDays.map(d => {
                    const k = dayKey(d); const isToday = k === todayKey;
                    const cnt = appointments.filter(a => a.date === k).length;
                    const full = isFullDay(k);
                    const onDemand = isOnDemand(k);
                    return (
                      <div key={k} className={`px-2 py-3 text-center ${isToday ? 'bg-[#F1E8DE]' : 'bg-paper'}`}>
                        <p className={`text-[9px] uppercase tracking-[0.35em] font-bold ${isToday ? 'text-bark' : 'text-inkSoft'}`}>
                          {fmt(k, { weekday:'short' })}
                        </p>
                        <p className="text-xl font-black text-ink">{d.getDate()}</p>
                        {cnt > 0 && <p className="text-[8px] text-bark font-black mt-0.5">{cnt} RDV</p>}
                        {onDemand ? (
                          <button onClick={() => handleToggleOnDemand(k)}
                            className={`mt-1 text-[8px] font-black uppercase tracking-[0.15em] ${full ? 'text-emerald-700 hover:text-emerald-900' : 'text-red-700 hover:text-red-900'}`}>
                            {full ? 'Ouvrir' : 'Fermer'}
                          </button>
                        ) : !full && (
                          <button onClick={() => setPauseModal({ date: k })} className="mt-1 text-[8px] font-bold text-inkSoft hover:text-ink transition-colors">+ Pause</button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="divide-y divide-line">
                  {calendarSlots.map(slot => (
                    <div key={slot} className="grid gap-px bg-line" style={{ gridTemplateColumns: `72px repeat(${weekDays.length}, 1fr)` }}>
                      <div className="bg-paper py-3 px-3 flex items-center">
                        <span className="text-[10px] font-bold text-inkSoft tabular-nums">{slot}</span>
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
                              appt   ? 'bg-[#E9DED2] border-l-[3px] border-bark cursor-pointer hover:bg-[#E0D2C3]'
                              : full ? 'bg-[repeating-linear-gradient(135deg,#F4EFEA_0,#F4EFEA_6px,#ECE4DB_6px,#ECE4DB_12px)] cursor-not-allowed'
                              : pause? 'bg-amber-50 cursor-pointer'
                              : blocked?'bg-red-50 cursor-pointer'
                              :        'bg-white cursor-pointer hover:bg-paper'
                            }`}>
                            {appt && (
                              <div onClick={e => { e.stopPropagation(); setDetailModal(appt); }}>
                                <p className="text-[10px] font-black text-ink truncate">{appt.client_name.split(' ')[0]}</p>
                                <p className="text-[8px] text-inkSoft truncate">{appt.service_title}</p>
                              </div>
                            )}
                            {pause && !appt && <span className="text-[9px] text-amber-800 font-bold">Pause</span>}
                            {blocked && !appt && !pause && (
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] text-red-700 font-bold">Bloqué</span>
                                <button onClick={e => { e.stopPropagation(); handleUnblock(k, slot); }} aria-label="Débloquer"
                                  className="text-[9px] text-red-500 hover:text-red-800">✕</button>
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
        </>)}
      </div>

      {/* MODAL — Pause */}
      <AnimatePresence>
        {pauseModal && (
          <motion.div className={MODAL_BACKDROP}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPauseModal(null)}>
            <motion.div className={`${MODAL_BOX} space-y-5`}
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}>
              <div>
                <p className="text-[9px] uppercase tracking-[0.45em] text-bark font-black mb-1">Bloquer une pause</p>
                <p className="text-lg font-black text-ink capitalize">{fmt(pauseModal.date)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[9px] uppercase tracking-[0.35em] text-inkSoft font-bold block mb-1">Début</span>
                  <input type="time" value={pauseStart} onChange={e => setPauseStart(e.target.value)} className={INPUT} />
                </label>
                <label className="block">
                  <span className="text-[9px] uppercase tracking-[0.35em] text-inkSoft font-bold block mb-1">Fin</span>
                  <input type="time" value={pauseEnd} onChange={e => setPauseEnd(e.target.value)} className={INPUT} />
                </label>
              </div>
              <div className="space-y-2">
                <button onClick={handleAddPause} className={BTN_PRIMARY}>Bloquer la pause</button>
                <button onClick={() => setPauseModal(null)} className={BTN_GHOST}>Annuler</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL — Bloquer créneau */}
      <AnimatePresence>
        {blockModal && (
          <motion.div className={MODAL_BACKDROP}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setBlockModal(null)}>
            <motion.div className={`${MODAL_BOX} space-y-4`}
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}>
              <div>
                <p className="text-[9px] uppercase tracking-[0.45em] text-bark font-black mb-1">Bloquer</p>
                <p className="text-lg font-black text-ink capitalize">{fmt(blockModal.date)}</p>
                <p className="text-2xl font-black text-bark">{blockModal.time}</p>
              </div>
              <DiamondDivider className="text-line" />
              <div className="space-y-2">
                <button onClick={() => handleBlock({ date: blockModal.date, time: blockModal.time, fullDay: false })} className={BTN_PRIMARY}>
                  Bloquer {blockModal.time}
                </button>
                {!isOnDemand(blockModal.date) && (
                  <button onClick={() => handleBlock({ date: blockModal.date, fullDay: true })}
                    className="w-full border border-line text-ink py-3.5 text-[10px] font-black uppercase tracking-[0.35em] hover:border-bark transition-colors">
                    Bloquer toute la journée
                  </button>
                )}
                <button onClick={() => setBlockModal(null)} className={BTN_GHOST}>Annuler</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL — Annulation avec message */}
      <AnimatePresence>
        {cancelModal && (
          <motion.div className={MODAL_BACKDROP}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCancelModal(null)}>
            <motion.div className={`${MODAL_BOX} space-y-5`}
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}>
              <div>
                <p className="text-[9px] uppercase tracking-[0.45em] text-red-700 font-black mb-1">Annuler le RDV</p>
                <p className="text-base font-black text-ink">{cancelModal.appt.client_name}</p>
                <p className="text-xs text-inkSoft">{fmt(cancelModal.appt.date)} à {cancelModal.appt.time}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-inkSoft mb-2">Message au client (envoyé par email)</p>
                <textarea value={cancelMsg} onChange={e => setCancelMsg(e.target.value)} rows={4}
                  className={`${INPUT} px-4 py-3 resize-none`} placeholder="Raison de l'annulation..." />
              </div>
              <div className="space-y-2">
                <button onClick={handleConfirmCancel} disabled={cancelSending}
                  className="w-full bg-red-700 text-white py-3.5 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-red-800 transition-colors disabled:opacity-50">
                  {cancelSending ? 'Envoi…' : 'Confirmer l\'annulation'}
                </button>
                <button onClick={() => setCancelModal(null)} className={BTN_GHOST}>Retour</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL — Détail RDV */}
      <AnimatePresence>
        {detailModal && (
          <motion.div className={MODAL_BACKDROP}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDetailModal(null)}>
            <motion.div className={MODAL_BOX}
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}>
              <p className="text-[9px] uppercase tracking-[0.45em] text-bark font-black mb-5">Rendez-vous</p>
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
                  <div key={r.l} className="flex justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                    <span className="text-[9px] uppercase tracking-[0.35em] text-inkSoft font-bold shrink-0">{r.l}</span>
                    <span className="text-sm font-bold text-ink text-right capitalize">{r.v}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a href={`tel:${detailModal.client_phone}`}
                  className="flex items-center justify-center bg-bark text-white py-3 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-ink transition-colors">
                  Appeler
                </a>
                <button onClick={() => handleCancel(detailModal)}
                  className="border border-red-300 text-red-700 py-3 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-700 hover:text-white transition-colors">
                  Annuler RDV
                </button>
              </div>
              <button onClick={() => setDetailModal(null)} className={`${BTN_GHOST} mt-3`}>Fermer</button>
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
