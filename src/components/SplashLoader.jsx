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
         style={{ background: '#5C4031' }}>

      {/* Logo blanc sur fond sombre */}
      <motion.img
        src={logo}
        alt="Wonderclub"
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          zIndex: 1,
          width: 'clamp(140px, 24vw, 220px)',
          height: 'clamp(140px, 24vw, 220px)',
          objectFit: 'contain',
        }}
      />

      {/* Pourcentage + barre */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4"
        style={{ width: 'clamp(200px, 36vw, 320px)', position: 'relative', zIndex: 1 }}>

        {/* Chiffre */}
        <p className="font-black tabular-nums leading-none text-white"
           style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)' }}>
          {String(pct).padStart(2, '0')}
          <span style={{ fontSize: '55%', color: 'rgba(255,255,255,0.45)' }}>%</span>
        </p>

        {/* Barre */}
        <div className="w-full relative overflow-hidden"
             style={{ height: '1px', background: 'rgba(255,255,255,0.12)' }}>
          <div className="absolute top-0 left-0 h-full"
               style={{ width: `${pct}%`, background: '#FFFFFF', transition: 'none' }} />
        </div>

        <p className="text-[8px] uppercase tracking-[0.55em] font-bold"
           style={{ color: 'rgba(255,255,255,0.25)' }}>
          Wonderclub
        </p>
      </motion.div>
    </div>
  );
}
