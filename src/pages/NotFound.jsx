import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScissorsIcon, DiamondDivider } from '../components/BarberIcons';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } } };
const fadeUp  = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };

export default function NotFound() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center grain overflow-hidden"
      style={{
        backgroundImage:
          'linear-gradient(to bottom, rgba(74,47,26,0.85) 0%, rgba(74,47,26,0.72) 100%),' +
          'url("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Decorative scissors */}
      <ScissorsIcon className="absolute top-20 right-20 w-32 h-32 text-brand/8 hidden lg:block pointer-events-none" />
      <ScissorsIcon className="absolute bottom-20 left-20 w-24 h-24 text-brand/8 rotate-180 hidden lg:block pointer-events-none" />

      <motion.div
        className="relative z-10 text-center px-6"
        initial="hidden"
        animate="show"
        variants={stagger}
      >
        {/* Big 404 */}
        <motion.p
          variants={fadeUp}
          className="text-[clamp(6rem,20vw,16rem)] font-black leading-none tracking-[-0.05em] shimmer-gold select-none"
          aria-hidden
        >
          404
        </motion.p>

        <motion.div variants={fadeUp} className="flex items-center gap-3 justify-center -mt-4 mb-8">
          <ScissorsIcon className="w-4 h-4 text-brand" />
          <span className="text-[9px] uppercase tracking-[0.55em] text-brand font-bold">Page introuvable</span>
          <ScissorsIcon className="w-4 h-4 text-brand rotate-180" />
        </motion.div>

        <motion.h1 variants={fadeUp} className="text-2xl font-black uppercase tracking-[-0.02em] text-cream sm:text-4xl mb-4">
          Cette page n'existe pas.
        </motion.h1>

        <motion.p variants={fadeUp} className="text-base text-cream/55 font-medium max-w-sm mx-auto mb-10">
          Tu t'es perdu en chemin ? Reviens à l'accueil et réserve ta coupe.
        </motion.p>

        <motion.div variants={fadeUp} className="mb-10">
          <DiamondDivider className="text-cream max-w-xs mx-auto" />
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/"
              className="inline-flex items-center gap-3 bg-brand px-9 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-dark transition-colors duration-300 hover:bg-brandDark"
            >
              <ScissorsIcon className="w-3.5 h-3.5" />
              Retour à l'accueil
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/prestations"
              className="inline-flex items-center justify-center border border-cream/25 px-9 py-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-cream transition-all duration-300 hover:border-cream/60"
            >
              Voir les services
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
