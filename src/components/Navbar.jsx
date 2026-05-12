import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/concept', label: 'Concept' },
  { to: '/prestations', label: 'Prestations' },
  { to: '/reservation', label: 'Réservation' },
];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-slate-700 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-semibold tracking-wide text-white">
          Wonder Cut
        </Link>

        <button
          className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Menu mobile"
          aria-expanded={open}
        >
          <span className="text-lg">☰</span>
        </button>

        <nav className="hidden gap-6 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {open && (
        <nav className="border-t border-slate-800 bg-slate-950/95 px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
