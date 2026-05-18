import { motion } from 'framer-motion';
import { ScissorsIcon } from './BarberIcons';

const ITEMS = [
  'Wonder Cut',
  'Barbershop Brie-Comte-Robert',
  "L'art de la coupe",
  'Réservation en ligne',
  'Depuis 2019',
  'Barbiers experts',
  'Coupe sur mesure',
  'Rasage traditionnel',
];

/* variant: 'dark' | 'light' | 'gold' */
export default function Marquee({ dark = false, gold = false, reverse = false, speed = 28 }) {
  const items = [...ITEMS, ...ITEMS, ...ITEMS];

  const wrapCls = gold
    ? 'border-y border-brand/0 bg-brand'
    : dark
    ? 'border-y border-cream/8 bg-darkMid'
    : 'border-y border-beige/50 bg-creamMid';

  const textCls = gold ? 'text-dark/70' : dark ? 'text-cream/22' : 'text-dark/28';
  const iconCls = gold ? 'text-dark/40'  : dark ? 'text-brand/50'  : 'text-brand/60';

  return (
    <div className={`overflow-hidden py-4 select-none ${wrapCls}`}>
      <motion.div
        className="flex items-center gap-8 whitespace-nowrap w-max"
        animate={{ x: reverse ? ['-33.33%', '0%'] : ['0%', '-33.33%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className={`text-[10px] uppercase tracking-[0.55em] font-black ${textCls}`}>
              {item}
            </span>
            <ScissorsIcon className={`w-3.5 h-3.5 shrink-0 ${iconCls}`} />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
