import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const KEY = 'wc_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(KEY));

  const accept = () => { localStorage.setItem(KEY, 'accepted'); setVisible(false); };
  const refuse = () => { localStorage.setItem(KEY, 'refused');  setVisible(false); };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-[300] border-t"
          style={{ background: '#3D2A1E', borderColor: 'rgba(255,255,255,0.10)' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
          <div className="mx-auto max-w-6xl px-5 sm:px-10 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

            <p className="text-xs leading-6 font-medium" style={{ color: 'rgba(244,239,234,0.60)' }}>
              Ce site utilise des cookies techniques nécessaires à son fonctionnement.{' '}
              <Link to="/mentions-legales" className="underline hover:text-white transition-colors">
                En savoir plus
              </Link>
            </p>

            <div className="flex items-center gap-3 shrink-0">
              <button onClick={refuse}
                className="px-5 py-2 text-[10px] font-bold uppercase tracking-[0.35em] border border-white/20 text-white/50 hover:text-white hover:border-white/50 transition-colors">
                Refuser
              </button>
              <button onClick={accept}
                className="px-5 py-2 text-[10px] font-black uppercase tracking-[0.35em] bg-white hover:bg-creamMid transition-colors"
                style={{ color: '#5C4031' }}>
                Accepter
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
