import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

/* Deux photos barbershop — on peut les remplacer par de vraies photos du salon */
const BEFORE = 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=1000&q=85';
const AFTER  = 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1000&q=85';

export default function BeforeAfterSlider() {
  const [pos, setPos]   = useState(50);   /* 0 – 100 % */
  const dragging        = useRef(false);
  const containerRef    = useRef(null);

  const updatePos = useCallback((clientX) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const pct = ((clientX - left) / width) * 100;
    setPos(Math.max(3, Math.min(97, pct)));
  }, []);

  /* Pointer Events API — gère souris ET tactile avec capture */
  const onPointerDown = (e) => {
    dragging.current = true;
    containerRef.current?.setPointerCapture(e.pointerId);
    updatePos(e.clientX);
  };
  const onPointerMove = (e) => { if (dragging.current) updatePos(e.clientX); };
  const onPointerUp   = ()  => { dragging.current = false; };

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="relative w-full select-none overflow-hidden cursor-ew-resize"
      style={{ height: 'clamp(320px, 52vw, 600px)' }}
      role="img"
      aria-label="Glisse pour comparer avant et après la coupe"
    >
      {/* ── AVANT (fond) ── */}
      <img
        src={BEFORE}
        alt="Avant la coupe"
        className="absolute inset-0 w-full h-full object-cover object-top"
        draggable={false}
        loading="lazy"
      />

      {/* ── APRÈS (clipé à gauche) ── */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src={AFTER}
          alt="Après la coupe"
          className="absolute inset-0 w-full h-full object-cover object-top"
          draggable={false}
          loading="lazy"
        />
      </div>

      {/* ── Overlay bas pour labels ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-dark/20 pointer-events-none" />

      {/* ── Ligne de séparation ── */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-cream/90 pointer-events-none"
        style={{ left: `${pos}%` }}
      />

      {/* ── Handle draggable ── */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-10"
        style={{ left: `${pos}%` }}
      >
        <motion.div
          className="h-12 w-12 sm:h-14 sm:w-14 bg-brand flex items-center justify-center shadow-gold border-2 border-cream"
          animate={{ scale: dragging.current ? 1.15 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {/* Flèches bidirectionnelles */}
          <svg viewBox="0 0 22 12" fill="none" className="w-5 h-3">
            <path d="M1 6h20" stroke="#4A2F1A" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M5 2L1 6l4 4"  stroke="#4A2F1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 2l4 4-4 4" stroke="#4A2F1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
        {/* Ligne verticale sous/au-dessus du handle */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-[2px] h-8 bg-cream/60" />
        <div className="absolute top-full  left-1/2 -translate-x-1/2 w-[2px] h-8 bg-cream/60" />
      </div>

      {/* ── Labels bas ── */}
      <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 pointer-events-none z-10">
        <span className="inline-flex items-center gap-1.5 bg-dark/80 backdrop-blur-sm px-3 py-1.5">
          <span className="text-[9px] font-black uppercase tracking-[0.45em] text-cream/80">← Avant</span>
        </span>
      </div>
      <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 pointer-events-none z-10">
        <span className="inline-flex items-center gap-1.5 bg-brand/90 backdrop-blur-sm px-3 py-1.5">
          <span className="text-[9px] font-black uppercase tracking-[0.45em] text-dark">Après →</span>
        </span>
      </div>

      {/* ── Hint "glisse" (disparaît après interaction) ── */}
      {pos === 50 && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.8, repeat: 3, ease: 'easeInOut' }}
          className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10"
        >
          <span className="bg-dark/70 backdrop-blur-sm px-4 py-2 text-[9px] font-bold uppercase tracking-[0.4em] text-cream/80 flex items-center gap-2">
            ← Glisse →
          </span>
        </motion.div>
      )}
    </div>
  );
}
