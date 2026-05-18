import { motion } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import { useNavigate } from 'react-router-dom';
import { ScissorsIcon, DiamondDivider } from '../components/BarberIcons';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };

export default function Confirmation() {
  const { state, resetBooking } = useBooking();
  const navigate = useNavigate();
  const ok = Boolean(state.confirmationNumber);

  const rows = [
    { label: 'N° confirmation', value: state.confirmationNumber || 'En attente',           highlight: ok },
    { label: 'Prestation',      value: state.selectedService?.title ?? 'Non sélectionnée', highlight: false },
    { label: 'Lieu',            value: state.location,                                     highlight: false },
    { label: 'Date',            value: state.date || 'Non définie',                        highlight: false },
    { label: 'Heure',           value: state.time || 'Non définie',                        highlight: false },
    { label: 'Client',          value: state.clientInfo.name || 'Non renseigné',           highlight: false },
    { label: 'Téléphone',       value: state.clientInfo.phone || 'Non renseigné',          highlight: false },
  ];

  return (
    <motion.section
      className="mx-auto max-w-4xl px-6 sm:px-10 pb-20"
      style={{ paddingTop: 'calc(var(--navbar-h, 72px) + 2.5rem)' }}
      initial="hidden"
      animate="show"
      variants={stagger}
    >
      {/* Header */}
      <motion.header variants={fadeUp} className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <ScissorsIcon className="w-4 h-4 text-brand" />
          <span className="block h-px w-6 bg-brand" />
          <span className="text-[9px] uppercase tracking-[0.55em] text-brand font-bold">Confirmation</span>
        </div>

        <div className="flex items-start gap-5">
          {ok && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.3 }}
              className="mt-1.5 inline-flex h-10 w-10 shrink-0 items-center justify-center bg-brand text-dark text-lg font-black"
            >
              ✓
            </motion.span>
          )}
          <div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.04em] text-dark sm:text-5xl">
              {ok ? 'Réservation confirmée' : 'Presque prêt'}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-dark/62 font-medium">
              {ok
                ? 'Votre créneau est bien enregistré. Vous recevrez un SMS avec toutes les informations pratiques.'
                : 'Merci pour votre demande. Le résumé ci-dessous confirme votre réservation.'}
            </p>
          </div>
        </div>
      </motion.header>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Résumé */}
        <motion.div variants={fadeUp} className="border border-beige bg-creamMid p-8">
          <div className="flex items-center gap-2 mb-6">
            <ScissorsIcon className="w-3.5 h-3.5 text-brand/60" />
            <p className="text-[9px] uppercase tracking-[0.45em] text-muted font-bold">Résumé de la réservation</p>
          </div>
          <ul className="space-y-4">
            {rows.map((row) => (
              <li key={row.label} className="flex items-start justify-between gap-6 border-b border-beige/50 pb-4 last:border-0 last:pb-0">
                <span className="text-[9px] uppercase tracking-[0.35em] text-muted font-bold shrink-0">{row.label}</span>
                <span className={`text-sm font-bold text-right ${row.highlight ? 'text-brand' : 'text-dark'}`}>
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Info + actions */}
        <motion.div variants={fadeUp} className="border border-beige bg-cream p-8 flex flex-col justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.45em] text-muted font-bold mb-6">Information importante</p>
            <div className="border-l-2 border-brand pl-5 mb-6">
              <p className="text-sm leading-7 text-dark/68 font-medium">
                L'adresse exacte du lieu de rendez-vous vous sera envoyée par SMS quelques heures avant votre créneau.
              </p>
            </div>
            <p className="text-sm leading-7 text-muted font-medium">
              Pour modifier votre réservation, revenez à l'étape précédente ou sélectionnez une nouvelle prestation.
            </p>

            <DiamondDivider className="text-dark mt-8 mb-0" />
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <motion.button
              type="button"
              onClick={() => navigate('/reservation')}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="inline-flex w-full items-center justify-center border border-beige bg-creamMid px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.28em] text-dark transition-all duration-200 hover:border-dark"
            >
              Modifier
            </motion.button>
            <motion.button
              type="button"
              onClick={() => { resetBooking(); navigate('/prestations'); }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="inline-flex w-full items-center justify-center gap-2 bg-brand px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.28em] text-dark transition-colors duration-300 hover:bg-brandDark"
            >
              <ScissorsIcon className="w-3.5 h-3.5" />
              Nouvelle réservation
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
