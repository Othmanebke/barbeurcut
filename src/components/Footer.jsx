import { Link } from 'react-router-dom';
import { ScissorsIcon, CombIcon, DiamondDivider } from './BarberIcons';

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Brie-Comte-Robert+77170';

export default function Footer() {
  return (
    <footer className="bg-dark text-cream border-t border-cream/8">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 pt-16 pb-10">

        {/* ── Top: brand + links ── */}
        <div className="grid gap-14 lg:grid-cols-[1fr_auto] lg:items-start mb-14">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex h-8 w-8 items-center justify-center bg-brand text-dark text-[9px] font-black">WC</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Wonder Cut</span>
              <ScissorsIcon className="w-3.5 h-3.5 text-brand/40 ml-1" />
            </div>
            <p className="max-w-xs text-sm leading-7 text-cream/45 font-medium">
              Un barbershop premium pour les hommes qui se soucient de leur style.
            </p>
            <p className="mt-3 text-[9px] uppercase tracking-[0.5em] text-brand font-bold">
              L'art de la coupe sans compromis.
            </p>

            {/* Address + Maps */}
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-start gap-3 group"
            >
              <span className="text-brand mt-0.5 shrink-0">📍</span>
              <div>
                <p className="text-sm font-bold text-cream group-hover:text-brand transition-colors duration-200">
                  Brie-Comte-Robert, 77170
                </p>
                <p className="text-[9px] uppercase tracking-[0.4em] text-cream/35 font-medium mt-0.5 group-hover:text-brand/70 transition-colors duration-200">
                  Voir sur Google Maps →
                </p>
              </div>
            </a>

            <div className="mt-2 pl-7">
              <p className="text-sm text-cream/45 font-medium">Lun — Sam · 9h – 19h</p>
            </div>

            <Link
              to="/prestations"
              className="mt-7 inline-flex items-center gap-2 border border-brand px-6 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-brand transition-all duration-300 hover:bg-brand hover:text-dark"
            >
              <ScissorsIcon className="w-3.5 h-3.5" />
              Réserver
            </Link>
          </div>

          {/* Links */}
          <div className="grid grid-cols-3 gap-10 sm:gap-14">
            <div>
              <h3 className="text-[9px] font-bold uppercase tracking-[0.45em] text-cream/22 mb-6">Pages</h3>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link to="/concept"     className="text-cream/50 hover:text-brand transition-colors">Concept</Link></li>
                <li><Link to="/prestations" className="text-cream/50 hover:text-brand transition-colors">Services</Link></li>
                <li><Link to="/reservation" className="text-cream/50 hover:text-brand transition-colors">Réserver</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[9px] font-bold uppercase tracking-[0.45em] text-cream/22 mb-6">Social</h3>
              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"
                     className="text-cream/50 hover:text-brand transition-colors">Instagram</a>
                </li>
                <li>
                  <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"
                     className="text-cream/50 hover:text-brand transition-colors">Facebook</a>
                </li>
                <li>
                  <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer"
                     className="text-cream/50 hover:text-brand transition-colors">TikTok</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[9px] font-bold uppercase tracking-[0.45em] text-cream/22 mb-6">Horaires</h3>
              <ul className="space-y-2 text-sm font-medium text-cream/50">
                <li>Lundi — Vendredi</li>
                <li className="text-cream/30 text-xs">9h00 – 19h00</li>
                <li className="mt-2">Samedi</li>
                <li className="text-cream/30 text-xs">9h00 – 18h00</li>
                <li className="mt-2 text-cream/25">Dimanche fermé</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Scissors divider */}
        <DiamondDivider className="text-cream mb-8" />

        {/* Icon row */}
        <div className="flex items-center justify-center gap-8 mb-8 opacity-12">
          <ScissorsIcon className="w-6 h-6 text-cream" />
          <CombIcon     className="w-7 h-6 text-cream" />
          <ScissorsIcon className="w-6 h-6 text-cream rotate-180" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream/5 px-6 sm:px-10 py-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] text-cream/22 font-medium">
          © {new Date().getFullYear()} Wonder Cut — Brie-Comte-Robert, 77170. Tous droits réservés.
        </p>
        <p className="text-[10px] text-cream/15 uppercase tracking-[0.4em] font-medium hidden sm:block">
          Barbershop premium · Seine-et-Marne
        </p>
      </div>
    </footer>
  );
}
