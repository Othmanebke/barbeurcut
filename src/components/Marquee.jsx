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

export default function Marquee({ dark = false, gold = false, reverse = false, speed = 20 }) {
  const items = [...ITEMS, ...ITEMS, ...ITEMS];

  const wrapCls = gold
    ? 'border-y-4 border-dark/20 bg-brand'
    : dark
    ? 'border-y-4 border-brand/50 bg-dark'
    : 'border-y-4 border-brand bg-cream';

  const textCls = gold
    ? 'text-white/70'
    : dark
    ? 'text-white/60'
    : 'text-dark/20';

  const dotCls = gold
    ? 'text-white/50'
    : dark
    ? 'text-white/40'
    : 'text-brand';

  return (
    <div className={`overflow-hidden py-4 sm:py-5 select-none ${wrapCls}`}>
      <motion.div
        className="flex items-center whitespace-nowrap w-max"
        animate={{ x: reverse ? ['-33.33%', '0%'] : ['0%', '-33.33%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className={`text-[clamp(1.1rem,3vw,2.2rem)] font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] px-5 sm:px-8 ${textCls}`}>
              {item}
            </span>
            <span className={`text-[clamp(0.9rem,2.5vw,1.8rem)] shrink-0 ${dotCls}`}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
