import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ScissorsIcon } from './BarberIcons';
import logo from '../assets/logo.png';

const links = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/concept', label: 'Concept', end: false },
  { to: '/prestations', label: 'Services', end: false },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => { setOpen(false); }, [location]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const transparent = isHome && !scrolled && !open;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        transparent
          ? 'bg-dark/38 backdrop-blur-md border-b border-cream/10'
          : 'bg-darkMid border-b border-cream/10'
      }`}
      style={{ height: 'var(--navbar-h, 72px)' }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 sm:px-10">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center group">
          <div className="h-10 w-10 bg-brand flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-brandDark">
            <img src={logo} alt="Wonder Cut" className="h-7 w-7 object-contain" style={{ filter: 'invert(1)' }} />
          </div>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden items-center gap-10 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `relative text-[10px] uppercase tracking-[0.32em] font-semibold transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-brand after:transition-all after:duration-300 ${
                  isActive
                    ? 'text-brand after:w-full'
                    : 'text-cream/60 hover:text-cream after:w-0 hover:after:w-full'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* ── CTA + hamburger ── */}
        <div className="flex items-center gap-5">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="hidden lg:block">
            <Link
              to="/prestations"
              className="inline-flex items-center gap-2 bg-brand px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.32em] text-dark transition-colors duration-200 hover:bg-brandDark"
            >
              <ScissorsIcon className="w-3 h-3" />
              Réserver
            </Link>
          </motion.div>

          <button
            onClick={() => setOpen((p) => !p)}
            className="lg:hidden flex flex-col gap-[5px] p-2"
            aria-label={open ? 'Fermer' : 'Menu'}
          >
            <span className={`block h-[1.5px] w-6 bg-cream origin-center transition-all duration-300 ${open ? 'translate-y-[5.5px] rotate-45' : ''}`} />
            <span className={`block h-[1.5px] bg-cream transition-all duration-300 ${open ? 'opacity-0 w-6' : 'w-4'}`} />
            <span className={`block h-[1.5px] w-6 bg-cream origin-center transition-all duration-300 ${open ? '-translate-y-[5.5px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-cream/10 bg-darkMid lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-6">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3.5 text-[10px] uppercase tracking-[0.32em] font-semibold transition-colors border-l-2 ${
                      isActive
                        ? 'border-brand text-brand'
                        : 'border-transparent text-cream/55 hover:text-cream hover:border-cream/30'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/prestations"
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex items-center justify-center gap-2 bg-brand px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.32em] text-dark"
              >
                <ScissorsIcon className="w-3.5 h-3.5" />
                Réserver maintenant
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
