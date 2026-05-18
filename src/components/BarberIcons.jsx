/* SVG barber-themed icons — stroke-based, use currentColor */

export function ScissorsIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <line x1="20" y1="4" x2="8.5" y2="15.5" />
      <line x1="14.5" y1="14.5" x2="20" y2="20" />
      <line x1="8.5" y1="8.5" x2="12" y2="12" />
    </svg>
  );
}

export function RazorIcon({ className = 'w-6 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 48 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="1" y="1" width="46" height="22" />
      <line x1="11" y1="1" x2="11" y2="23" />
      <line x1="37" y1="1" x2="37" y2="23" />
      <circle cx="24" cy="12" r="4" />
      <line x1="20" y1="12" x2="28" y2="12" />
    </svg>
  );
}

export function CombIcon({ className = 'w-6 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="1" y="1" width="46" height="12" />
      <line x1="7"  y1="13" x2="7"  y2="31" />
      <line x1="14" y1="13" x2="14" y2="31" />
      <line x1="21" y1="13" x2="21" y2="31" />
      <line x1="28" y1="13" x2="28" y2="31" />
      <line x1="35" y1="13" x2="35" y2="31" />
      <line x1="42" y1="13" x2="42" y2="24" />
    </svg>
  );
}

export function BrushIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 20c2-2 4-4 4-4s0-4 4-4 8-3 10-10" />
      <path d="M18 3l3 3-12 12-4 1 1-4z" />
    </svg>
  );
}

/* Animated barber pole — decorative strip */
export function BarberPole({ className = '' }) {
  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden>
      <div
        className="absolute inset-0 animate-[barberpole_2s_linear_infinite]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #C68E17 0px, #C68E17 6px, #4A2F1A 6px, #4A2F1A 12px, #FFF8E7 12px, #FFF8E7 18px, #4A2F1A 18px, #4A2F1A 24px)',
          backgroundSize: '34px 34px',
        }}
      />
    </div>
  );
}

/* Gold diamond divider */
export function DiamondDivider({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden>
      <span className="block h-px flex-1 bg-current opacity-20" />
      <ScissorsIcon className="w-4 h-4 text-brand" />
      <span className="block h-px flex-1 bg-current opacity-20" />
    </div>
  );
}
