import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import { fetchAvailability, subscribeToAvailability } from '../api/availability';
import { ScissorsIcon, RazorIcon, CombIcon, DiamondDivider } from '../components/BarberIcons';

/* ─── Helpers ──────────────────────────────────────────────── */
function dayKey(d) { return d.toISOString().slice(0, 10); }

function buildDayWindow(availability) {
  const keys = Object.keys(availability).sort();
  if (!keys.length) return [];
  const start = new Date(keys[0]);
  const end   = new Date(keys[keys.length - 1]);
  const result = [];
  const cur = new Date(start);
  while (cur <= end) {
    const k   = dayKey(cur);
    const dow = cur.getDay(); // 0 = dimanche
    const apiSlots = availability[k];
    let status;
    if (dow === 0)                              status = 'ferme';
    else if (apiSlots && apiSlots.length > 0)  status = 'available';
    else if (apiSlots !== undefined)            status = 'complet';
    else                                        status = 'complet';
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

/* ─── DayCard ──────────────────────────────────────────────── */
function DayCard({ day, selected, onClick }) {
  const ok   = day.status === 'available';
  const full = day.status === 'complet';
  const off  = day.status === 'ferme';

  return (
    <motion.button
      type="button"
      onClick={ok ? onClick : undefined}
      disabled={!ok}
      whileHover={ok ? { y: -4, scale: 1.04 } : {}}
      whileTap={ok ? { scale: 0.96 } : {}}
      className={`
        min-w-[86px] flex-shrink-0 snap-start
        flex flex-col items-center gap-1 pt-4 pb-3 px-3
        border-2 transition-all duration-200 select-none
        ${selected ? 'border-brand bg-dark shadow-gold'
          : ok      ? 'border-beige bg-cream hover:border-brand cursor-pointer'
          : full    ? 'border-red-200 bg-red-50 cursor-not-allowed opacity-80'
          :           'border-beige/30 bg-beige/20 cursor-not-allowed opacity-50'}
      `}
    >
      {/* day name */}
      <span className={`text-[8px] uppercase font-black tracking-[0.45em] ${
        selected ? 'text-cream/50' : full ? 'text-red-300' : off ? 'text-muted/40' : 'text-muted'
      }`}>{day.dayShort}</span>

      {/* day number */}
      <span className={`text-[1.6rem] font-black leading-none ${
        selected ? 'text-cream' : full ? 'text-red-400' : off ? 'text-muted/40' : 'text-dark'
      }`}>{day.dayNum}</span>

      {/* month */}
      <span className={`text-[8px] font-medium ${
        selected ? 'text-cream/45' : 'text-muted/60'
      }`}>{day.monthShort}</span>

      {/* status badge */}
      <div className="mt-1.5 w-full text-center">
        {off  && <span className="text-[8px] text-muted/40 font-bold uppercase tracking-widest">Fermé</span>}
        {full && <span className="text-[8px] text-red-400 font-black uppercase tracking-widest">Complet</span>}
        {ok && !selected && (
          <span className="text-[8px] text-brand font-black">{day.slotCount} crén.</span>
        )}
        {ok && selected && (
          <span className="text-[8px] text-brand font-black">{day.slotCount} crén. ✓</span>
        )}
      </div>
    </motion.button>
  );
}

/* ─── TimeSlot ─────────────────────────────────────────────── */
function TimeSlot({ hour, selected, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className={`py-3 px-2 text-center border-2 transition-all duration-200 font-black text-sm ${
        selected
          ? 'border-brand bg-brand text-dark shadow-gold'
          : 'border-beige bg-cream text-dark hover:border-brand hover:text-brand'
      }`}
    >
      {hour}
    </motion.button>
  );
}

/* ─── StepLabel ────────────────────────────────────────────── */
function StepLabel({ num, title, done, Icon }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center text-[9px] font-black tracking-widest transition-colors duration-300 ${
        done ? 'bg-brand text-dark' : 'bg-dark text-brand border border-brand/30'
      }`}>{done ? '✓' : num}</span>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-dark">{title}</p>
      </div>
      {Icon && <Icon className="w-4 h-4 text-brand/40 ml-1" />}
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────── */
export default function Booking() {
  const { state, selectLocation, selectDate, selectTime, setClientInfo, submitBooking, isLoading } = useBooking();
  const [salonInfo, setSalonInfo]       = useState(null);
  const [availability, setAvailability] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading]           = useState(true);
  const [loadError, setLoadError]       = useState(null);
  const [formError, setFormError]       = useState(null);
  const navigate = useNavigate();

  const loadAvailability = useCallback((preserveSelection = false) => {
    return fetchAvailability()
      .then(({ salon, availability: av }) => {
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
      })
      .catch(() => { setLoadError(true); setLoading(false); });
  }, []);

  /* Chargement initial */
  useEffect(() => { loadAvailability(false); }, []);

  /* Subscription temps réel → recharge les dispos si quelqu'un réserve */
  useEffect(() => {
    const unsub = subscribeToAvailability(() => loadAvailability(true));
    return unsub;
  }, [loadAvailability]);

  useEffect(() => { if (selectedDate) selectDate(selectedDate); }, [selectedDate]);
  useEffect(() => { if (selectedSlot) selectTime(selectedSlot); }, [selectedSlot]);

  const dayWindow  = useMemo(() => buildDayWindow(availability), [availability]);
  const activeSlots = useMemo(() => availability[selectedDate] || [], [availability, selectedDate]);

  const handleSelectDate = (key) => {
    setSelectedDate(key);
    setSelectedSlot('');
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!state.selectedService)                             { setFormError('Choisis une prestation avant de confirmer.'); return; }
    if (!state.clientInfo.name || !state.clientInfo.phone) { setFormError('Renseigne ton prénom et ton téléphone.'); return; }
    if (!state.date || !state.time)                        { setFormError('Sélectionne un jour et un horaire.'); return; }
    try { await submitBooking(); navigate('/confirmation'); }
    catch (e) { setFormError(e instanceof Error ? e.message : 'Une erreur est survenue. Réessaie.'); }
  };

  const padTop = { paddingTop: 'var(--navbar-h, 72px)' };
  const step1done = Boolean(selectedDate && selectedSlot);
  const step2done = Boolean(state.clientInfo.name && state.clientInfo.phone);

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center" style={padTop}>
      <div className="text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
          <ScissorsIcon className="w-10 h-10 text-brand mx-auto" />
        </motion.div>
        <p className="mt-5 text-sm text-cream/50 font-medium uppercase tracking-[0.4em]">Chargement des créneaux…</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (loadError) return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6" style={padTop}>
      <div className="text-center max-w-sm">
        <ScissorsIcon className="w-8 h-8 text-red-400 mx-auto mb-4" />
        <p className="text-base text-dark font-bold mb-2">Impossible de charger les disponibilités.</p>
        <p className="text-sm text-muted mb-6">Vérifie ta connexion et réessaie.</p>
        <button onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-brand px-6 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-dark hover:bg-brandDark transition-colors">
          <ScissorsIcon className="w-3.5 h-3.5" /> Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div style={padTop} className="bg-cream min-h-screen">

      {/* ══════════ HEADER DARK ══════════════════════════════ */}
      <div className="bg-dark grain relative overflow-hidden">
        {/* watermark */}
        <ScissorsIcon className="absolute -right-8 top-1/2 -translate-y-1/2 w-56 h-56 text-cream/3 pointer-events-none hidden lg:block" />

        <div className="mx-auto max-w-5xl px-6 sm:px-10 py-10">
          {/* breadcrumb steps */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 mb-8">
            <StepLabel num="01" title="Prestation" done={Boolean(state.selectedService)} Icon={ScissorsIcon} />
            <span className="text-cream/15 font-light text-lg hidden sm:block">—</span>
            <StepLabel num="02" title="Date & Horaire" done={step1done} Icon={CombIcon} />
            <span className="text-cream/15 font-light text-lg hidden sm:block">—</span>
            <StepLabel num="03" title="Confirmation" done={step2done && step1done} Icon={RazorIcon} />
          </div>

          {/* selected service display */}
          {state.selectedService ? (
            <div className="flex items-center justify-between gap-6 border border-cream/10 bg-cream/4 px-6 py-4">
              <div className="flex items-center gap-4">
                <ScissorsIcon className="w-4 h-4 text-brand shrink-0" />
                <div>
                  <p className="text-[9px] uppercase tracking-[0.45em] text-cream/35 font-medium">Prestation sélectionnée</p>
                  <p className="text-base font-black text-cream mt-0.5">{state.selectedService.title}</p>
                </div>
              </div>
              <span className="text-2xl font-black text-brand shrink-0">{state.selectedService.priceLabel}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 border border-red-500/20 bg-red-500/5 px-6 py-4">
              <p className="text-sm text-red-300 font-medium">Aucune prestation sélectionnée</p>
              <Link to="/prestations"
                className="text-[9px] font-black uppercase tracking-[0.4em] text-brand hover:text-brandDark transition-colors flex items-center gap-2">
                <ScissorsIcon className="w-3 h-3" /> Choisir →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ══════════ ÉTAPE 01 — JOUR ══════════════════════════ */}
      <div className="bg-cream py-10 border-b border-beige">
        <div className="mx-auto max-w-5xl px-6 sm:px-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[9px] font-black uppercase tracking-[0.55em] text-brand">01</span>
            <span className="block h-px w-5 bg-brand" />
            <span className="text-[9px] font-black uppercase tracking-[0.45em] text-dark">Choisissez votre jour</span>
          </div>
          <p className="text-xs text-muted font-medium mb-6 pl-10">
            <span className="inline-flex items-center gap-1.5 mr-4">
              <span className="inline-block w-2.5 h-2.5 border-2 border-brand bg-cream" /> Disponible
            </span>
            <span className="inline-flex items-center gap-1.5 mr-4">
              <span className="inline-block w-2.5 h-2.5 bg-red-100 border-2 border-red-200" /> Complet
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 bg-beige/40 border-2 border-beige/30" /> Fermé
            </span>
          </p>

          {/* Day scroller */}
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory">
            {dayWindow.map((d) => (
              <DayCard
                key={d.key}
                day={d}
                selected={selectedDate === d.key}
                onClick={() => handleSelectDate(d.key)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ ÉTAPE 02 — HORAIRE ═══════════════════════ */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-creamMid py-10 border-b border-beige">
              <div className="mx-auto max-w-5xl px-6 sm:px-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[9px] font-black uppercase tracking-[0.55em] text-brand">02</span>
                  <span className="block h-px w-5 bg-brand" />
                  <span className="text-[9px] font-black uppercase tracking-[0.45em] text-dark">Choisissez votre horaire</span>
                </div>

                {activeSlots.length > 0 ? (
                  <motion.div
                    className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3"
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                  >
                    {activeSlots.map((h) => (
                      <motion.div key={h} variants={{ hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1 } }}>
                        <TimeSlot
                          hour={h}
                          selected={selectedSlot === h}
                          onClick={() => setSelectedSlot(h)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-3 text-red-400 border border-red-200 bg-red-50 px-5 py-4">
                    <span className="text-lg">✗</span>
                    <p className="text-sm font-bold">Aucun créneau disponible — choisis un autre jour.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ ÉTAPE 03 — INFOS + CONFIRMATION ══════════ */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-cream py-10">
              <div className="mx-auto max-w-5xl px-6 sm:px-10">
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-[9px] font-black uppercase tracking-[0.55em] text-brand">03</span>
                  <span className="block h-px w-5 bg-brand" />
                  <span className="text-[9px] font-black uppercase tracking-[0.45em] text-dark">Tes informations</span>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                  {/* Form */}
                  <div className="space-y-4">
                    {[
                      { field: 'name',  type: 'text', label: 'Prénom & Nom',   placeholder: 'Jean Dupont',     val: state.clientInfo.name  },
                      { field: 'phone', type: 'tel',  label: 'Téléphone (06 / 07)', placeholder: '06 12 34 56 78', val: state.clientInfo.phone },
                    ].map(({ field, type, label, placeholder, val }) => (
                      <label key={field} className="block">
                        <span className="text-[9px] uppercase tracking-[0.45em] text-muted font-bold block mb-2">{label}</span>
                        <input
                          type={type}
                          value={val}
                          onChange={(e) => setClientInfo({
                            name:  field === 'name'  ? e.target.value : state.clientInfo.name,
                            phone: field === 'phone' ? e.target.value : state.clientInfo.phone,
                          })}
                          placeholder={placeholder}
                          className="w-full border-2 border-beige bg-creamMid px-5 py-3.5 text-dark text-sm font-medium placeholder:text-muted/35 outline-none transition-colors focus:border-brand"
                          disabled={isLoading}
                        />
                      </label>
                    ))}

                    {formError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-red-200 bg-red-50 px-4 py-3"
                      >
                        <p className="text-sm text-red-700 font-medium">{formError}</p>
                      </motion.div>
                    )}

                    <p className="text-xs text-muted/70 font-medium pt-1">
                      📍 L'adresse exacte t'est envoyée par SMS la veille de ton rendez-vous.
                    </p>
                  </div>

                  {/* Récap */}
                  <div className="border-2 border-beige bg-creamMid p-6 flex flex-col gap-4 h-fit">
                    <p className="text-[9px] uppercase tracking-[0.5em] text-muted font-bold">Récapitulatif</p>
                    <DiamondDivider className="text-dark" />
                    {[
                      { label: 'Salon',      val: salonInfo?.name },
                      { label: 'Prestation', val: state.selectedService?.title ?? '—' },
                      { label: 'Tarif',      val: state.selectedService?.priceLabel ?? '—' },
                      { label: 'Jour',       val: selectedDate ? new Date(selectedDate + 'T12:00:00+02:00').toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }) : '—' },
                      { label: 'Horaire',    val: selectedSlot || '—' },
                    ].map((r) => (
                      <div key={r.label} className="flex items-start justify-between gap-3">
                        <span className="text-[9px] uppercase tracking-[0.35em] text-muted font-bold shrink-0">{r.label}</span>
                        <span className="text-sm font-bold text-dark text-right capitalize">{r.val}</span>
                      </div>
                    ))}
                    <DiamondDivider className="text-dark mt-1" />

                    {/* CONFIRM BUTTON */}
                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!state.selectedService || isLoading}
                      whileHover={state.selectedService && !isLoading ? { scale: 1.03 } : {}}
                      whileTap={state.selectedService && !isLoading ? { scale: 0.97 } : {}}
                      className={`w-full flex items-center justify-center gap-3 py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-300 ${
                        state.selectedService && !isLoading
                          ? 'bg-brand text-dark hover:bg-brandDark cursor-pointer shadow-gold'
                          : 'bg-beige text-muted cursor-not-allowed'
                      }`}
                    >
                      {isLoading
                        ? <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><ScissorsIcon className="w-4 h-4" /></motion.span> En cours…</>
                        : <><ScissorsIcon className="w-4 h-4" /> Confirmer ma réservation</>
                      }
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom padding */}
      <div className="bg-cream h-16" />
    </div>
  );
}
