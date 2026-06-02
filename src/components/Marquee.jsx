import { motion } from 'framer-motion';

const ITEMS = [
  'WONDERCLUB',
  'COUPE HOMME',
  'BARBE & RASAGE',
  'BRIE-COMTE-ROBERT',
  'RÉSERVATION EN LIGNE',
  'RASAGE TRADITIONNEL',
  'BARBIERS EXPERTS',
  'COUPE SUR MESURE',
];

/* variant: dark (fond marron) → texte blanc
            light (fond clair) → texte bleu denim
            denim (fond denim) → texte blanc atténué */
export default function Marquee({ dark = false, light = false, reverse = false, speed = 20 }) {
  const items = [...ITEMS, ...ITEMS, ...ITEMS];

  const wrapStyle = light
    ? { background: '#F4EFEA', borderTop: '4px solid #405568', borderBottom: '4px solid #405568' }
    : dark
    ? { background: '#5C4031', borderTop: '4px solid rgba(255,255,255,0.15)', borderBottom: '4px solid rgba(255,255,255,0.15)' }
    : { background: '#405568', borderTop: '4px solid rgba(255,255,255,0.12)', borderBottom: '4px solid rgba(255,255,255,0.12)' };

  const textColor = light ? '#405568' : 'rgba(255,255,255,0.65)';
  const dotColor  = light ? 'rgba(64,85,104,0.45)' : 'rgba(255,255,255,0.30)';

  return (
    <div className="overflow-hidden py-4 sm:py-5 select-none" style={wrapStyle}>
      <motion.div
        className="flex items-center whitespace-nowrap w-max"
        animate={{ x: reverse ? ['-33.33%', '0%'] : ['0%', '-33.33%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="text-[clamp(1.1rem,3vw,2.2rem)] font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] px-5 sm:px-8"
                  style={{ color: textColor }}>
              {item}
            </span>
            <span className="text-[clamp(0.9rem,2.5vw,1.8rem)] shrink-0" style={{ color: dotColor }}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
