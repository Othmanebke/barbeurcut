import { Link } from 'react-router-dom';
import { DiamondDivider } from './BarberIcons';
import logo from '../assets/logo.png';

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=1+Rue+de+la+Madeleine+77170+Brie-Comte-Robert';

export default function Footer() {
  return (
    <footer style={{ background: '#5C4031', color: '#F4EFEA' }}>

      {/* ── Infos essentielles ── */}
      <div className="mx-auto max-w-7xl px-6 sm:px-10 pt-14 sm:pt-16 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10">

          {/* Gauche — logo + adresse + horaires */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-brand flex items-center justify-center shrink-0">
                <img src={logo} alt="Wonderclub" className="h-7 w-7 object-contain" style={{ filter: 'invert(1)' }} />
              </div>
            </div>

            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-cream/55 font-medium hover:text-brand transition-colors leading-6"
            >
              1 Rue de la Madeleine<br />
              77170 Brie-Comte-Robert
            </a>

            <div className="text-sm text-cream/35 font-medium space-y-1">
              <p>Mer — Sam · 10h–19h30</p>
              <p className="text-cream/22 text-xs">Lun, Mar, Dim : fermé</p>
            </div>

            <p className="text-[9px] uppercase tracking-[0.4em] text-brand/70 font-bold pt-1">
              BP Coiffure · Depuis 2018
            </p>
            <p className="text-[9px] text-cream/30 font-medium">
              Artisan indépendant · Siège loué au 1 Rue de la Madeleine
            </p>
          </div>

          {/* Droite — nav + socials */}
          <div className="flex flex-wrap gap-x-10 gap-y-6 sm:gap-x-14">
            <div className="flex flex-col gap-2.5">
              <p className="text-[8px] uppercase tracking-[0.5em] text-cream/22 font-bold mb-1">Navigation</p>
              {[
                { to: '/concept',          label: 'Concept'   },
                { to: '/prestations',      label: 'Services'  },
                { to: '/reservation',      label: 'Réserver'  },
                { to: '/mentions-legales', label: 'Mentions légales' },
              ].map((l) => (
                <Link key={l.to} to={l.to} className="text-sm text-cream/50 font-medium hover:text-brand transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[8px] uppercase tracking-[0.5em] text-cream/22 font-bold mb-1">Réseaux</p>
              <a href="https://www.instagram.com/teewdr/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-cream/50 font-medium hover:text-brand transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
              <a href="https://www.tiktok.com/@s_wonderss" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-cream/50 font-medium hover:text-brand transition-colors">
                <svg width="14" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.89a8.27 8.27 0 004.84 1.55V7a4.85 4.85 0 01-1.07-.31z"/>
                </svg>
                TikTok
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <DiamondDivider className="text-cream/20" />
      </div>

      {/* ── WONDER — grande typo centrale ── */}
      <div className="relative overflow-hidden select-none py-4 sm:py-6">
        <p
          className="text-center font-black uppercase text-cream/8 leading-none tracking-[-0.04em] pointer-events-none"
          style={{ fontSize: 'clamp(5rem, 20vw, 14rem)' }}
          aria-hidden
        >
          WONDER
        </p>
      </div>

      {/* ── Crédit développeur ── */}
      <div className="border-t border-cream/5 px-6 sm:px-10 py-4">
        <p className="text-[9px] font-medium text-center tracking-[0.2em]" style={{ color: 'rgba(244,239,234,0.55)' }}>
          Fait par{' '}
          <a href="https://oldev.vercel.app/" target="_blank" rel="noopener noreferrer"
            className="font-bold text-white hover:text-cream/80 transition-colors underline underline-offset-2">
            Othmane Bouakline
          </a>
        </p>
      </div>
    </footer>
  );
}
