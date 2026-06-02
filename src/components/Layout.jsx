import { useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLenis } from '../hooks/useLenis';

const EASE = [0.76, 0, 0.24, 1];

/* ── Overlay marron qui descend pour couvrir puis remonte ── */
function TransitionCurtain({ isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          style={{ background: '#5C4031' }}
          initial={{ y: '-100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          {/* W centré pendant la transition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, ease: 'linear', repeat: Infinity }}
            >
              {/* Cercle déco */}
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Layout() {
  useLenis();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#5C4031', color: '#F4EFEA' }}>
      <Navbar />

      {/* Rideau de transition */}
      <TransitionCurtain isVisible={false} />

      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)',
              transition: {
                clipPath: { duration: 0.75, ease: EASE },
                opacity:  { duration: 0.2 },
              }
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              filter: 'blur(4px)',
              transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
            }}
            style={{ transformOrigin: 'top center' }}
          >
            {/* Flash line au moment du reveal — suit le bord du clip */}
            <motion.div
              className="fixed left-0 right-0 pointer-events-none z-50 h-[2px]"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 50%, transparent)' }}
              initial={{ top: '0%', opacity: 1 }}
              animate={{ top: '100%', opacity: 0 }}
              transition={{ duration: 0.75, ease: EASE }}
            />
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
