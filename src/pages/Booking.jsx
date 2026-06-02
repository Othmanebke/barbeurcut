import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import { fetchAvailability, subscribeToAvailability } from '../api/availability';
import { acquireLock, releaseLock } from '../api/slotLock';
import { buildBusyRanges, generateDynamicSlots, filterPastSlots, OPEN_DAYS } from '../utils/timeSlots';
import { ScissorsIcon } from '../components/BarberIcons';

/* ─── Day window builder ──────────────────────────────────── */
function buildDayWindow(days, fullDayOff, dateBookings, dateBlocks, serviceDuration) {
  return days.map((date) => {
    const k   = date.toISOString().slice(0, 10);
    const dow = date.getDay();
    let status;
    if (!OPEN_DAYS.has(dow) || fullDayOff.has(k)) {
      status = 'ferme';
    } else {
      const busy  = buildBusyRanges(dateBookings[k] || [], dateBlocks[k] || []);
      const slots = filterPastSlots(generateDynamicSlots(serviceDuration, busy), date);
      status = slots.length > 0 ? 'available' : 'complet';
    }
    return {
      key:       k,
      date,
      status,
      dayShort:  date.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase().slice(0, 3),
      dayNum:    date.getDate(),
      monthShort:date.toLocaleDateString('fr-FR', { month: 'short' }),
    };
  });
}

