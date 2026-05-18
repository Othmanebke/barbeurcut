import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DURATION = 2400;

/* Images barbershop — défilent à droite */
const SLIDES = [
  { url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=700&q=80', rotate:  5 },
  { url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=700&q=80', rotate: -4 },
  { url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=700&q=80', rotate:  6 },
  { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=700&q=80', rotate: -3 },
];

export default function SplashLoader() {
  const [pct, setPct]       = useState(0);
  const [imgIdx, setImgIdx] = useState(0);

  /* Compteur barre de progression */
  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t     = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 2.4);
      setPct(Math.floor(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setPct(100);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* Cycle des images toutes les ~600ms */
  useEffect(() => {
    const t = setInterval(
      () => setImgIdx((i) => (i + 1) % SLIDES.length),
      620
    );
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[imgIdx];

  return (
    <div className="fixed inset-0 z-[200] bg-dark overflow-hidden flex flex-col">

      {/* ── Fond ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920&q=20")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.04,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 85% 85% at 30% 55%, transparent 0%, rgba(74,47,26,0.92) 100%)',
        }}
      />

      {/* ── Pourcentage — haut droite ── */}
      <div className="relative z-10 flex justify-end px-8 sm:px-14 pt-8 sm:pt-12">
        <motion.p
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-black tabular-nums text-cream/30 leading-none"
          style={{ fontSize: 'clamp(1.4rem, 4vw, 2.8rem)' }}
        >
          {String(pct).padStart(2, '0')}
          <span className="text-brand">%</span>
        </motion.p>
      </div>

      {/* ── Images défilantes — milieu droite ── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute z-10 pointer-events-none hidden sm:block"
        style={{
          right: 'clamp(5%, 8vw, 120px)',
          top:   '38%',
          transform: 'translateY(-50%)',
        }}
      >
        {/* Ombre portée derrière */}
        <div
          className="absolute inset-0 bg-dark/40"
          style={{
            transform: `rotate(${slide.rotate + 4}deg) translateX(10px) translateY(8px)`,
            zIndex: -1,
          }}
        />

        <AnimatePresence mode="popLayout">
          <motion.div
            key={imgIdx}
            initial={{ x: 70, rotate: slide.rotate + 8, opacity: 0, scale: 0.9 }}
            animate={{ x: 0,  rotate: slide.rotate,     opacity: 1, scale: 1 }}
            exit={{    x: -50, rotate: slide.rotate - 6, opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border border-cream/10"
            style={{
              width:     'clamp(150px, 18vw, 260px)',
              height:    'clamp(200px, 24vw, 340px)',
              boxShadow: '0 20px 60px rgba(74,47,26,0.6), 0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            <img
              src={slide.url}
              alt=""
              className="w-full h-full object-cover saturate-[0.85]"
              draggable={false}
            />
            {/* Léger overlay doré en bas */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top, rgba(74,47,26,0.55), transparent)',
              }}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Bas — texte + barre ── */}
      <div className="relative z-10 px-8 sm:px-14 pb-10 sm:pb-14">

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.55em] text-brand font-bold mb-4 sm:mb-5">
            Wonder Cut — Barbershop Premium
          </p>
          <h1
            className="text-cream font-black uppercase leading-[0.92] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(2.8rem, 9vw, 7rem)' }}
          >
            Bienvenue<br />sur notre site.
          </h1>
        </motion.div>

        {/* Barre de chargement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-7 sm:mt-9 relative"
        >
          <div className="h-[1.5px] bg-cream/10 w-full" />
          <div
            className="absolute top-0 left-0 h-[1.5px] bg-brand"
            style={{ width: `${pct}%`, transition: 'none' }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-brand shadow-gold"
            style={{
              left:    `calc(${pct}% - 4px)`,
              opacity: pct > 2 && pct < 99 ? 1 : 0,
            }}
          />
        </motion.div>

      </div>
    </div>
  );
}
