import { useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLenis } from '../hooks/useLenis';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  enter:   { opacity: 1, y: 0,  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

export default function Layout() {
  useLenis();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-cream text-dark">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
