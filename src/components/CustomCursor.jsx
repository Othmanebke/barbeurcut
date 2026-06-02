import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Precision custom cursor using Framer Motion springs (no RAF loop / DOM hacks).
 *
 * Architecture:
 *  - mouseX / mouseY: raw MotionValues updated on every mousemove
 *  - dot springs: stiffness 800 → near-instant tracking
 *  - ring springs: stiffness 130 → pleasantly lagged trail
 *  - mix-blend-mode: difference → white cursor inverts whatever is underneath
 *    (appears bright on dark bg, dark on light bg / neon buttons)
 */
function CustomCursor() {
  // Pas de curseur custom sur les appareils tactiles
  if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return null;

  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  // Raw mouse position — updated imperatively for zero-cost motion
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  // Dot: very tight spring — feels like the real cursor
  const dotX = useSpring(mouseX, { stiffness: 800, damping: 44 });
  const dotY = useSpring(mouseY, { stiffness: 800, damping: 44 });

  // Ring: loose spring — trails slightly for premium feel
  const ringX = useSpring(mouseX, { stiffness: 130, damping: 20 });
  const ringY = useSpring(mouseY, { stiffness: 130, damping: 20 });

  useEffect(() => {
    const onMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const onOver = (e) => {
      if (e.target?.closest('a, button, [data-cursor]')) setHovering(true);
    };
    const onOut = (e) => {
      if (e.target?.closest('a, button, [data-cursor]')) setHovering(false);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, [mouseX, mouseY, visible]);

  return (
    <>
      {/* ── Dot — tight tracking, mix-blend-mode: difference ── */}
      <motion.div
        className="cursor-dot"
        style={{ x: dotX, y: dotY }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* ── Ring — laggy trail, scales on interactive elements ── */}
      <motion.div
        className="cursor-ring"
        style={{ x: ringX, y: ringY }}
        animate={{
          scale: hovering ? 1.7 : 1,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          scale: { type: 'spring', stiffness: 280, damping: 24 },
          opacity: { duration: 0.3 },
        }}
      />
    </>
  );
}

export default CustomCursor;
