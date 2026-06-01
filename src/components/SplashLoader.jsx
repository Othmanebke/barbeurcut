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
    <div className="fixed inset-0 z-[200] bg-cream flex flex-col items-center justify-center gap-10">

      {/* Logo sans fond */}
      <motion.img
        src={logo}
        alt="Wonder Cut"
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 'clamp(100px, 18vw, 160px)',
          height: 'clamp(100px, 18vw, 160px)',
          objectFit: 'contain',
        }}
      />

      {/* Pourcentage + barre */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4"
        style={{ width: 'clamp(220px, 40vw, 360px)' }}
      >
        {/* Chiffre */}
        <p className="font-black tabular-nums text-dark leading-none"
           style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)' }}>
          {String(pct).padStart(2, '0')}
          <span className="text-brand" style={{ fontSize: '55%' }}>%</span>
        </p>

        {/* Barre */}
        <div className="w-full h-[2px] bg-dark/10 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-brand"
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="text-[8px] uppercase tracking-[0.55em] text-dark/25 font-bold">
          Wonder Cut
        </p>
      </motion.div>
    </div>
  );
}
