import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import { fetchAvailability, subscribeToAvailability } from '../api/availability';
import { acquireLock, releaseLock } from '../api/slotLock';
import { ScissorsIcon, RazorIcon, CombIcon, DiamondDivider } from '../components/BarberIcons';

/* ─── Day window builder ──────────────────────────────────── */
function buildDayWindow(availability) {
  const keys = Object.keys(availability).sort();
  if (!keys.length) return [];
  const result = [];
  const cur = new Date(keys[0]);
  const end = new Date(keys[keys.length - 1]);
  while (cur <= end) {
    const k   = cur.toISOString().slice(0, 10);
    const dow = cur.getDay();
    const apiSlots = availability[k];
    let status;
    if (dow === 0)                             status = 'ferme';
    else if (apiSlots && apiSlots.length > 0)  status = 'available';
    else if (apiSlots !== undefined)           status = 'complet';
    else                                       status = 'complet';
    result.push({
      key:       k,
      date:      new Date(cur),
      status,
      slots:     apiSlots || [],
      slotCount: apiSlots ? apiSlots.length : 0,
      dayShort:  cur.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase().slice(0, 3),
      dayNum:    cur.getDate(),
      monthShort:cur.toLocaleDateString('fr-FR', { month: 'short' }),
    });
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

/* ─── Step indicator ──────────────────────────────────────── */
function Steps({ serviceOk, dateOk, infoOk }) {
  const steps = [
    { num: '01', label: 'Prestation',    done: serviceOk },
    { num: '02', label: 'Date & Heure',  done: dateOk    },
    { num: '03', label: 'Confirmation',  done: infoOk    },
  ];
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <motion.span
              animate={{ backgroundColor: s.done ? '#C68E17' : 'transparent' }}
              transition={{ duration: 0.4 }}
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center text-[9px] font-black border-2 transition-colors duration-300 ${
                s.done ? 'border-brand text-dark' : 'border-cream/25 text-cream/40'
              }`}
            >
              {s.done ? '✓' : s.num}
            </motion.span>
            <span className={`text-[8px] uppercase tracking-[0.35em] font-bold hidden sm:block transition-colors duration-300 ${s.done ? 'text-brand' : 'text-cream/30'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <motion.div
              animate={{ backgroundColor: s.done ? '#C68E17' : 'rgba(255,248,231,0.12)' }}
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
  const off  = day.status === 'ferme';

  return (
    <motion.button
      type="button"
      onClick={ok ? onClick : undefined}
      disabled={!ok}
      whileHover={ok ? { y: -3 } : {}}
      whileTap={ok ? { scale: 0.96 } : {}}
      className={`
        relative min-w-[90px] sm:min-w-[100px] flex-shrink-0 snap-start
        flex flex-col items-center gap-0 pt-4 pb-3 px-3 overflow-hidden
        transition-all duration-250 select-none
        ${selected
          ? 'bg-dark border-2 border-brand shadow-gold'
          : ok
          ? 'bg-cream border-2 border-beige hover:border-brand cursor-pointer'
          : full
          ? 'bg-red-50 border-2 border-red-200 cursor-not-allowed'
          : 'bg-creamMid border-2 border-beige/30 cursor-not-allowed opacity-50'}
      `}
    >
      {/* Day name */}
      <span className={`text-[8px] uppercase font-black tracking-[0.45em] mb-1 ${
        selected ? 'text-brand' : full ? 'text-red-400' : off ? 'text-muted/40' : 'text-muted'
      }`}>{day.dayShort}</span>

      {/* Day number */}
      <span className={`text-[2rem] font-black leading-none ${
        selected ? 'text-cream' : full ? 'text-red-400' : off ? 'text-muted/30' : 'text-dark'
      }`}>{day.dayNum}</span>

      {/* Month */}
      <span className={`text-[8px] font-medium mt-0.5 ${
        selected ? 'text-cream/50' : 'text-muted/60'
      }`}>{day.monthShort}</span>

      {/* Status */}
      <div className="mt-2 w-full text-center min-h-[16px]">
        {off  && <span className="text-[7px] text-muted/35 font-bold uppercase tracking-widest">Fermé</span>}
        {full && <span className="text-[7px] text-red-400 font-black uppercase tracking-widest">Complet</span>}
        {ok   && <span className={`text-[7px] font-black ${selected ? 'text-brand' : 'text-brand/70'}`}>{day.slotCount} crén.</span>}
      </div>

      {/* Bottom accent bar */}
      {selected && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />}
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
      whileHover={!pending ? { scale: 1.05, y: -2 } : {}}
      whileTap={!pending ? { scale: 0.95 } : {}}
      className={`py-3.5 sm:py-4 px-2 text-center font-black text-sm sm:text-base transition-all duration-200 ${
        pending
          ? 'bg-brand/15 text-brand/50 border-2 border-brand/30 cursor-wait'
          : selected
          ? 'bg-brand text-dark border-2 border-brand shadow-gold'
          : 'bg-cream text-dark border-2 border-beige hover:border-brand hover:text-brand'
      }`}
    >
      {pending ? <span className="animate-pulse">…</span> : hour}
    </motion.button>
  );
}

/* ─── Booking page ────────────────────────────────────────── */
export default function Booking() {
  const { state, selectLocation, selectDate, selectTime, setClientInfo, submitBooking, isLoading } = useBooking();
  const [salonInfo, setSalonInfo]       = useState(null);
  const [availability, setAvailability] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading]           = useState(true);
  const [loadError, setLoadError]       = useState(null);
  const [formError, setFormError]       = useState(null);

  /* ── Slot lock state ── */
  const sessionId   = useRef(crypto.randomUUID());
  const activeLock  = useRef({ date: '', time: '' });
  const [pendingSlot, setPendingSlot] = useState('');
  const [lockExpiry, setLockExpiry]   = useState(null);
  const [timeLeft, setTimeLeft]       = useState(0);
  const [lockError, setLockError]     = useState('');

  const navigate = useNavigate();

  const loadAvailability = useCallback(async (preserveSelection = false) => {
    try {
      const { salon, availability: av } = await fetchAvailability();
      setSalonInfo(salon);
      setAvailability(av);
      selectLocation(salon.name);
      if (!preserveSelection) {
        const first = Object.keys(av).find((k) => av[k]?.length > 0) ?? '';
        const init  = state.date || first;
        setSelectedDate(init);
        setSelectedSlot(state.time || (av[init]?.[0] ?? ''));
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

  /* ── Countdown tick ─────────────────────────────────────── */
  useEffect(() => {
    if (!lockExpiry) return;
    const tick = () => {
      const remaining = Math.max(0, Math.round((lockExpiry - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        setSelectedSlot('');
        setLockExpiry(null);
        activeLock.current = { date: '', time: '' };
        setLockError('Ton créneau a expiré. Choisis à nouveau un horaire.');
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockExpiry]);

  /* ── Libérer le verrou si l'utilisateur quitte la page ── */
  useEffect(() => {
    return () => {
      const { date, time } = activeLock.current;
      if (date && time) releaseLock(date, time, sessionId.current);
    };
  }, []);

  /* ── Acquérir un verrou sur le créneau sélectionné ──────── */
  const handleSelectSlot = async (slot) => {
    if (slot === selectedSlot) return;
    setLockError('');
    setFormError(null);

    // Libérer l'ancien verrou si différent
    const prev = activeLock.current;
    if (prev.date && prev.time && (prev.date !== selectedDate || prev.time !== slot)) {
      releaseLock(prev.date, prev.time, sessionId.current);
      activeLock.current = { date: '', time: '' };
      setLockExpiry(null);
    }

    setPendingSlot(slot);
    setSelectedSlot('');

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
    } catch {
      setLockError('Erreur réseau. Réessaie.');
    } finally {
      setPendingSlot('');
    }
  };

  const dayWindow    = useMemo(() => buildDayWindow(availability), [availability]);
  const activeSlots  = useMemo(() => availability[selectedDate] || [], [availability, selectedDate]);

  const handleSelectDate = (key) => {
    // Libérer le verrou si on change de jour
    const prev = activeLock.current;
    if (prev.date && prev.time) {
      releaseLock(prev.date, prev.time, sessionId.current);
      activeLock.current = { date: '', time: '' };
      setLockExpiry(null);
    }
    setLockError('');
    setSelectedDate(key);
    setSelectedSlot('');
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!state.selectedService)                             { setFormError('Choisis une prestation avant de confirmer.'); return; }
    if (!state.clientInfo.name || !state.clientInfo.phone) { setFormError('Renseigne ton prénom et ton téléphone.'); return; }
    if (!state.date || !state.time)                        { setFormError('Sélectionne un jour et un horaire.'); return; }
    try { await submitBooking(); navigate('/confirmation'); }
    catch (e) { setFormError(e instanceof Error ? e.message : 'Erreur. Réessaie.'); }
  };

  const padTop   = { paddingTop: 'var(--navbar-h, 72px)' };
  const step1done = Boolean(selectedDate && selectedSlot);
  const step2done = Boolean(state.clientInfo.name && state.clientInfo.phone);

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-5" style={padTop}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
        <ScissorsIcon className="w-10 h-10 text-brand" />
      </motion.div>
      <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-cream/40">Chargement des créneaux…</p>
    </div>
  );

  /* ── Error ── */
  if (loadError) return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6" style={padTop}>
      <div className="text-center max-w-sm">
        <ScissorsIcon className="w-8 h-8 text-red-500 mx-auto mb-5" />
        <p className="text-lg font-black text-dark mb-2">Impossible de charger les disponibilités</p>
        <p className="text-sm text-muted mb-7">Vérifie ta connexion et réessaie.</p>
        <button onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-brand px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.35em] text-dark hover:bg-brandDark transition-colors">
          <ScissorsIcon className="w-3.5 h-3.5" /> Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div style={padTop} className="min-h-screen bg-cream">

      {/* ══════════ HEADER SOMBRE ═══════════════════════════ */}
      <div
        className="relative bg-dark grain overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(74,47,26,0.97) 40%, rgba(74,47,26,0.85) 100%), url("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=60")',
          backgroundSize: 'cover', backgroundPosition: 'center right',
        }}
      >
        <ScissorsIcon className="absolute -right-4 top-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 text-cream/3 pointer-events-none" />

        <div className="mx-auto max-w-4xl px-6 sm:px-10 py-8 sm:py-10">
          {/* Steps progress */}
          <div className="flex items-start justify-between mb-7 sm:mb-8">
            <Steps
              serviceOk={Boolean(state.selectedService)}
              dateOk={step1done}
              infoOk={step2done && step1done}
            />
          </div>

          {/* Service sélectionné */}
          <AnimatePresence mode="wait">
            {state.selectedService ? (
              <motion.div
                key="service"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between gap-4 border-l-4 border-brand bg-cream/5 px-5 py-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <ScissorsIcon className="w-4 h-4 text-brand shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] uppercase tracking-[0.45em] text-cream/40 font-medium">Prestation</p>
                    <p className="text-base sm:text-lg font-black text-cream truncate">{state.selectedService.title}</p>
                  </div>
                </div>
                <span className="text-xl sm:text-2xl font-black text-brand shrink-0">{state.selectedService.priceLabel}</span>
              </motion.div>
            ) : (
              <motion.div
                key="no-service"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-wrap items-center justify-between gap-3 border border-red-500/25 bg-red-500/8 px-5 py-4"
              >
                <p className="text-sm text-red-300 font-medium">Aucune prestation sélectionnée</p>
                <Link to="/prestations" className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.4em] text-brand hover:text-brandDark transition-colors">
                  <ScissorsIcon className="w-3 h-3" /> Choisir une prestation →
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ══════════ ÉTAPE 01 — CHOISIR UN JOUR ═══════════════ */}
      <div className="bg-cream border-b border-beige">
        <div className="mx-auto max-w-4xl px-6 sm:px-10 py-8 sm:py-10">

          {/* Label */}
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex h-7 w-7 items-center justify-center bg-dark text-brand text-[9px] font-black border border-dark/0">01</span>
            <h2 className="text-[10px] font-black uppercase tracking-[0.45em] text-dark">Choisissez votre jour</h2>
          </div>

          {/* Légende */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-5 text-[9px] font-bold uppercase tracking-[0.35em]">
            <span className="flex items-center gap-1.5 text-dark/50"><span className="inline-block w-3 h-3 border-2 border-brand" /> Disponible</span>
            <span className="flex items-center gap-1.5 text-red-400"><span className="inline-block w-3 h-3 bg-red-100 border-2 border-red-300" /> Complet</span>
            <span className="flex items-center gap-1.5 text-muted/50"><span className="inline-block w-3 h-3 bg-creamMid border-2 border-beige/40" /> Fermé</span>
          </div>

          {/* Day scroller */}
          <div className="no-scrollbar flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {dayWindow.map((d) => (
              <DayCard key={d.key} day={d} selected={selectedDate === d.key} onClick={() => handleSelectDate(d.key)} />
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ ÉTAPE 02 — CHOISIR UN HORAIRE ════════════ */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-beige"
          >
            <div className="bg-creamMid">
              <div className="mx-auto max-w-4xl px-6 sm:px-10 py-8 sm:py-10">

                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex h-7 w-7 items-center justify-center bg-dark text-brand text-[9px] font-black">02</span>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.45em] text-dark">Choisissez votre horaire</h2>
                </div>

                {activeSlots.length > 0 ? (
                  <motion.div
                    className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2.5 sm:gap-3"
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
                  >
                    {activeSlots.map((h) => (
                      <motion.div key={h} variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1, transition: { duration: 0.3 } } }}>
                        <TimeSlot
                          hour={h}
                          selected={selectedSlot === h}
                          pending={pendingSlot === h}
                          onClick={() => handleSelectSlot(h)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-3 border border-red-200 bg-red-50 px-5 py-4">
                    <span className="text-red-400 text-lg font-black">✗</span>
                    <p className="text-sm font-bold text-red-700">Aucun créneau disponible — choisis un autre jour.</p>
                  </div>
                )}

                {/* Erreur de verrou */}
                <AnimatePresence>
                  {lockError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-3 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 mt-4"
                    >
                      <span className="text-amber-500 font-black shrink-0">!</span>
                      <p className="text-sm text-amber-800 font-medium">{lockError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ ÉTAPE 03 — INFOS & CONFIRMATION ══════════ */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-cream">
              <div className="mx-auto max-w-4xl px-6 sm:px-10 py-8 sm:py-10">

                <div className="flex items-center gap-3 mb-8">
                  <span className="inline-flex h-7 w-7 items-center justify-center bg-dark text-brand text-[9px] font-black">03</span>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.45em] text-dark">Tes informations</h2>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

                  {/* ── Form ── */}
                  <div className="space-y-5">
                    {[
                      { field: 'name',  type: 'text',  label: 'Prénom & Nom',         placeholder: 'Jean Dupont',       val: state.clientInfo.name  },
                      { field: 'phone', type: 'tel',   label: 'Téléphone (06 ou 07)', placeholder: '06 12 34 56 78',    val: state.clientInfo.phone },
                      { field: 'email', type: 'email', label: 'Email',                placeholder: 'jean@example.com',  val: state.clientInfo.email },
                    ].map(({ field, type, label, placeholder, val }) => (
                      <label key={field} className="block">
                        <span className="block text-[9px] uppercase tracking-[0.45em] text-dark font-black mb-2">{label}</span>
                        <input
                          type={type}
                          value={val}
                          onChange={(e) => setClientInfo({
                            name:  field === 'name'  ? e.target.value : state.clientInfo.name,
                            phone: field === 'phone' ? e.target.value : state.clientInfo.phone,
                            email: field === 'email' ? e.target.value : state.clientInfo.email,
                          })}
                          placeholder={placeholder}
                          className="w-full border-2 border-beige bg-creamMid px-5 py-4 text-dark text-sm font-medium placeholder:text-muted/40 outline-none transition-colors focus:border-brand"
                          disabled={isLoading}
                        />
                      </label>
                    ))}

                    {formError && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 border-l-4 border-red-500 bg-red-50 px-4 py-3">
                        <span className="text-red-500 font-black shrink-0">!</span>
                        <p className="text-sm text-red-700 font-medium">{formError}</p>
                      </motion.div>
                    )}

                    <p className="text-xs text-muted font-medium leading-5">
                      📧 Un email de confirmation te sera envoyé après la réservation.
                    </p>
                  </div>

                  {/* ── Récap & Confirm ── */}
                  <div className="bg-dark p-6 sm:p-7 flex flex-col gap-5">
                    <p className="text-[9px] uppercase tracking-[0.5em] text-brand font-bold">Récapitulatif</p>

                    <div className="space-y-3">
                      {[
                        { label: 'Salon',      val: salonInfo?.name },
                        { label: 'Prestation', val: state.selectedService?.title ?? '—' },
                        { label: 'Tarif',      val: state.selectedService?.priceLabel ?? '—' },
                        { label: 'Jour', val: selectedDate
                          ? new Date(selectedDate + 'T12:00:00+02:00').toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long' })
                          : '—' },
                        { label: 'Horaire', val: selectedSlot || '—' },
                      ].map((r) => (
                        <div key={r.label} className="flex items-start justify-between gap-3 border-b border-cream/8 pb-2.5 last:border-0 last:pb-0">
                          <span className="text-[8px] uppercase tracking-[0.35em] text-cream/40 font-bold shrink-0">{r.label}</span>
                          <span className="text-xs font-bold text-cream text-right capitalize">{r.val}</span>
                        </div>
                      ))}
                    </div>

                    <DiamondDivider className="text-cream/20" />

                    {/* Countdown verrou */}
                    <AnimatePresence>
                      {lockExpiry && selectedSlot && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.35em]">
                            <span className={timeLeft < 60 ? 'text-red-400' : 'text-brand'}>Créneau réservé</span>
                            <span className={`font-black tabular-nums text-xs ${timeLeft < 60 ? 'text-red-400' : 'text-cream/70'}`}>
                              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                            </span>
                          </div>
                          <div className="h-0.5 w-full bg-cream/10 overflow-hidden">
                            <motion.div
                              className={`h-full transition-colors duration-1000 ${timeLeft < 60 ? 'bg-red-400' : 'bg-brand'}`}
                              style={{ width: `${(timeLeft / 300) * 100}%` }}
                            />
                          </div>
                          <p className="text-[8px] text-cream/30">Confirme avant expiration du délai.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Confirm CTA */}
                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!state.selectedService || isLoading}
                      whileHover={state.selectedService && !isLoading ? { scale: 1.03 } : {}}
                      whileTap={state.selectedService && !isLoading ? { scale: 0.97 } : {}}
                      className={`w-full flex items-center justify-center gap-2.5 py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-300 ${
                        state.selectedService && !isLoading
                          ? 'bg-brand text-dark hover:bg-brandDark shadow-gold cursor-pointer'
                          : 'bg-cream/8 text-cream/30 cursor-not-allowed'
                      }`}
                    >
                      {isLoading
                        ? <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><ScissorsIcon className="w-4 h-4" /></motion.span> En cours…</>
                        : <><ScissorsIcon className="w-4 h-4" /> Confirmer ma réservation</>
                      }
                    </motion.button>

                    <p className="text-[9px] text-cream/25 font-medium text-center">Confirmation par email après réservation</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom spacer */}
      <div className="bg-cream h-12 sm:h-16" />
    </div>
  );
}
