import { motion } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ScissorsIcon } from '../components/BarberIcons';

const EASE = [0.22, 1, 0.36, 1];

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' });
}

export default function Confirmation() {
  const { state, resetBooking } = useBooking();
  const navigate  = useNavigate();
  const location  = useLocation();

  const multiBookings = location.state?.multiBookings ?? null;
  const isGroup       = location.state?.isGroup ?? false;
  const isMulti       = Boolean(multiBookings && !isGroup);

  // Mode groupe / multi : on a des multiBookings dans le state de navigation
  const isGroupOrMulti = Boolean(multiBookings);

  // Mode solo : confirmation via BookingContext
  const ok = isGroupOrMulti
    ? multiBookings.length > 0
    : Boolean(state.confirmationNumber);

  const soloRows = [
    { label: 'Référence',  value: state.confirmationNumber || '—', accent: true },
    { label: 'Prestation', value: state.selectedService?.title ?? '—' },
    { label: 'Durée',      value: state.selectedService ? `${state.selectedService.duration} min` : '—' },
    { label: 'Tarif',      value: state.selectedService?.priceLabel ?? '—' },
    { label: 'Date',       value: fmt(state.date) },
    { label: 'Heure',      value: state.time || '—' },
    { label: 'Client',     value: state.clientInfo.name || '—' },
  ];

  const titleLine1 = ok
    ? (isGroup ? 'Groupe' : isMulti ? `${multiBookings.length} réservations` : 'Réservation')
    : 'Presque';
  const titleLine2 = ok ? 'confirmé(e).' : 'prêt.';

  return (
    <div className="min-h-screen" style={{ background: '#5C4031', paddingTop: 'var(--navbar-h, 72px)' }}>

      {/* ── Header ── */}
      <div className="relative overflow-hidden" style={{ background: '#3D2A1E', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none select-none overflow-hidden">
          <span className="font-black text-white leading-none" style={{ fontSize: '18rem', opacity: 0.03 }}>✓</span>
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 sm:px-10 py-14 sm:py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>

            <span className="text-[9px] uppercase tracking-[0.6em] font-bold block mb-8"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>
              {ok ? 'Réservation confirmée' : 'En attente'}
            </span>

            <div className="flex items-start gap-6 sm:gap-10">
              <motion.div className="flex items-center justify-center border-2 border-white/30 shrink-0"
                style={{ width: 64, height: 64 }}
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.3 }}>
                <span className="text-white font-black text-2xl">✓</span>
              </motion.div>

              <div>
                <div className="overflow-hidden">
                  <motion.h1 className="font-black uppercase leading-[0.88] tracking-[-0.04em] text-white"
                    style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)' }}
                    initial={{ y: '100%' }} animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: 0.1, ease: EASE }}>
                    {titleLine1}
                  </motion.h1>
                </div>
                <div className="overflow-hidden">
                  <motion.h1 className="font-black uppercase leading-[0.88] tracking-[-0.04em]"
                    style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', color: 'rgba(255,255,255,0.28)' }}
                    initial={{ y: '100%' }} animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: 0.2, ease: EASE }}>
                    {titleLine2}
                  </motion.h1>
                </div>

                <motion.p className="mt-6 text-sm sm:text-base leading-8 font-medium max-w-lg"
                  style={{ color: 'rgba(244,239,234,0.55)' }}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.5 }}>
                  {ok
                    ? 'Ton créneau est enregistré. Un email et un SMS de confirmation t\'ont été envoyés.'
                    : 'Merci. Le récapitulatif de ta demande est ci-dessous.'}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Récap + actions ── */}
      <div className="mx-auto max-w-4xl px-6 sm:px-10 py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">

          {/* Récap — solo OU groupe/multi */}
          <motion.div className="border border-white/8" style={{ background: '#3D2A1E' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}>

            <div className="px-6 py-4 border-b border-white/8 flex items-center gap-3">
              <ScissorsIcon className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[9px] uppercase tracking-[0.5em] font-bold text-white/40">
                {isGroupOrMulti ? `${multiBookings.length} réservation${multiBookings.length > 1 ? 's' : ''}` : 'Récapitulatif'}
              </span>
            </div>

            {isGroupOrMulti ? (
              /* Affichage groupe/multi : liste des bookings */
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {multiBookings.map((b, i) => (
                  <motion.div key={i} className="px-6 py-4"
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.08 }}>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center text-[9px] font-black shrink-0"
                              style={{ background: '#FFFFFF', color: '#5C4031' }}>{i + 1}</span>
                        <p className="font-black text-white text-sm">{b.name || b.clientName || `Participant ${i+1}`}</p>
                      </div>
                      <span className="text-[9px] font-black text-white/40">{b.confirmationNumber}</span>
                    </div>
                    <div className="ml-9 space-y-1">
                      {b.service && <p className="text-xs text-white/60">{b.service}</p>}
                      <p className="text-xs text-white/50">{fmt(b.date)} à {b.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Affichage solo */
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {soloRows.map((row, i) => (
                  <motion.div key={row.label} className="flex items-center justify-between gap-6 px-6 py-4"
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.07 }}>
                    <span className="text-[9px] uppercase tracking-[0.4em] font-bold shrink-0"
                          style={{ color: 'rgba(255,255,255,0.35)' }}>{row.label}</span>
                    <span className={`text-sm font-bold text-right ${row.accent ? 'text-white font-black text-base' : 'text-white/80'}`}>
                      {row.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Actions */}
          <motion.div className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}>

            <div className="border-l-2 border-white/25 pl-5 py-2">
              <p className="text-sm leading-7 font-medium" style={{ color: 'rgba(244,239,234,0.55)' }}>
                Paiement sur place. Espèces ou chèque uniquement.
              </p>
            </div>
            <div className="border-l-2 border-white/25 pl-5 py-2">
              <p className="text-sm leading-7 font-medium" style={{ color: 'rgba(244,239,234,0.55)' }}>
                1 Rue de la Madeleine<br />77170 Brie-Comte-Robert
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <motion.button type="button"
                onClick={() => { resetBooking(); navigate('/prestations'); }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 bg-white py-4 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-creamMid transition-colors"
                style={{ color: '#5C4031' }}>
                <ScissorsIcon className="w-3.5 h-3.5" />
                Nouvelle réservation
              </motion.button>
              <motion.button type="button"
                onClick={() => navigate('/reservation')}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center border border-white/20 py-4 text-[10px] font-bold uppercase tracking-[0.28em] text-white hover:border-white/50 transition-colors">
                Modifier
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
