import { Link } from 'react-router-dom';
import { ScissorsIcon, DiamondDivider } from './BarberIcons';
import logo from '../assets/logo.png';

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=1+Rue+de+la+Madeleine+77170+Brie-Comte-Robert';

export default function Footer() {
  return (
    <footer className="bg-dark text-cream">

      {/* ── Infos essentielles ── */}
      <div className="mx-auto max-w-7xl px-6 sm:px-10 pt-14 sm:pt-16 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10">

          {/* Gauche — logo + adresse + horaires */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Wonder Cut" className="h-8 w-8 shrink-0 object-contain" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cream">Wonder Cut</span>
              <ScissorsIcon className="w-3 h-3 text-brand/40" />
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
              <p>Mer — Sam · 9h–12h / 13h–19h</p>
              <p className="text-cream/22 text-xs">Lun, Mar, Dim : fermé</p>
            </div>

            <p className="text-[9px] uppercase tracking-[0.4em] text-brand/70 font-bold pt-1">
              CAP Coiffure · Depuis 2018
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
                { to: '/concept',     label: 'Concept'  },
                { to: '/prestations', label: 'Services' },
                { to: '/reservation', label: 'Réserver' },
              ].map((l) => (
                <Link key={l.to} to={l.to} className="text-sm text-cream/50 font-medium hover:text-brand transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-[8px] uppercase tracking-[0.5em] text-cream/22 font-bold mb-1">Réseaux</p>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"
                className="text-sm text-cream/50 font-medium hover:text-brand transition-colors">Instagram</a>
              <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer"
                className="text-sm text-cream/50 font-medium hover:text-brand transition-colors">TikTok</a>
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

      {/* ── Copyright ── */}
      <div className="border-t border-cream/5 px-6 sm:px-10 py-4">
        <p className="text-[9px] text-cream/20 font-medium text-center tracking-[0.2em]">
          © {new Date().getFullYear()} Wonder Cut · Barbier certifié CAP · Brie-Comte-Robert, 77170
        </p>
      </div>
    </footer>
  );
}