/* ─── Step indicator ──────────────────────────────────────── */
function Steps({ serviceOk, dateOk, infoOk }) {
  const steps = [
    { num: '01', label: 'Prestation',   done: serviceOk },
    { num: '02', label: 'Date & Heure', done: dateOk    },
    { num: '03', label: 'Confirmation', done: infoOk    },
  ];
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <motion.span
              animate={{ backgroundColor: s.done ? '#FFFFFF' : 'transparent' }}
              transition={{ duration: 0.4 }}
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center text-[9px] font-black border-2 transition-colors duration-300 ${
                s.done ? 'border-brand text-dark' : 'border-white/20 text-white/40'
              }`}
            >
              {s.done ? '✓' : s.num}
            </motion.span>
            <span className={`text-[8px] uppercase tracking-[0.35em] font-bold hidden sm:block transition-colors duration-300 ${s.done ? 'text-brand' : 'text-white/30'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <motion.div
              animate={{ backgroundColor: s.done ? '#FFFFFF' : 'rgba(255,255,255,0.10)' }}
              transition={{ duration: 0.4 }}
              className="h-px w-8 sm:w-14 mx-2 sm:mx-3 mt-0 sm:-mt-4"
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Day card ────────────────────────────────────────────── */
function DayCard({ day, selected, onClick }) {
  const ok   = day.status === 'available';
  const full = day.status === 'complet';
  return (
    <motion.button
      type="button"
      onClick={ok ? onClick : undefined}
      disabled={!ok}
      whileHover={ok ? { y: -4, borderColor: 'rgba(255,255,255,0.5)' } : {}}
      whileTap={ok ? { scale: 0.96 } : {}}
      className="relative min-w-[88px] sm:min-w-[96px] flex-shrink-0 snap-start flex flex-col items-center gap-0 pt-4 pb-3 px-3 overflow-hidden select-none transition-all duration-200 border"
      style={{
        background: selected ? '#FFFFFF' : ok ? '#3D2A1E' : '#2A1D13',
        borderColor: selected ? '#FFFFFF' : ok ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
        opacity: ok ? 1 : 0.35,
        cursor: ok ? 'pointer' : 'not-allowed',
      }}>
      <span className="text-[8px] uppercase font-black tracking-[0.45em] mb-1"
            style={{ color: selected ? '#5C4031' : 'rgba(255,255,255,0.45)' }}>{day.dayShort}</span>
      <span className="text-[2rem] font-black leading-none"
            style={{ color: selected ? '#5C4031' : full ? 'rgba(255,255,255,0.25)' : '#FFFFFF' }}>{day.dayNum}</span>
      <span className="text-[8px] font-medium mt-0.5"
            style={{ color: selected ? 'rgba(92,64,49,0.55)' : 'rgba(244,239,234,0.35)' }}>{day.monthShort}</span>
      <div className="mt-2 w-full text-center min-h-[16px]">
        {full && <span className="text-[7px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Complet</span>}
        {ok && !selected && <span className="text-[7px] font-black" style={{ color: 'rgba(255,255,255,0.40)' }}>Dispo</span>}
        {selected && <span className="text-[7px] font-black" style={{ color: 'rgba(92,64,49,0.70)' }}>Sélectionné</span>}
      </div>
    </motion.button>
  );
}

/* ─── Time slot ───────────────────────────────────────────── */
function TimeSlot({ hour, selected, pending, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={pending ? undefined : onClick}
      disabled={pending}
      whileHover={!pending && !selected ? { backgroundColor: '#FFFFFF', color: '#5C4031', borderColor: '#FFFFFF' } : {}}
      whileTap={!pending ? { scale: 0.95 } : {}}
      className="py-3.5 sm:py-4 px-2 text-center font-black text-sm sm:text-base transition-all duration-200 border"
      style={{
        background: selected ? '#FFFFFF' : pending ? 'rgba(255,255,255,0.05)' : '#3D2A1E',
        color: selected ? '#5C4031' : pending ? 'rgba(255,255,255,0.30)' : '#FFFFFF',
        borderColor: selected ? '#FFFFFF' : pending ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)',
        cursor: pending ? 'wait' : 'pointer',
      }}>
      {pending ? <span className="animate-pulse text-white/30">…</span> : hour}
    </motion.button>
  );
}

/* ─── Booking page ────────────────────────────────────────── */
export default function Booking() {
  const { state, selectLocation, selectDate, selectTime, setClientInfo, submitBooking, isLoading } = useBooking();
  const [rawData, setRawData]           = useState(null); // { days, dateBookings, dateBlocks, fullDayOff }
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading]           = useState(true);
  const [loadError, setLoadError]       = useState(null);
  const [formError, setFormError]       = useState(null);

  const sessionId  = useRef(crypto.randomUUID());
  const activeLock = useRef({ date: '', time: '' });
  const [pendingSlot, setPendingSlot] = useState('');
  const [lockExpiry, setLockExpiry]   = useState(null);
  const [timeLeft, setTimeLeft]       = useState(0);
  const [lockError, setLockError]     = useState('');

  const navigate = useNavigate();

  const serviceDuration = state.selectedService?.duration ?? 30;

  const loadAvailability = useCallback(async (preserveSelection = false) => {
    try {
      const { salon, days, dateBookings, dateBlocks, fullDayOff } = await fetchAvailability();
      selectLocation(salon.name);
      setRawData({ days, dateBookings, dateBlocks, fullDayOff });
      if (!preserveSelection) {
        setSelectedDate(state.date || '');
        setSelectedSlot(state.time || '');
      }
      setLoading(false);
    } catch {
      setLoadError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAvailability(false); }, []);
  useEffect(() => {
    const unsub = subscribeToAvailability(() => loadAvailability(true));
    return unsub;
  }, [loadAvailability]);
  useEffect(() => { if (selectedDate) selectDate(selectedDate); }, [selectedDate]);
  useEffect(() => { if (selectedSlot) selectTime(selectedSlot); }, [selectedSlot]);

  /* ── Countdown ── */
  useEffect(() => {
    if (!lockExpiry) return;
    const tick = () => {
      const remaining = Math.max(0, Math.round((lockExpiry - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        setSelectedSlot(''); setLockExpiry(null);
        activeLock.current = { date: '', time: '' };
        setLockError('Ton créneau a expiré. Choisis à nouveau un horaire.');
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockExpiry]);

  useEffect(() => {
    return () => {
      const { date, time } = activeLock.current;
      if (date && time) releaseLock(date, time, sessionId.current);
    };
  }, []);

  const handleSelectSlot = async (slot) => {
    if (slot === selectedSlot) return;
    setLockError(''); setFormError(null);
    const prev = activeLock.current;
    if (prev.date && prev.time && (prev.date !== selectedDate || prev.time !== slot)) {
      releaseLock(prev.date, prev.time, sessionId.current);
      activeLock.current = { date: '', time: '' }; setLockExpiry(null);
    }
    setPendingSlot(slot); setSelectedSlot('');
    try {
      const acquired = await acquireLock(selectedDate, slot, sessionId.current);
      if (acquired) {
        activeLock.current = { date: selectedDate, time: slot };
        setSelectedSlot(slot);
        setLockExpiry(new Date(Date.now() + 5 * 60 * 1000));
      } else {
        setLockError('Ce créneau vient d\'être pris. Choisis un autre horaire.');
        loadAvailability(true);
      }
    } catch { setLockError('Erreur réseau. Réessaie.'); }
    finally { setPendingSlot(''); }
  };

  /* Créneaux calculés dynamiquement selon la prestation choisie */
  const dayWindow = useMemo(() => {
    if (!rawData) return [];
    return buildDayWindow(rawData.days, rawData.fullDayOff, rawData.dateBookings, rawData.dateBlocks, serviceDuration);
  }, [rawData, serviceDuration]);

  const activeSlots = useMemo(() => {
    if (!rawData || !selectedDate) return [];
    const busy = buildBusyRanges(rawData.dateBookings[selectedDate] || [], rawData.dateBlocks[selectedDate] || []);
    const date  = rawData.days.find(d => d.toISOString().slice(0, 10) === selectedDate) ?? new Date(selectedDate);
    return filterPastSlots(generateDynamicSlots(serviceDuration, busy), date);
  }, [rawData, selectedDate, serviceDuration]);

  const handleSelectDate = (key) => {
    const prev = activeLock.current;
    if (prev.date && prev.time) {
      releaseLock(prev.date, prev.time, sessionId.current);
      activeLock.current = { date: '', time: '' }; setLockExpiry(null);
    }
    setLockError(''); setSelectedDate(key); setSelectedSlot('');
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!state.selectedService)                              { setFormError('Choisis une prestation avant de confirmer.'); return; }
    if (!state.clientInfo.name || !state.clientInfo.phone)  { setFormError('Renseigne ton prénom et ton téléphone.'); return; }
    if (!state.date || !state.time)                         { setFormError('Sélectionne un jour et un horaire.'); return; }
    try { await submitBooking(); navigate('/confirmation'); }
    catch (e) { setFormError(e instanceof Error ? e.message : 'Erreur. Réessaie.'); }
  };

  const padTop   = { paddingTop: 'var(--navbar-h, 72px)' };
  const step1done = Boolean(selectedDate && selectedSlot);
  const step2done = Boolean(state.clientInfo.name && state.clientInfo.phone);

  if (loading) return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-5" style={padTop}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
        <ScissorsIcon className="w-10 h-10 text-brand" />
      </motion.div>
      <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-white/40">Chargement des créneaux…</p>
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-6" style={padTop}>
      <div className="text-center max-w-sm">
        <p className="text-lg font-black text-white mb-2">Impossible de charger les disponibilités</p>
        <button onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 bg-brand px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.35em] text-dark">
          Réessayer
        </button>
      </div>
    </div>
  );

  const BG = '#5C4031';
  const BG2 = '#3D2A1E';

  return (
    <div style={{ ...padTop, background: BG }} className="min-h-screen">

      {/* ══ HEADER — steps + prestation ══ */}
      <div className="border-b" style={{ background: BG2, borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-4xl px-6 sm:px-10 py-8 sm:py-10">
          <div className="flex items-start justify-between mb-8">
            <Steps serviceOk={Boolean(state.selectedService)} dateOk={step1done} infoOk={step2done && step1done} />
          </div>
          <AnimatePresence mode="wait">
            {state.selectedService ? (
              <motion.div key="s" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center justify-between gap-4 border-l-[3px] border-white/40 px-5 py-4"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-4 min-w-0">
                  <ScissorsIcon className="w-4 h-4 text-white/40 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] uppercase tracking-[0.45em] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Prestation sélectionnée</p>
                    <p className="text-base sm:text-lg font-black text-white truncate">{state.selectedService.title}</p>
                    <p className="text-[9px] font-medium" style={{ color: 'rgba(255,255,255,0.40)' }}>{state.selectedService.duration} min</p>
                  </div>
                </div>
                <span className="text-xl sm:text-2xl font-black text-white shrink-0">{state.selectedService.priceLabel}</span>
              </motion.div>
            ) : (
              <motion.div key="ns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-wrap items-center justify-between gap-3 border border-red-500/20 bg-red-500/8 px-5 py-4">
                <p className="text-sm text-red-300 font-medium">Aucune prestation sélectionnée</p>
                <Link to="/prestations" className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.4em] text-white">
                  <ScissorsIcon className="w-3 h-3" /> Choisir →
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ══ ÉTAPE 01 — JOUR ══ */}
      <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-4xl px-6 sm:px-10 py-8 sm:py-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[9px] uppercase tracking-[0.6em] font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>01</span>
            <span className="block h-px flex-1 bg-white/10" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.45em] text-white">Choisissez votre jour</h2>
          </div>
          <div className="no-scrollbar flex gap-2 sm:gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {dayWindow.map((d) => (
              <DayCard key={d.key} day={d} selected={selectedDate === d.key} onClick={() => handleSelectDate(d.key)} />
            ))}
          </div>
        </div>
      </div>

      {/* ══ ÉTAPE 02 — HORAIRE ══ */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: BG2 }}>
            <div className="mx-auto max-w-4xl px-6 sm:px-10 py-8 sm:py-10">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[9px] uppercase tracking-[0.6em] font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>02</span>
                <span className="block h-px flex-1 bg-white/10" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.45em] text-white">Choisissez votre horaire</h2>
              </div>
              {activeSlots.length > 0 ? (
                <motion.div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2 sm:gap-2.5"
                  initial="hidden" animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}>
                  {activeSlots.map((h) => (
                    <motion.div key={h} variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1, transition: { duration: 0.25 } } }}>
                      <TimeSlot hour={h} selected={selectedSlot === h} pending={pendingSlot === h} onClick={() => handleSelectSlot(h)} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="flex items-center gap-3 border border-white/10 bg-white/4 px-5 py-4">
                  <span className="text-white/30 text-lg font-black">✗</span>
                  <p className="text-sm font-bold" style={{ color: 'rgba(244,239,234,0.50)' }}>Aucun créneau disponible — choisis un autre jour.</p>
                </div>
              )}
              <AnimatePresence>
                {lockError && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-3 border-l-4 border-amber-500 bg-amber-500/10 px-4 py-3 mt-4">
                    <span className="text-amber-400 font-black shrink-0">!</span>
                    <p className="text-sm text-amber-300 font-medium">{lockError}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ ÉTAPE 03 — INFOS ══ */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden">
            <div className="mx-auto max-w-4xl px-6 sm:px-10 py-8 sm:py-10">
              <div className="flex items-center gap-4 mb-8">
                <span className="text-[9px] uppercase tracking-[0.6em] font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>03</span>
                <span className="block h-px flex-1 bg-white/10" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.45em] text-white">Tes informations</h2>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

                {/* Form */}
                <div className="space-y-5">
                  {[
                    { field: 'name',  type: 'text',  label: 'Prénom & Nom',         placeholder: 'Jean Dupont',      val: state.clientInfo.name  },
                    { field: 'phone', type: 'tel',   label: 'Téléphone (06 ou 07)', placeholder: '06 12 34 56 78',   val: state.clientInfo.phone },
                    { field: 'email', type: 'email', label: 'Email',                placeholder: 'jean@example.com', val: state.clientInfo.email },
                  ].map(({ field, type, label, placeholder, val }) => (
                    <label key={field} className="block">
                      <span className="block text-[9px] uppercase tracking-[0.45em] text-white font-black mb-2">{label}</span>
                      <input type={type} value={val}
                        onChange={(e) => setClientInfo({
                          name:  field === 'name'  ? e.target.value : state.clientInfo.name,
                          phone: field === 'phone' ? e.target.value : state.clientInfo.phone,
                          email: field === 'email' ? e.target.value : state.clientInfo.email,
                        })}
                        placeholder={placeholder}
                        className="w-full border px-5 py-4 text-white text-sm font-medium outline-none transition-colors"
                        style={{ background: BG2, borderColor: 'rgba(255,255,255,0.12)', placeholderColor: 'rgba(255,255,255,0.25)' }}
                        onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.5)'}
                        onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'}
                        disabled={isLoading}
                      />
                    </label>
                  ))}

                  {formError && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 border-l-4 border-red-500 bg-red-500/10 px-4 py-3">
                      <span className="text-red-400 font-black shrink-0">!</span>
                      <p className="text-sm text-red-300 font-medium">{formError}</p>
                    </motion.div>
                  )}

                  <div className="border-l-2 border-white/20 pl-5 py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-[9px] uppercase tracking-[0.45em] font-bold text-white mb-1">Paiement sur place</p>
                    <p className="text-sm font-medium" style={{ color: 'rgba(244,239,234,0.55)' }}>Espèces ou chèque uniquement.</p>
                  </div>

                  <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Confirmation par email et SMS après réservation.
                  </p>
                </div>

                {/* Récap */}
                <div className="flex flex-col gap-5 border p-6 sm:p-7"
                     style={{ background: BG2, borderColor: 'rgba(255,255,255,0.08)' }}>

                  <span className="text-[9px] uppercase tracking-[0.5em] font-bold text-white/40">Récapitulatif</span>

                  <div className="space-y-3">
                    {[
                      { label: 'Prestation', val: state.selectedService?.title ?? '—' },
                      { label: 'Durée',      val: state.selectedService ? `${state.selectedService.duration} min` : '—' },
                      { label: 'Tarif',      val: state.selectedService?.priceLabel ?? '—' },
                      { label: 'Jour', val: selectedDate
                        ? new Date(selectedDate + 'T12:00:00+02:00').toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long' })
                        : '—' },
                      { label: 'Horaire', val: selectedSlot || '—' },
                    ].map((r) => (
                      <div key={r.label} className="flex items-start justify-between gap-3 pb-3 border-b last:border-0 last:pb-0"
                           style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <span className="text-[8px] uppercase tracking-[0.35em] font-bold shrink-0"
                              style={{ color: 'rgba(255,255,255,0.35)' }}>{r.label}</span>
                        <span className="text-xs font-bold text-white text-right capitalize">{r.val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-white/8" />

                  {/* Countdown */}
                  <AnimatePresence>
                    {lockExpiry && selectedSlot && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.35em]">
                          <span className={timeLeft < 60 ? 'text-red-400' : 'text-white/60'}>Créneau réservé</span>
                          <span className={`font-black tabular-nums text-xs ${timeLeft < 60 ? 'text-red-400' : 'text-white/70'}`}>
                            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                          </span>
                        </div>
                        <div className="h-px w-full bg-white/10 overflow-hidden">
                          <div className={`h-full ${timeLeft < 60 ? 'bg-red-400' : 'bg-white'}`}
                               style={{ width: `${(timeLeft / 300) * 100}%` }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button type="button" onClick={handleSubmit}
                    disabled={!state.selectedService || isLoading}
                    whileHover={state.selectedService && !isLoading ? { scale: 1.03 } : {}}
                    whileTap={state.selectedService && !isLoading ? { scale: 0.97 } : {}}
                    className="w-full flex items-center justify-center gap-2.5 py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-300"
                    style={{
                      background: state.selectedService && !isLoading ? '#FFFFFF' : 'rgba(255,255,255,0.06)',
                      color: state.selectedService && !isLoading ? '#5C4031' : 'rgba(255,255,255,0.25)',
                      cursor: state.selectedService && !isLoading ? 'pointer' : 'not-allowed',
                    }}>
                    {isLoading
                      ? <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><ScissorsIcon className="w-4 h-4" /></motion.span> En cours…</>
                      : <><ScissorsIcon className="w-4 h-4" /> Confirmer ma réservation</>
                    }
                  </motion.button>

                  <p className="text-[9px] font-medium text-center" style={{ color: 'rgba(255,255,255,0.20)' }}>
                    Espèces ou chèque · Paiement sur place
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Info section finale ── */}
      <div style={{ background: '#F4EFEA', borderTop: '1px solid rgba(64,85,104,0.12)' }}>
        <div className="mx-auto max-w-4xl px-6 sm:px-10 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 sm:divide-x"
               style={{ borderColor: 'rgba(64,85,104,0.12)' }}>
            {[
              { label: 'Paiement',  val: 'Espèces ou chèque',         icon: '◈' },
              { label: 'Adresse',   val: '1 Rue de la Madeleine, 77170', icon: '◎' },
              { label: 'Horaires',  val: 'Mer–Sam · 10h00–19h30',    icon: '◷' },
            ].map((item, i) => (
              <div key={i} className="sm:px-8 first:pl-0 last:pr-0">
                <p className="text-[8px] uppercase tracking-[0.5em] font-bold mb-2"
                   style={{ color: 'rgba(64,85,104,0.45)' }}>
                  {item.icon} {item.label}
                </p>
                <p className="text-sm font-bold" style={{ color: '#405568' }}>{item.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
