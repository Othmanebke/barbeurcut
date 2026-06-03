import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import { useNavigate } from 'react-router-dom';
import { ScissorsIcon, CombIcon, RazorIcon, BrushIcon } from './BarberIcons';

const CATEGORIES = [
  {
    id: 'coupes-rasage',
    label: 'Coupes & Rasage',
    Icon: ScissorsIcon,
    dark: true,
    services: [
      { id: 'coupe-homme',               title: 'Coupe homme',                price: 20,  priceLabel: '20€',      popular: false, desc: 'Consultation, lavage, coupe ciseaux ou tondeuse, finition au rasoir sur les contours.' },
      { id: 'coupe-barbe',               title: 'Coupe + Barbe',              price: 30,  priceLabel: '30€',      popular: false, desc: 'Coupe homme + taille et mise en forme de la barbe, contours dessinés au rasoir.' },
      { id: 'coupe-barbe-traditionnelle', title: 'Coupe + Barbe traditionnelle', price: 35, priceLabel: '35€',    popular: true,  desc: 'Coupe + mousse chaude, rasage de la barbe au coupe-chou, compresse froide. La formule premium.' },
      { id: 'coupe-bouc',                title: 'Coupe + Bouc',               price: 25,  priceLabel: '25€',      popular: false, desc: 'Coupe homme + rasage du visage en gardant uniquement le bouc, contours nets.' },
      { id: 'coupe-rasage-traditionnel', title: 'Coupe + Rasage traditionnel',price: 35,  priceLabel: '35€',      popular: false, desc: 'Mousse chaude, rasage au coupe-chou, compresse froide pour fermer les pores.' },
      { id: 'coupe-enfant',              title: 'Coupe enfant',               price: 15,  priceLabel: '15€',      popular: false, desc: 'Moins de 15 ans — coupe douce, ciseaux ou tondeuse selon le style.' },
    ],
  },
  {
    id: 'barbe-crane',
    label: 'Barbe & Crâne',
    Icon: RazorIcon,
    dark: false,
    services: [
      { id: 'taille-barbe', title: 'Taille de barbe', price: 13, priceLabel: '13€', popular: false, desc: 'Peignage, taille à la longueur voulue, contours définis au rasoir ou tondeuse.' },
      { id: 'rasage-crane', title: 'Rasage du crâne', price: 15, priceLabel: '15€', popular: false, desc: 'Tonte complète à la tondeuse, puis rasage au rasoir pour un résultat lisse et net.' },
    ],
  },
  {
    id: 'design-couleur',
    label: 'Design & Couleur',
    Icon: BrushIcon,
    dark: false,
    services: [
      { id: 'design-barbe-cheveux', title: 'Design barbe / cheveux', price: null, priceLabel: 'Sur devis', popular: false, desc: 'Motifs ou tracés personnalisés au rasoir ou tondeuse, selon le dessin choisi avec le client.' },
      { id: 'coloration',           title: 'Coloration',             price: null, priceLabel: 'Sur devis', popular: false, desc: 'Application permanente ou semi-permanente sur barbe ou cheveux, selon la teinte souhaitée.' },
    ],
  },
];

function ServiceRow({ service, index, onBook, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -5% 0px' });

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={() => onBook(service)}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{ backgroundColor: 'rgba(198,142,23,0.04)' }}
      className="group w-full grid grid-cols-[28px_1fr_auto] sm:grid-cols-[44px_1fr_auto] items-center gap-3 sm:gap-6 lg:gap-8 px-4 sm:px-8 lg:px-10 py-4 sm:py-5 text-left border-b border-beige/50 last:border-0 transition-colors duration-200"
    >
      {/* Index */}
      <span className="text-[8px] sm:text-[10px] font-black text-brand/40 group-hover:text-brand transition-colors duration-200 tracking-widest">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Name + desc */}
      <div className="min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-sm sm:text-base lg:text-lg font-black uppercase tracking-[-0.01em] text-dark group-hover:text-brand transition-colors duration-200 leading-tight">
            {service.title}
          </p>
          {service.popular && (
            <span className="inline-flex items-center bg-brand px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.4em] text-dark shrink-0">
              Populaire
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-5 text-muted font-medium max-w-xl opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 group-hover:mt-1.5 transition-all duration-300 overflow-hidden">
          {service.desc}
        </p>
      </div>

      {/* Price + arrow */}
      <div className="flex items-center gap-4 shrink-0">
        <span className={`text-lg sm:text-xl font-black group-hover:text-brand transition-colors duration-200 ${service.price !== null ? 'text-dark' : 'text-muted'}`}>
          {service.priceLabel}
        </span>
        <motion.span
          className="hidden sm:flex items-center justify-center h-9 w-9 border border-beige group-hover:border-brand group-hover:bg-brand transition-all duration-200"
          whileHover={{ scale: 1.1 }}
        >
          <ScissorsIcon className="w-3.5 h-3.5 text-dark/30 group-hover:text-dark transition-colors duration-200" />
        </motion.span>
      </div>
    </motion.button>
  );
}

export default function BentoServices() {
  const { selectService } = useBooking();
  const navigate = useNavigate();

  const handleBook = (s) => {
    selectService({ id: s.id, title: s.title, price: s.price, priceLabel: s.priceLabel, cites: [] });
    navigate('/reservation');
  };

  let globalIndex = 0;

  return (
    <div className="border border-beige overflow-hidden">
      {CATEGORIES.map((cat, ci) => (
        <div key={cat.id}>
          {/* Category header */}
          <div className={`flex items-center justify-between px-4 sm:px-8 lg:px-10 py-4 ${cat.dark ? 'bg-dark' : 'bg-creamMid border-t border-beige/60'}`}>
            <div className="flex items-center gap-3">
              <cat.Icon className={`w-4 h-4 shrink-0 ${cat.dark ? 'text-brand' : 'text-brand/70'}`} />
              <h3 className={`text-[9px] font-black uppercase tracking-[0.55em] ${cat.dark ? 'text-cream' : 'text-dark/60'}`}>
                {cat.label}
              </h3>
            </div>
            <span className={`text-[9px] font-medium uppercase tracking-[0.4em] ${cat.dark ? 'text-cream/25' : 'text-muted/50'}`}>
              {cat.services.length} prestation{cat.services.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Service rows */}
          <div className="bg-cream">
            {cat.services.map((s) => {
              const rowIndex = globalIndex++;
              return (
                <ServiceRow
                  key={s.id}
                  service={s}
                  index={rowIndex - (ci === 0 ? 0 : ci === 1 ? CATEGORIES[0].services.length : CATEGORIES[0].services.length + CATEGORIES[1].services.length)}
                  onBook={handleBook}
                  delay={rowIndex * 0.06}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
