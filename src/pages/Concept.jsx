import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Marquee from '../components/Marquee';
import { ScissorsIcon, CombIcon, RazorIcon } from '../components/BarberIcons';

const EASE = [0.22, 1, 0.36, 1];

function useReveal(opts = {}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px', ...opts });
  return [ref, inView];
}

/* Révèle chaque mot d'un texte au scroll */
function RevealWords({ text, className, style, delay = 0 }) {
  const [ref, inView] = useReveal();
  const words = text.split(' ');
  return (
    <span ref={ref} className={className} style={style}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: delay + i * 0.055, ease: EASE }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* Chiffre animé */
function BigNumber({ value, label }) {
  const [ref, inView] = useReveal();
  return (
    <motion.div ref={ref}
      className="flex flex-col gap-2 p-8 sm:p-10 border-r last:border-r-0 border-white/10 group cursor-default"
      whileHover={{ backgroundColor: '#5C4031' }}
      style={{ background: '#405568' }}
      transition={{ duration: 0.4 }}>
      <motion.p
        className="font-black leading-none tracking-[-0.04em] text-white"
        style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: EASE }}>
        {value}
      </motion.p>
      <motion.p
        className="text-[9px] uppercase tracking-[0.45em] font-bold"
        style={{ color: 'rgba(244,239,234,0.45)' }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}>
        {label}
      </motion.p>
    </motion.div>
  );
}

/* Valeur pilier — carte pleine largeur avec numéro fantôme */
function PillarRow({ id, title, desc, Icon, delay = 0 }) {
  const [ref, inView] = useReveal();
  return (
    <motion.div ref={ref}
      className="relative overflow-hidden group cursor-default border-b"
      style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#3D2A1E' }}
      whileHover={{ backgroundColor: '#4A3428' }}
      transition={{ duration: 0.4 }}>

      {/* Numéro fantôme en fond */}
      <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 font-black leading-none select-none pointer-events-none"
           style={{ fontSize: 'clamp(6rem, 18vw, 14rem)', color: 'rgba(255,255,255,0.04)' }}>
        {id}
      </div>

      {/* Barre gauche qui apparaît au hover */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/60 origin-top"
        initial={{ scaleY: 0 }}
        whileHover={{ scaleY: 1 }}
        transition={{ duration: 0.35, ease: EASE }}
      />

      <div className="relative z-10 px-8 sm:px-12 py-10 sm:py-14">
        <div className="grid grid-cols-[1fr_auto] gap-6 items-start">
          <div>
            {/* Numéro petit */}
            <motion.span
              className="text-[9px] uppercase tracking-[0.6em] font-black block mb-4"
              style={{ color: 'rgba(255,255,255,0.22)' }}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay, ease: EASE }}>
              {id}
            </motion.span>

            {/* Titre — glisse depuis la gauche */}
            <div className="overflow-hidden">
              <motion.h3
                className="font-black uppercase tracking-[-0.03em] text-white"
                style={{ fontSize: 'clamp(1.8rem, 5vw, 4rem)', lineHeight: 0.95 }}
                initial={{ x: '-80px', opacity: 0 }}
                animate={inView ? { x: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: delay + 0.1, ease: EASE }}>
                {title}
              </motion.h3>
            </div>

            {/* Desc — glisse depuis la gauche avec délai */}
            <motion.p
              className="mt-4 text-sm sm:text-base leading-7 max-w-lg font-medium"
              style={{ color: 'rgba(244,239,234,0.45)' }}
              initial={{ x: '-40px', opacity: 0 }}
              animate={inView ? { x: 0, opacity: 1 } : {}}
              transition={{ duration: 0.75, delay: delay + 0.25, ease: EASE }}>
              {desc}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: delay + 0.3, ease: 'backOut' }}>
            <Icon className="w-7 h-6 text-white/10 group-hover:text-white/25 transition-colors duration-400 mt-8" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

const PILLARS = [
  { id: '01', title: 'Barbier indépendant', desc: 'Je travaille à mon compte. Je loue mon siège au 1 Rue de la Madeleine — tu réserves avec moi directement, pas avec un salon.', Icon: ScissorsIcon },
  { id: '02', title: 'À ton écoute',        desc: 'Je prends le temps de comprendre ce que tu veux avant de commencer. Pas de précipitation, juste un travail soigné.',          Icon: CombIcon     },
  { id: '03', title: 'Style sur mesure',    desc: 'Je fais des coupes actuelles adaptées à ta tête et ton style. Pas du copier-coller de tendances.',                            Icon: RazorIcon    },
];

