import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

const DURATION = 2200;

export default function SplashLoader() {
  const [pct, setPct] = useState(0);

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

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-10"
         style={{ background: '#4A2F1A' }}>

      {/* Grain overlay comme le site */}
      <div className="absolute inset-0 pointer-events-none grain opacity-60" />

      {/* Logo sans fond */}
      <motion.img
        src={logo}
        alt="Wonder Cut"
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          zIndex: 1,
          width: 'clamp(160px, 28vw, 260px)',
          height: 'clamp(160px, 28vw, 260px)',
          objectFit: 'contain',
          filter: 'sepia(1) saturate(3) hue-rotate(5deg) brightness(0.85)',
        }}
      />

      {/* Pourcentage + barre */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4"
        style={{ width: 'clamp(220px, 40vw, 360px)', position: 'relative', zIndex: 1 }}
      >
        {/* Chiffre */}
        <p className="font-black tabular-nums text-cream leading-none"
           style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)' }}>
          {String(pct).padStart(2, '0')}
          <span className="text-brand" style={{ fontSize: '55%' }}>%</span>
        </p>

        {/* Barre */}
        <div className="w-full relative overflow-hidden" style={{ height: '2px', background: 'rgba(255,248,231,0.12)' }}>
          <div
            className="absolute top-0 left-0 h-full bg-brand"
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="text-[8px] uppercase tracking-[0.55em] font-bold"
           style={{ color: 'rgba(255,248,231,0.25)' }}>
          Wonder Cut
        </p>
      </motion.div>
    </div>
  );
}
