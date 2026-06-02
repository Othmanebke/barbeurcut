import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Marquee from '../components/Marquee';
import { ScissorsIcon, RazorIcon, CombIcon, BrushIcon } from '../components/BarberIcons';
import { serviceCategories } from '../data/services';
import { useBooking } from '../context/BookingContext';

const EASE = [0.22, 1, 0.36, 1];

/* ── Carte service — prix + durée au hover ── */
function ServiceCard({ service, index, onBook, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -5% 0px' });

  return (
    <motion.div
      ref={ref}
      className="relative overflow-hidden cursor-pointer border-b group"
      style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#3D2A1E' }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onBook(service)}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: EASE }}
      whileHover={{ backgroundColor: '#2E1F14' }}
    >
      {/* Barre gauche hover */}
      <motion.div className="absolute left-0 top-0 bottom-0 w-[3px] bg-white origin-top"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: hovered ? 1 : 0 }}
        transition={{ duration: 0.3, ease: EASE }} />

      {/* Numéro fantôme */}
      <div className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 font-black leading-none pointer-events-none select-none"
           style={{ fontSize: 'clamp(4rem, 12vw, 9rem)', color: 'rgba(255,255,255,0.04)' }}>
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="relative z-10 px-8 sm:px-10 lg:px-14 py-7 sm:py-9">
        <div className="flex items-center justify-between gap-6">

          {/* Gauche : numéro + titre + desc hover */}
          <div className="flex items-start gap-6 sm:gap-10 min-w-0">
            <span className="text-[9px] uppercase tracking-[0.55em] font-black shrink-0 mt-1"
                  style={{ color: 'rgba(255,255,255,0.22)' }}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <h3 className="font-black uppercase tracking-[-0.02em] text-white"
                  style={{ fontSize: 'clamp(1.2rem, 3.5vw, 2.2rem)', lineHeight: 1.05 }}>
                {service.title}
              </h3>
              <AnimatePresence>
                {hovered && (
                  <motion.p key="desc"
                    className="text-sm leading-6 mt-2 max-w-md font-medium"
                    style={{ color: 'rgba(244,239,234,0.50)' }}
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.28, ease: EASE }}>
                    {service.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Droite : durée + prix + flèche */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">

            <AnimatePresence>
              {hovered && (
                <motion.div key="dur"
                  className="hidden sm:flex flex-col items-end gap-0.5"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25, ease: EASE }}>
                  <span className="text-[8px] uppercase tracking-[0.5em] font-bold"
                        style={{ color: 'rgba(244,239,234,0.30)' }}>Durée</span>
                  <span className="text-sm font-black text-white">{service.duration} min</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[8px] uppercase tracking-[0.5em] font-bold hidden sm:block"
                    style={{ color: 'rgba(244,239,234,0.30)' }}>
                {hovered ? 'Prix' : `${service.duration} min`}
              </span>
              <span className="font-black text-white text-lg sm:text-xl" style={{ lineHeight: 1 }}>
                {service.priceLabel}
              </span>
            </div>

            <motion.div
              className="hidden sm:flex items-center justify-center border border-white/15 group-hover:border-white group-hover:bg-white transition-all duration-300"
              style={{ width: 44, height: 44 }}
              animate={{ opacity: hovered ? 1 : 0.35 }}>
              <ScissorsIcon className="w-4 h-3.5 text-white/40 group-hover:text-dark transition-colors duration-300" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Services() {
  const { selectService } = useBooking();
  const navigate = useNavigate();

  const handleBook = (s) => {
    selectService({ id: s.id, title: s.title, price: s.price, priceLabel: s.priceLabel, duration: s.duration, cites: [] });
    navigate('/reservation');
  };

  let globalIdx = 0;

  return (
    <>
      {/* ══════════════ HERO TYPOGRAPHIQUE ════════════════════ */}
      <section className="relative flex flex-col overflow-hidden"
               style={{ minHeight: 'clamp(380px, 68vh, 800px)', background: '#5C4031', paddingTop: 'var(--navbar-h, 72px)' }}>

        <div className="absolute inset-0 pointer-events-none">
          {[20, 50, 80].map((pct, i) => (
            <motion.div key={i} className="absolute top-0 bottom-0 w-px"
              style={{ left: `${pct}%`, background: 'rgba(255,255,255,0.04)' }}
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ duration: 1.5, delay: i * 0.12, ease: EASE }} />
          ))}
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-end px-6 sm:px-10 pb-14 sm:pb-20">

          <motion.p className="text-[9px] uppercase tracking-[0.6em] font-bold mb-6"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}>
            Catalogue
          </motion.p>

          <div className="overflow-hidden mb-1">
            <motion.h1 className="font-black uppercase leading-[0.88] tracking-[-0.05em] text-white"
              style={{ fontSize: 'clamp(3rem, 15vw, 12rem)' }}
              initial={{ x: '-100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.2, ease: EASE }}>
              MES
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-10">
            <motion.h1 className="font-black uppercase leading-[0.88] tracking-[-0.05em]"
              style={{ fontSize: 'clamp(2rem, 11vw, 9rem)', color: 'rgba(255,255,255,0.25)' }}
              initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.35, ease: EASE }}>
              SERVICES
            </motion.h1>
          </div>

          <motion.div className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0 }}>
            <div className="flex items-center gap-8 sm:gap-12">
              {[{ l: 'À partir de', v: '10€' }, { l: "Jusqu'à", v: '35€' }].map((s) => (
                <div key={s.l} className="flex flex-col gap-0.5">
                  <span className="text-[8px] uppercase tracking-[0.5em] font-bold"
                        style={{ color: 'rgba(255,255,255,0.30)' }}>{s.l}</span>
                  <span className="text-xl sm:text-2xl font-black text-white">{s.v}</span>
                </div>
              ))}
            </div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/reservation"
                className="inline-flex items-center gap-2 bg-white px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-creamMid transition-colors"
                style={{ color: '#5C4031' }}>
                <ScissorsIcon className="w-3.5 h-3.5" /> Réserver
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Marquee />

      {/* ══════════════ LISTE DES SERVICES ════════════════════ */}
      {serviceCategories.map((cat) => (
        <div key={cat.id}>
          <motion.div
            className="flex items-center justify-between px-8 sm:px-10 lg:px-14 py-5 border-b"
            style={{ background: '#405568', borderColor: 'rgba(255,255,255,0.10)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}>
            <span className="text-[9px] uppercase tracking-[0.6em] font-bold text-white/60">{cat.name}</span>
            <span className="text-[8px] uppercase tracking-[0.5em] font-bold text-white/25">
              {cat.services.length} prestation{cat.services.length > 1 ? 's' : ''}
            </span>
          </motion.div>

          {cat.services.map((s) => {
            const idx = globalIdx++;
            return <ServiceCard key={s.id} service={s} index={idx} onBook={handleBook} delay={idx * 0.05} />;
          })}
        </div>
      ))}

      <Marquee brown />

      {/* ══════════════ ENGAGEMENTS ═══════════════════════════ */}
      <section style={{ background: '#F4EFEA' }} className="py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">

          {/* Header */}
          <motion.div className="flex items-end justify-between mb-10 pb-6 border-b"
            style={{ borderColor: 'rgba(64,85,104,0.12)' }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div>
              <span className="text-[9px] uppercase tracking-[0.6em] font-bold"
                    style={{ color: 'rgba(64,85,104,0.45)' }}>La promesse Wonderclub</span>
              <h2 className="font-black uppercase tracking-[-0.04em] mt-2"
                  style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', color: '#5C4031' }}>
                Mes engagements
              </h2>
            </div>
          </motion.div>

          {/* Rangées */}
          <div className="space-y-px" style={{ background: 'rgba(64,85,104,0.08)' }}>
            {[
              { num: '01', Icon: ScissorsIcon, title: 'Tarifs fixes',         desc: 'Le prix affiché est le prix payé. Pas de frais cachés, pas de surprise.' },
              { num: '02', Icon: CombIcon,     title: 'Espèces ou chèque',    desc: 'Paiement directement sur place. Je n\'accepte pas les paiements en ligne.' },
              { num: '03', Icon: RazorIcon,    title: 'Diplômé BP Coiffure',  desc: 'CAP + BP obtenus à la CMA Saint-Maur-des-Fossés. Je suis le seul artisan.' },
              { num: '04', Icon: BrushIcon,    title: 'Satisfaction garantie', desc: 'Si la coupe ne te plaît pas, je la retravaille sans te refacturer.' },
            ].map((e, i) => (
              <motion.div key={e.num}
                className="relative overflow-hidden flex items-center gap-6 sm:gap-10 px-6 sm:px-8 py-6 sm:py-8 group cursor-default transition-all duration-300"
                style={{ background: '#F4EFEA' }}
                whileHover={{ backgroundColor: '#405568' }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}>

                {/* Numéro fantôme */}
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black leading-none pointer-events-none select-none transition-colors duration-300"
                      style={{ fontSize: '5rem', color: 'rgba(64,85,104,0.06)' }}
                      aria-hidden>
                  {e.num}
                </span>

                {/* Numéro visible */}
                <span className="text-[9px] font-black uppercase tracking-[0.6em] shrink-0 transition-colors duration-300"
                      style={{ color: 'rgba(64,85,104,0.35)' }}
                      aria-hidden>
                  {e.num}
                </span>

                {/* Icône */}
                <e.Icon className="w-5 h-4 shrink-0 transition-colors duration-300 text-denim/40 group-hover:text-white/50 hidden sm:block" />

                {/* Texte */}
                <div className="flex-1 min-w-0">
                  <p className="font-black uppercase tracking-[-0.01em] transition-colors duration-300"
                     style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: '#5C4031' }}
                     onMouseEnter={() => {}} /* color update via whileHover on parent */>
                    {e.title}
                  </p>
                  <p className="mt-1 text-sm font-medium leading-6 transition-colors duration-300"
                     style={{ color: 'rgba(64,85,104,0.55)' }}>
                    {e.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Styles hover gérés en CSS via group */}
          <style>{`
            .group:hover .eng-title { color: #FFFFFF !important; }
            .group:hover .eng-desc  { color: rgba(244,239,234,0.55) !important; }
            .group:hover .eng-num   { color: rgba(255,255,255,0.25) !important; }
          `}</style>

          <motion.div className="mt-10 text-center"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Link to="/reservation"
                className="inline-flex items-center gap-3 px-10 py-5 text-[10px] font-black uppercase tracking-[0.35em] transition-all hover:opacity-80"
                style={{ background: '#5C4031', color: '#F4EFEA' }}>
                <ScissorsIcon className="w-3.5 h-3.5" /> Réserver maintenant
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
