import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import { fetchAvailability, subscribeToAvailability } from '../api/availability';
import { acquireLock, releaseLock } from '../api/slotLock';
import { buildBusyRanges, generateDynamicSlots, filterPastSlots, OPEN_DAYS } from '../utils/timeSlots';
import { createBatchBooking, createBooking } from '../api/booking';
import { serviceCategories } from '../data/services';
import { ScissorsIcon } from '../components/BarberIcons';

/* ─── Day window builder ──────────────────────────────────── */
function buildDayWindow(days, fullDayOff, dateBookings, dateBlocks, serviceDuration) {
  return days.map((date) => {
    const k   = date.getFullYear() + '-' + String(date.getMonth()+1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0');
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

  const sessionId      = useRef(crypto.randomUUID());
  const activeLock     = useRef({ date: '', time: '' });
  const selectedDateRef = useRef('');
  const dayScrollerRef  = useRef(null);
  const [pendingSlot, setPendingSlot] = useState('');
  const [lockExpiry, setLockExpiry]   = useState(null);
  const [timeLeft, setTimeLeft]       = useState(0);
  const [lockError, setLockError]     = useState('');

  /* ── Choix du mode (null = pas encore choisi) ── */
  const [bookingMode, setBookingMode] = useState(null); // 'solo' | 'multi' | 'group'

  const isMulti = bookingMode === 'multi';
  const isGroup = bookingMode === 'group';

  const resetMode = () => {
    setBookingMode(null);
    setMultiDates([]); setMultiSlots({});
    setGroupPeople([{id:0,name:'',service:null,slot:''}]); setGroupDate('');
    setSelectedDate(''); setSelectedSlot('');
    setFormError(null);
  };

  /* ── Mode multi-réservation ── */
  const [multiDates, setMultiDates] = useState([]);
  const [multiSlots, setMultiSlots] = useState({});

  /* ── Mode groupe (famille / amis) ── */
  const [groupDate, setGroupDate] = useState('');
  const [groupPeople, setGroupPeople] = useState([
    { id: 0, name: '', service: null, slot: '' }, // leader
  ]);
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);
  const ldk = (d) => d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  const allServices = serviceCategories.flatMap(c => c.services);

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
      } else {
        // Si le jour sélectionné vient d'être bloqué par le barbier → clear
        const cur = selectedDateRef.current;
        if (cur && fullDayOff.has(cur)) {
          setSelectedDate('');
          setSelectedSlot('');
          setLockError('Ce jour vient d\'être fermé par le barbier. Choisis une autre date.');
        }
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
  useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);
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
    const lk = (d) => d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    const date  = rawData.days.find(d => lk(d) === selectedDate) ?? new Date(selectedDate + 'T12:00:00');
    return filterPastSlots(generateDynamicSlots(serviceDuration, busy), date);
  }, [rawData, selectedDate, serviceDuration]);

  /* Slots pré-calculés pour chaque participant du groupe */
  const allGroupSlots = useMemo(() => {
    if (!rawData || !groupDate) return groupPeople.map(() => []);
    return groupPeople.map((_, i) => getGroupSlots(i));
  }, [rawData, groupDate, groupPeople, getGroupSlots]);

  /* Onglets de navigation rapide par mois */
  const months = useMemo(() => {
    const seen = new Set();
    return dayWindow.reduce((acc, d) => {
      const mk = d.key.slice(0, 7);
      if (!seen.has(mk)) {
        seen.add(mk);
        const label = new Date(d.key + 'T12:00:00').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        acc.push({ key: mk, label, firstDayKey: d.key });
      }
      return acc;
    }, []);
  }, [dayWindow]);

  const scrollToMonth = (firstDayKey) => {
    const target = dayScrollerRef.current?.querySelector(`[data-date="${firstDayKey}"]`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  };

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

  /* ── Mode groupe : helpers ── */
  const addGroupPerson = () =>
    setGroupPeople(prev => [...prev, { id: Date.now(), name: '', service: null, slot: '' }]);

  const removeGroupPerson = (id) =>
    setGroupPeople(prev => prev.filter(p => p.id !== id));

  const updateGroupPerson = (id, patch) =>
    setGroupPeople(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, ...patch };
      if (patch.service) updated.slot = ''; // Reset slot when service changes
      return updated;
    }));

  /* Créneaux dispo pour un participant — tient compte des slots déjà pris par les précédents */
  const getGroupSlots = useCallback((index) => {
    if (!rawData || !groupDate || !groupPeople[index]?.service) return [];
    const baseBusy = buildBusyRanges(rawData.dateBookings[groupDate] || [], rawData.dateBlocks[groupDate] || []);
    const prevParticipants = groupPeople.slice(0, index).filter(p => p.slot && p.service);
    const prevBusy = prevParticipants.length > 0 
      ? buildBusyRanges(
          prevParticipants.map(p => ({ time: p.slot, duration: p.service.duration })),
          []
        )
      : [];
    const allBusy = [...baseBusy, ...prevBusy].sort((a, b) => a.start - b.start);
    const dateObj = rawData.days.find(d => ldk(d) === groupDate) ?? new Date(groupDate + 'T12:00:00');
    return filterPastSlots(generateDynamicSlots(groupPeople[index].service.duration, allBusy), dateObj);
  }, [rawData, groupDate, groupPeople]);

  const handleGroupSubmit = async () => {
    setFormError(null);
    const incomplete = groupPeople.filter(p => !p.name.trim() || !p.service || !p.slot);
    if (incomplete.length > 0) { setFormError('Chaque participant doit avoir un prénom, une prestation et un horaire.'); return; }
    if (!state.clientInfo.phone) { setFormError('Renseigne ton téléphone.'); return; }

    setIsSubmittingGroup(true);
    try {
      const results = [];
      for (const p of groupPeople) {
        const cn = await createBooking({
          service:     p.service,
          date:        groupDate,
          time:        p.slot,
          clientName:  p.name.trim(),
          clientPhone: state.clientInfo.phone,
          clientEmail: state.clientInfo.email,
        });
        results.push({ name: p.name, service: p.service.title, date: groupDate, time: p.slot, confirmationNumber: cn });
      }
      navigate('/confirmation', { state: { multiBookings: results, isGroup: true } });
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erreur. Réessaie.');
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  /* ── Mode multi : basculer une date ── */
  const handleMultiToggleDate = (key) => {
    if (!rawData) return;
    setMultiDates(prev => {
      if (prev.includes(key)) {
        setMultiSlots(s => { const c = { ...s }; delete c[key]; return c; });
        return prev.filter(d => d !== key);
      }
      if (prev.length >= 6) return prev; // max 6 dates
      return [...prev, key];
    });
  };

  /* ── Mode multi : soumettre tous les RDV ── */
  const [isSubmittingMulti, setIsSubmittingMulti] = useState(false);
  const handleMultiSubmit = async () => {
    setFormError(null);
    if (!state.selectedService)                             { setFormError('Choisis une prestation.'); return; }
    if (!state.clientInfo.name || !state.clientInfo.phone) { setFormError('Renseigne ton prénom et ton téléphone.'); return; }
    const missing = multiDates.filter(d => !multiSlots[d]);
    if (missing.length > 0) { setFormError(`Choisis un horaire pour chaque date sélectionnée.`); return; }
    if (multiDates.length === 0) { setFormError('Sélectionne au moins une date.'); return; }

    setIsSubmittingMulti(true);
    try {
      const bookings = multiDates.map(d => ({ date: d, time: multiSlots[d] }));
      const results = await createBatchBooking({
        service:     state.selectedService,
        bookings,
        clientName:  state.clientInfo.name,
        clientPhone: state.clientInfo.phone,
        clientEmail: state.clientInfo.email,
      });
      navigate('/confirmation', { state: { multiBookings: results, service: state.selectedService } });
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erreur. Réessaie.');
    } finally {
      setIsSubmittingMulti(false);
    }
  };

  const padTop   = { paddingTop: 'var(--navbar-h, 72px)' };
  const step1done = Boolean(selectedDate && selectedSlot);
  const step2done = Boolean(state.clientInfo.name && state.clientInfo.phone);

  /* Ne bloquer sur le loading/error QUE si le client a déjà choisi un mode.
     La sélection de mode s'affiche immédiatement sans attendre les dispo. */
  if (bookingMode && loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ ...padTop, background: '#5C4031' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
        <ScissorsIcon className="w-10 h-10 text-white/60" />
      </motion.div>
      <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-white/40">Chargement des créneaux…</p>
    </div>
  );

  if (bookingMode && loadError) return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ ...padTop, background: '#5C4031' }}>
      <div className="text-center max-w-sm">
        <p className="text-lg font-black text-white mb-2">Impossible de charger les disponibilités</p>
        <button type="button" onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 bg-white px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.35em]"
          style={{ color: '#5C4031' }}>
          Réessayer
        </button>
      </div>
    </div>
  );

  const BG = '#5C4031';
  const BG2 = '#3D2A1E';

  return (
    <div style={{ ...padTop, background: BG }} className="min-h-screen">

      {/* ══ SÉLECTION DU MODE ══════════════════════════════════ */}
      {!bookingMode && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-4xl px-6 sm:px-10 py-14 sm:py-20">

          <p className="text-[9px] uppercase tracking-[0.6em] font-bold mb-3"
             style={{ color: 'rgba(255,255,255,0.35)' }}>
            Je réserve pour…
          </p>
          <h2 className="font-black uppercase text-white mb-10 tracking-[-0.03em]"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)' }}>
            Choisissez votre type de réservation
          </h2>

          {/* Rangées style Engagements */}
          <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {[
              { num: '01', mode: 'solo',  title: 'Pour moi seul',   desc: 'Un seul créneau pour une prestation.',                                        tag: 'Solo' },
              { num: '02', mode: 'multi', title: 'Plusieurs dates',  desc: 'Même service réservé sur plusieurs semaines à venir.',                       tag: 'Jusqu\'à 6 dates' },
              { num: '03', mode: 'group', title: 'En groupe',        desc: 'Famille, amis — chacun choisit son service et son horaire le même jour.', tag: 'Jusqu\'à 8 personnes' },
            ].map((opt, i) => (
              <motion.button key={opt.mode} type="button"
                onClick={() => setBookingMode(opt.mode)}
                className="group relative flex items-center gap-6 sm:gap-10 py-8 sm:py-10 w-full text-left border-b transition-all duration-300"
                style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#3D2A1E' }}
                whileHover={{ backgroundColor: '#2E1F14' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: i * 0.1 }}>

                {/* Barre gauche au hover */}
                <motion.div className="absolute left-0 top-0 bottom-0 w-[3px] bg-white origin-top"
                  initial={{ scaleY: 0 }}
                  whileHover={{ scaleY: 1 }}
                  transition={{ duration: 0.3 }} />

                <span className="text-[9px] font-black uppercase tracking-[0.6em] shrink-0 pl-4 sm:pl-6"
                      style={{ color: 'rgba(255,255,255,0.22)' }}>
                  {opt.num}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="font-black uppercase text-white tracking-[-0.02em] group-hover:text-white/80 transition-colors"
                     style={{ fontSize: 'clamp(1.1rem, 3vw, 1.8rem)' }}>
                    {opt.title}
                  </p>
                  <p className="text-sm font-medium mt-1 leading-6"
                     style={{ color: 'rgba(244,239,234,0.45)' }}>
                    {opt.desc}
                  </p>
                </div>

                <span className="text-[8px] font-bold uppercase tracking-[0.4em] border px-3 py-1 shrink-0 hidden sm:block mr-2"
                      style={{ color: 'rgba(255,255,255,0.30)', borderColor: 'rgba(255,255,255,0.12)' }}>
                  {opt.tag}
                </span>

                <span className="text-white/25 group-hover:text-white transition-colors text-base shrink-0 pr-4 sm:pr-6">→</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ══ HEADER — steps + prestation (affiché après sélection du mode) ══ */}
      <AnimatePresence>
        {bookingMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="border-b" style={{ background: BG2, borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-4xl px-6 sm:px-10 py-8 sm:py-10">
          <div className="flex items-start justify-between mb-6">
            {bookingMode !== 'group' && (
              <Steps serviceOk={Boolean(state.selectedService)} dateOk={step1done} infoOk={step2done && step1done} />
            )}
            {bookingMode === 'group' && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.55em] font-bold text-white/40">Mode groupe</p>
                <p className="text-sm font-black text-white mt-0.5">Réservation familiale / amis</p>
              </div>
            )}
            <button onClick={resetMode}
              className="text-[8px] uppercase tracking-[0.4em] font-bold transition-colors shrink-0 ml-4"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => e.target.style.color='#FFFFFF'}
              onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.35)'}>
              ← Changer
            </button>
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

      {/* ══ ÉTAPE 01 — JOUR (mode solo & multi uniquement) ══ */}
      <AnimatePresence>
        {!isGroup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-4xl px-6 sm:px-10 py-8 sm:py-10">
          {/* Header step 01 */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[9px] uppercase tracking-[0.6em] font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>01</span>
            <span className="block h-px flex-1 bg-white/10" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.45em] text-white">
              {isMulti ? 'Choisissez vos jours' : 'Choisissez votre jour'}
            </h2>
          </div>

          {/* Onglets mois — navigation rapide */}
          {months.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {months.map((m) => (
                <button key={m.key} onClick={() => scrollToMonth(m.firstDayKey)}
                  className="px-3 py-1.5 text-[9px] uppercase tracking-[0.4em] font-bold border transition-all duration-200 hover:text-white hover:border-white/50"
                  style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.45)', background: 'transparent' }}>
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {/* Défileur de jours */}
          <div ref={dayScrollerRef} className="no-scrollbar flex gap-2 sm:gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {dayWindow.map((d) => {
              const multiSelected = multiDates.includes(d.key);
              if (isMulti) {
                const ok = d.status === 'available';
                return (
                  <div key={d.key} data-date={d.key} className="flex-shrink-0">
                    <motion.button
                      type="button"
                      onClick={ok ? () => handleMultiToggleDate(d.key) : undefined}
                      disabled={!ok}
                      whileHover={ok ? { y: -3 } : {}}
                      className="relative min-w-[88px] sm:min-w-[96px] flex flex-col items-center pt-4 pb-3 px-3 select-none border transition-all duration-200"
                      style={{
                        background: multiSelected ? '#FFFFFF' : ok ? '#3D2A1E' : '#2A1D13',
                        borderColor: multiSelected ? '#FFFFFF' : ok ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                        opacity: ok ? 1 : 0.3, cursor: ok ? 'pointer' : 'not-allowed',
                      }}>
                      <span className="text-[8px] uppercase font-black tracking-[0.45em] mb-1"
                            style={{ color: multiSelected ? '#5C4031' : 'rgba(255,255,255,0.45)' }}>{d.dayShort}</span>
                      <span className="text-[2rem] font-black leading-none"
                            style={{ color: multiSelected ? '#5C4031' : '#FFFFFF' }}>{d.dayNum}</span>
                      <span className="text-[8px] font-medium mt-0.5"
                            style={{ color: multiSelected ? 'rgba(92,64,49,0.55)' : 'rgba(244,239,234,0.35)' }}>{d.monthShort}</span>
                      <div className="mt-2 w-full text-center min-h-[16px]">
                        {multiSelected
                          ? <span className="text-[9px] font-black" style={{ color: '#5C4031' }}>✓</span>
                          : ok ? <span className="text-[7px] font-black" style={{ color: 'rgba(255,255,255,0.40)' }}>+</span>
                          : null}
                      </div>
                    </motion.button>
                  </div>
                );
              }
              return (
                <div key={d.key} data-date={d.key} className="flex-shrink-0">
                  <DayCard day={d} selected={selectedDate === d.key} onClick={() => handleSelectDate(d.key)} />
                </div>
              );
            })}
          </div>

          {/* ── Section créneaux par date (mode multi) ── */}
          <AnimatePresence>
            {isMulti && multiDates.length > 0 && rawData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }}
                className="overflow-hidden mt-6">
                <p className="text-[9px] uppercase tracking-[0.5em] font-bold mb-4"
                   style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {multiDates.length} date{multiDates.length > 1 ? 's' : ''} sélectionnée{multiDates.length > 1 ? 's' : ''} — choisis un horaire pour chacune
                </p>
                <div className="space-y-4">
                  {multiDates.map(dk => {
                    const dayInfo = dayWindow.find(d => d.key === dk);
                    const busy  = buildBusyRanges(rawData.dateBookings[dk] || [], rawData.dateBlocks[dk] || []);
                    const lk2 = (d) => d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
                    const dateObj = rawData.days.find(d => lk2(d) === dk) ?? new Date(dk + 'T12:00:00');
                    const slots = filterPastSlots(generateDynamicSlots(serviceDuration, busy), dateObj);
                    const chosen = multiSlots[dk];
                    return (
                      <div key={dk} className="border p-4" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#3D2A1E' }}>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-black text-white">
                            {dayInfo ? `${dayInfo.dayShort} ${dayInfo.dayNum} ${dayInfo.monthShort}` : dk}
                          </p>
                          {chosen && <span className="text-[9px] font-black text-white border border-white/30 px-2 py-0.5">{chosen}</span>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {slots.map(slot => (
                            <button key={slot}
                              onClick={() => setMultiSlots(prev => ({ ...prev, [dk]: slot }))}
                              className="py-2 px-3 text-xs font-black border transition-all duration-150"
                              style={{
                                background: chosen === slot ? '#FFFFFF' : '#2E1F14',
                                color: chosen === slot ? '#5C4031' : 'rgba(255,255,255,0.70)',
                                borderColor: chosen === slot ? '#FFFFFF' : 'rgba(255,255,255,0.12)',
                              }}>
                              {slot}
                            </button>
                          ))}
                          {slots.length === 0 && (
                            <p className="text-xs" style={{ color: 'rgba(244,239,234,0.40)' }}>Aucun créneau disponible</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ══ MODE GROUPE ════════════════════════════════════════ */}
      <AnimatePresence>
        {isGroup && rawData && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4 }}
            className="overflow-hidden">
            <div className="mx-auto max-w-5xl px-6 sm:px-10 py-8 sm:py-10">

              {/* Header Groupe */}
              <div className="mb-8">
                <p className="text-[9px] uppercase tracking-[0.6em] font-bold text-white/40 mb-2">Mode groupe</p>
                <h2 className="text-[1.8rem] sm:text-[2.2rem] font-black text-white tracking-[-0.02em] mb-6">
                  Réservation familiale / amis
                </h2>

                {/* Jour du rendez-vous */}
                <div>
                  <p className="text-[9px] uppercase tracking-[0.55em] font-bold text-white mb-3">Sélectionnez la date</p>
                  <div className="no-scrollbar flex gap-2 overflow-x-auto pb-3">
                    {dayWindow.filter(d => d.status === 'available').map(d => (
                      <motion.button key={d.key} type="button"
                        onClick={() => { setGroupDate(d.key); setGroupPeople(prev => prev.map(p => ({ ...p, slot: '' }))); }}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.96 }}
                        className="flex-shrink-0 flex flex-col items-center gap-1 p-3 border transition-all"
                        style={{
                          minWidth: '88px',
                          background: groupDate === d.key ? '#FFFFFF' : '#3D2A1E',
                          borderColor: groupDate === d.key ? '#FFFFFF' : 'rgba(255,255,255,0.12)',
                        }}>
                        <span className="text-[7px] font-black tracking-[0.4em]" style={{ color: groupDate === d.key ? '#5C4031' : 'rgba(255,255,255,0.50)' }}>
                          {d.dayShort}
                        </span>
                        <span className="text-[1.8rem] font-black leading-none" style={{ color: groupDate === d.key ? '#5C4031' : '#FFFFFF' }}>
                          {d.dayNum}
                        </span>
                        <span className="text-[7px] font-medium" style={{ color: groupDate === d.key ? 'rgba(92,64,49,0.60)' : 'rgba(244,239,234,0.40)' }}>
                          {d.monthShort}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Participants Section */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.6em] font-bold text-white/40 mb-1">Participants</p>
                    <p className="text-sm font-black text-white">{groupPeople.length} / 8</p>
                  </div>
                  {groupPeople.length < 8 && (
                    <motion.button onClick={addGroupPerson}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] border border-white/30 px-4 py-2.5 text-white hover:border-white/70 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      + Ajouter
                    </motion.button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {groupPeople.map((person, i) => {
                    const isComplete = person.name.trim() && person.service && person.slot;
                    const progress = [person.name.trim(), person.service, person.slot].filter(Boolean).length;
                    return (
                      <motion.div 
                        key={person.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative overflow-hidden border group transition-all"
                        style={{
                          background: isComplete ? 'rgba(255,255,255,0.04)' : '#3D2A1E',
                          borderColor: isComplete ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                          borderLeft: isComplete ? '3px solid #FFFFFF' : '3px solid transparent',
                        }}>
                        
                        {/* Number badge */}
                        <div className="absolute top-3 left-3 flex h-6 w-6 items-center justify-center text-[9px] font-black"
                             style={{ background: '#FFFFFF', color: '#5C4031' }}>
                          {i + 1}
                        </div>

                        {/* Remove button */}
                        {i > 0 && (
                          <button onClick={() => removeGroupPerson(person.id)}
                            className="absolute top-3 right-3 text-white/25 hover:text-red-400 transition-colors font-black text-lg">
                            ×
                          </button>
                        )}

                        {/* Label */}
                        <p className="text-[7px] uppercase tracking-[0.4em] font-black px-3 pt-3 pb-2"
                           style={{ color: 'rgba(255,255,255,0.30)' }}>
                          {i === 0 ? '◆ Responsable' : `◇ Invité ${i}`}
                        </p>

                        <div className="px-3 pb-3 space-y-2">
                          {/* Prénom */}
                          <div>
                            <label className="block text-[7px] uppercase tracking-[0.35em] font-bold mb-1"
                                   style={{ color: 'rgba(255,255,255,0.25)' }}>Prénom</label>
                            <input
                              value={person.name}
                              onChange={e => updateGroupPerson(person.id, { name: e.target.value })}
                              placeholder={i === 0 ? 'Jean Dupont' : 'Marie'}
                              className="w-full text-sm border px-2.5 py-2 outline-none font-medium transition-all"
                              style={{
                                background: '#2E1F14',
                                borderColor: person.name.trim() ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                                color: '#FFFFFF',
                              }}
                              onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.50)'}
                              onBlur={e => e.target.style.borderColor = person.name.trim() ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}
                            />
                          </div>

                          {/* Prestation */}
                          <div>
                            <p className="text-[7px] uppercase tracking-[0.35em] font-bold mb-1.5"
                               style={{ color: 'rgba(255,255,255,0.25)' }}>Service</p>
                            <div className="flex flex-wrap gap-1">
                              {allServices.map(s => (
                                <button key={s.id}
                                  onClick={() => updateGroupPerson(person.id, { service: s })}
                                  className="px-2 py-1.5 text-[7px] font-black border transition-all truncate"
                                  style={{
                                    background: person.service?.id === s.id ? '#FFFFFF' : 'transparent',
                                    color: person.service?.id === s.id ? '#5C4031' : 'rgba(255,255,255,0.50)',
                                    borderColor: person.service?.id === s.id ? '#FFFFFF' : 'rgba(255,255,255,0.12)',
                                  }}>
                                  {s.title}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Créneau */}
                          {groupDate && person.service && (
                            <div>
                              <p className="text-[7px] uppercase tracking-[0.35em] font-bold mb-1.5"
                                 style={{ color: 'rgba(255,255,255,0.25)' }}>Horaire</p>
                              {allGroupSlots[i]?.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {allGroupSlots[i].map(slot => (
                                    <button key={slot} type="button"
                                      onClick={() => updateGroupPerson(person.id, { slot })}
                                      className="px-2 py-1.5 text-[7px] font-black border transition-all"
                                      style={{
                                        background: person.slot === slot ? '#FFFFFF' : '#2E1F14',
                                        color: person.slot === slot ? '#5C4031' : 'rgba(255,255,255,0.60)',
                                        borderColor: person.slot === slot ? '#FFFFFF' : 'rgba(255,255,255,0.12)',
                                      }}>
                                      {slot}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[7px]" style={{ color: 'rgba(244,239,234,0.30)' }}>Aucun créneau ce jour</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Progress bar */}
                        <div className="h-1 bg-white/10 w-full mt-2">
                          <motion.div
                            animate={{ width: `${(progress / 3) * 100}%` }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                            style={{ background: isComplete ? '#FFFFFF' : 'rgba(255,255,255,0.30)' }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Coordonnées + Submit */}
              <div className="mt-8 border-t border-white/10 pt-8">
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                  
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.55em] font-bold text-white mb-3">Coordonnées du responsable</p>
                      <div className="space-y-3">
                        {[
                          { field: 'phone', type: 'tel',   label: 'Téléphone', placeholder: '06 12 34 56 78', val: state.clientInfo.phone },
                          { field: 'email', type: 'email', label: 'Email',     placeholder: 'jean@example.com', val: state.clientInfo.email },
                        ].map(({ field, type, label, placeholder, val }) => (
                          <label key={field} className="block">
                            <span className="block text-[9px] uppercase tracking-[0.4em] text-white/50 font-bold mb-2">{label}</span>
                            <input type={type} value={val}
                              onChange={e => setClientInfo({ ...state.clientInfo, [field]: e.target.value })}
                              placeholder={placeholder}
                              className="w-full border px-4 py-3 text-white text-sm font-medium outline-none transition-colors"
                              style={{ background: '#3D2A1E', borderColor: 'rgba(255,255,255,0.12)' }}
                              onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.50)'}
                              onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'}
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {formError && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 border-l-4 border-red-500 bg-red-500/10 px-4 py-3">
                        <span className="text-red-400 font-black shrink-0">!</span>
                        <p className="text-sm text-red-300 font-medium">{formError}</p>
                      </motion.div>
                    )}

                    <div className="border p-3 text-xs font-medium" style={{ background: '#3D2A1E', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(244,239,234,0.50)' }}>
                      ◆ Paiement sur place · ◊ Espèces ou chèque · ◯ Confirmation par email et SMS
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col gap-3 lg:justify-end">
                    <motion.button type="button" onClick={handleGroupSubmit}
                      disabled={isSubmittingGroup}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-4 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: isSubmittingGroup ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                        color: '#5C4031',
                      }}>
                      {isSubmittingGroup
                        ? <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><ScissorsIcon className="w-4 h-4" /></motion.span> En cours…</>
                        : <><ScissorsIcon className="w-4 h-4" /> Confirmer {groupPeople.length} réservation{groupPeople.length > 1 ? 's' : ''}</>
                      }
                    </motion.button>
                    <p className="text-[8px] text-center font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      Chaque personne doit être complète
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ ÉTAPE 02 — HORAIRE (mode simple uniquement) ══ */}
      <AnimatePresence>
        {!isMulti && selectedDate && (
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
        {((!isMulti && selectedSlot) || (isMulti && multiDates.length > 0 && multiDates.every(d => multiSlots[d]))) && (
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

                  <span className="text-[9px] uppercase tracking-[0.5em] font-bold text-white/40">
                    {isMulti ? `${multiDates.length} réservations` : 'Récapitulatif'}
                  </span>

                  <div className="space-y-3">
                    {/* Prestation + tarif (communs) */}
                    {[
                      { label: 'Prestation', val: state.selectedService?.title ?? '—' },
                      { label: 'Durée',      val: state.selectedService ? `${state.selectedService.duration} min` : '—' },
                      { label: 'Tarif',      val: isMulti ? `${state.selectedService?.priceLabel ?? '—'} × ${multiDates.length}` : state.selectedService?.priceLabel ?? '—' },
                    ].map((r) => (
                      <div key={r.label} className="flex items-start justify-between gap-3 pb-3 border-b"
                           style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <span className="text-[8px] uppercase tracking-[0.35em] font-bold shrink-0"
                              style={{ color: 'rgba(255,255,255,0.35)' }}>{r.label}</span>
                        <span className="text-xs font-bold text-white text-right capitalize">{r.val}</span>
                      </div>
                    ))}
                    {/* Dates/horaires */}
                    {isMulti
                      ? multiDates.map((dk, i) => (
                          <div key={dk} className="flex items-start justify-between gap-3 pb-3 border-b last:border-0 last:pb-0"
                               style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            <span className="text-[8px] uppercase tracking-[0.35em] font-bold shrink-0"
                                  style={{ color: 'rgba(255,255,255,0.35)' }}>RDV {i + 1}</span>
                            <span className="text-xs font-bold text-white text-right">
                              {new Date(dk + 'T12:00:00+02:00').toLocaleDateString('fr-FR', { weekday:'short', day:'2-digit', month:'short' })} · {multiSlots[dk]}
                            </span>
                          </div>
                        ))
                      : [
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
                        ))
                    }
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

                  <motion.button
                    type="button"
                    onClick={isMulti ? handleMultiSubmit : handleSubmit}
                    disabled={isMulti ? (!state.selectedService || isSubmittingMulti) : (!state.selectedService || isLoading)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2.5 py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-300"
                    style={{
                      background: '#FFFFFF',
                      color: '#5C4031',
                      cursor: 'pointer',
                      opacity: (isMulti ? isSubmittingMulti : isLoading) ? 0.5 : 1,
                    }}>
                    {(isMulti ? isSubmittingMulti : isLoading) ? (
                      <>
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <ScissorsIcon className="w-4 h-4" />
                        </motion.span>
                        En cours…
                      </>
                    ) : isMulti ? (
                      <>
                        <ScissorsIcon className="w-4 h-4" />
                        Confirmer {multiDates.length} réservation{multiDates.length > 1 ? 's' : ''}
                      </>
                    ) : (
                      <>
                        <ScissorsIcon className="w-4 h-4" />
                        Confirmer ma réservation
                      </>
                    )}
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
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