export default function Concept() {
  return (
    <>
      {/* ══════════════════════ HERO TYPOGRAPHIQUE ══════════════ */}
      <section
        className="relative flex flex-col justify-between overflow-hidden"
        style={{ minHeight: '100vh', background: '#5C4031', paddingTop: 'var(--navbar-h, 72px)' }}>

        {/* Lignes verticales déco */}
        <div className="absolute inset-0 pointer-events-none">
          {[25, 50, 75].map((pct, i) => (
            <motion.div key={i} className="absolute top-0 bottom-0 w-px"
              style={{ left: `${pct}%`, background: 'rgba(255,255,255,0.04)' }}
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ duration: 2, delay: i * 0.2, ease: EASE }} />
          ))}
        </div>

        {/* Haut — Depuis 2018 top right */}
        <motion.div className="relative z-10 px-6 sm:px-10 pt-10 flex justify-end"
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.5 }}>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[8px] uppercase tracking-[0.5em] font-bold"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>Depuis</span>
            <span className="font-black text-white leading-none" style={{ fontSize: '2.2rem' }}>2018</span>
          </div>
        </motion.div>

        {/* Centre — titre géant */}
        <div className="relative z-10 px-4 sm:px-8 py-8 flex-1 flex flex-col justify-center">

          {/* LE — glisse depuis la gauche */}
          <div className="overflow-hidden">
            <motion.h1
              className="font-black uppercase leading-[0.85] tracking-[-0.05em] text-white"
              style={{ fontSize: 'clamp(6rem, 22vw, 20rem)' }}
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.2, ease: EASE }}>
              LE
            </motion.h1>
          </div>

          {/* CONCEPT — glisse depuis la droite */}
          <div className="overflow-hidden">
            <motion.h1
              className="font-black uppercase leading-[0.85] tracking-[-0.05em]"
              style={{ fontSize: 'clamp(4.5rem, 16vw, 14rem)', color: 'rgba(255,255,255,0.22)' }}
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.35, ease: EASE }}>
              CONCEPT
            </motion.h1>
          </div>

          {/* Ligne déco qui grandit */}
          <motion.div className="flex items-center gap-4 mt-8 mb-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
            <motion.span className="block h-px bg-white/25"
              initial={{ width: 0 }} animate={{ width: '4rem' }}
              transition={{ duration: 0.9, delay: 1.1, ease: EASE }} />
            <motion.span
              initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 1.4, duration: 0.4, ease: 'backOut' }}
              style={{ color: 'rgba(255,255,255,0.30)', fontSize: '1rem' }}>✦</motion.span>
            <motion.span className="block h-px bg-white/25"
              initial={{ width: 0 }} animate={{ width: '4rem' }}
              transition={{ duration: 0.9, delay: 1.1, ease: EASE }} />
          </motion.div>

        </div>

        {/* Bas — scroll indicator centré */}
        <motion.div className="relative z-10 px-6 sm:px-10 pb-10 flex justify-center"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.6 }}>
          <motion.div
            className="flex flex-col items-center gap-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <span className="text-[8px] uppercase tracking-[0.5em] font-bold"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>Scroll</span>
            <span className="block w-px h-8 bg-white/20" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════ MANIFESTE ════════════════════════ */}
      <section style={{ background: '#4A3225' }} className="py-16 sm:py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <p className="text-[8px] uppercase tracking-[0.6em] font-bold mb-8"
             style={{ color: 'rgba(255,255,255,0.30)' }}>Manifeste</p>
          <RevealWords
            text="Je ne travaille pas pour un patron."
            className="block font-black uppercase leading-tight tracking-[-0.03em] text-white mb-4"
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}
          />
          <RevealWords
            text="Je travaille pour toi."
            className="block font-black uppercase leading-tight tracking-[-0.03em]"
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', color: 'rgba(255,255,255,0.25)' }}
            delay={0.3}
          />
          <motion.div className="mt-10 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.6 }}>
            <p className="text-sm sm:text-base leading-8 font-medium"
               style={{ color: 'rgba(244,239,234,0.50)' }}>
              Chaque réservation est un engagement direct entre nous deux. Pas d'intermédiaire, pas de surprise.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ CHIFFRES ════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4">
        {[
          { value: '2018', label: 'En activité' },
          { value: '100%', label: 'Satisfaits'  },
          { value: 'BP',   label: 'Diplômé'     },
          { value: 'Mer–Sam', label: '10h–19h30' },
        ].map((s) => <BigNumber key={s.label} {...s} />)}
      </div>

      <Marquee />

      {/* ══════════════════ PILIERS ════════════════════════ */}
      <section style={{ background: '#3D2A1E' }}>
        {/* Header section */}
        <div className="px-6 sm:px-12 py-10 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}>
            <span className="text-[9px] uppercase tracking-[0.6em] font-bold"
                  style={{ color: 'rgba(255,255,255,0.30)' }}>Mes valeurs</span>
            <span className="text-[9px] uppercase tracking-[0.4em] font-bold"
                  style={{ color: 'rgba(255,255,255,0.15)' }}>03 principes</span>
          </motion.div>
        </div>

        {PILLARS.map((p, i) => (
          <PillarRow key={p.id} {...p} delay={i * 0.1} />
        ))}
      </section>

      <Marquee dark reverse />

      {/* ══════════════════ SPLIT — INDÉPENDANT ════════════ */}
      <section style={{ background: '#5C4031' }} className="overflow-hidden">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2">

          {/* Image */}
          <motion.div
            className="relative min-h-[50vh] lg:min-h-[70vh] overflow-hidden order-2 lg:order-1"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, ease: EASE }}>
            <div className="absolute inset-0"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=900&q=80")',
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'grayscale(20%) brightness(0.45)',
              }}
            />
            {/* Overlay dégradé */}
            <div className="absolute inset-0"
                 style={{ background: 'linear-gradient(to right, transparent 60%, #5C4031 100%)' }} />
            {/* Numéro discret */}
            <div className="absolute bottom-8 left-8">
              <p className="font-black text-white/10" style={{ fontSize: '8rem', lineHeight: 1 }}>W</p>
            </div>
          </motion.div>

          {/* Texte */}
          <motion.div
            className="flex flex-col justify-center px-8 sm:px-12 py-16 order-1 lg:order-2"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, delay: 0.2, ease: EASE }}>

            <p className="text-[9px] uppercase tracking-[0.6em] font-bold mb-6"
               style={{ color: 'rgba(255,255,255,0.35)' }}>La différence</p>

            <h2 className="font-black uppercase leading-[0.92] tracking-[-0.03em] text-white mb-8"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              Toi et moi,<br />
              <span style={{ color: 'rgba(255,255,255,0.30)' }}>c'est direct.</span>
            </h2>

            <p className="text-sm sm:text-base leading-8 font-medium mb-10"
               style={{ color: 'rgba(244,239,234,0.55)' }}>
              Quand tu réserves ici tu sais exactement avec qui tu viens. Je suis le même barbier à chaque fois. Je loue mon siège, je n'ai pas de patron, et je mets tout mon savoir-faire dans chaque coupe.
            </p>

            <div className="space-y-3 mb-10">
              {[
                'Réservation en ligne en 3 clics',
                'Confirmation par email et SMS',
                'Diplôme BP — CMA Saint-Maur-des-Fossés',
                'Le prix affiché est le prix payé',
              ].map((item, i) => (
                <motion.div key={i}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1, ease: EASE }}>
                  <span className="h-5 w-5 border border-white/30 shrink-0 flex items-center justify-center text-white text-[10px] font-black">✓</span>
                  <span className="text-sm font-medium" style={{ color: 'rgba(244,239,234,0.65)' }}>{item}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link to="/prestations"
                  className="inline-flex items-center gap-2 bg-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-creamMid transition-colors"
                  style={{ color: '#5C4031' }}>
                  <ScissorsIcon className="w-3.5 h-3.5" /> Voir les prestations
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link to="/reservation"
                  className="inline-flex items-center gap-2 border border-white/20 px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-white hover:border-white/50 transition-all">
                  Réserver
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Marquee light />

      {/* ══════════════════ ADRESSE ════════════════════════ */}
      <section style={{ background: '#405568' }} className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE }}>

              <p className="text-[9px] uppercase tracking-[0.6em] font-bold mb-6"
                 style={{ color: 'rgba(255,255,255,0.35)' }}>Nous trouver</p>

              <h2 className="font-black uppercase tracking-[-0.03em] text-white mb-2"
                  style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.1 }}>
                1 Rue de la Madeleine
              </h2>
              <p className="font-bold text-xl mb-10" style={{ color: 'rgba(244,239,234,0.40)' }}>
                77170 Brie-Comte-Robert
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { icon: '✂', label: 'Ouvert', val: 'Mercredi → Samedi' },
                  { icon: '◷', label: 'Horaires', val: '10h00 – 19h30' },
                  { icon: '✕', label: 'Fermé', val: 'Lundi, Mardi, Dimanche' },
                  { icon: '◈', label: 'Paiement', val: 'Espèces ou chèque' },
                ].map((row, i) => (
                  <motion.div key={i}
                    className="flex items-center gap-5 pb-4 border-b"
                    style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}>
                    <span className="text-white/25 text-sm w-4 shrink-0">{row.icon}</span>
                    <span className="text-[9px] uppercase tracking-[0.4em] font-bold w-20 shrink-0"
                          style={{ color: 'rgba(244,239,234,0.35)' }}>{row.label}</span>
                    <span className="text-sm font-bold text-white">{row.val}</span>
                  </motion.div>
                ))}
              </div>

              <a href="https://www.google.com/maps/search/?api=1&query=1+Rue+de+la+Madeleine+77170+Brie-Comte-Robert"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-creamMid transition-colors"
                style={{ color: '#5C4031' }}>
                Voir sur Google Maps →
              </a>
            </motion.div>

            {/* Carte */}
            <motion.div
              className="overflow-hidden h-80 lg:h-[500px] border border-white/10"
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE }}>
              <iframe
                title="Wonderclub — Brie-Comte-Robert"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2639.0!2d2.7!3d48.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e5ef0000000001%3A0x0!2sBrie-Comte-Robert%2C+77170!5e0!3m2!1sfr!2sfr!4v1700000000000"
                width="100%" height="100%" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
