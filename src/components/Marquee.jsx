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

/* brown=true → fond blanc + texte marron
   default    → fond blanc + texte bleu denim */
export default function Marquee({ brown = false, reverse = false, speed = 20 }) {
  const items = [...ITEMS, ...ITEMS, ...ITEMS];
  const textColor = brown ? '#5C4031' : '#405568';
  const dotColor  = brown ? 'rgba(92,64,49,0.35)' : 'rgba(64,85,104,0.35)';

  return (
    <div className="overflow-hidden py-4 sm:py-5 select-none"
         style={{ background: '#F4EFEA', borderTop: '3px solid rgba(64,85,104,0.12)', borderBottom: '3px solid rgba(64,85,104,0.12)' }}>
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
