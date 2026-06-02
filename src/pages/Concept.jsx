import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
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

/* Valeur pilier — rangée large */
function PillarRow({ id, title, desc, Icon, delay = 0 }) {
  const [ref, inView] = useReveal();
  return (
    <motion.div ref={ref}
      className="group flex items-start gap-6 sm:gap-12 py-8 sm:py-12 border-b"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      initial={{ opacity: 0, x: -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: EASE }}>

      {/* Numéro */}
      <span className="text-[10px] sm:text-xs uppercase tracking-[0.6em] font-black shrink-0 mt-1"
            style={{ color: 'rgba(255,255,255,0.25)' }}>{id}</span>

      {/* Titre + desc */}
      <div className="flex-1 min-w-0">
        <h3 className="font-black uppercase tracking-[-0.02em] text-white mb-3 transition-colors duration-300 group-hover:text-white/70"
            style={{ fontSize: 'clamp(1.4rem, 4vw, 3rem)', lineHeight: 1 }}>
          {title}
        </h3>
        <p className="text-sm sm:text-base leading-7 max-w-xl font-medium"
           style={{ color: 'rgba(244,239,234,0.50)' }}>{desc}</p>
      </div>

      {/* Icône */}
      <Icon className="w-6 h-5 shrink-0 mt-2 transition-all duration-300 text-white/15 group-hover:text-white/40 hidden sm:block" />
    </motion.div>
  );
}

const PILLARS = [
  { id: '01', title: 'Barbier indépendant', desc: 'Je travaille à mon compte. Je loue mon siège au 1 Rue de la Madeleine — tu réserves avec moi directement, pas avec un salon.', Icon: ScissorsIcon },
  { id: '02', title: 'À ton écoute',        desc: 'Je prends le temps de comprendre ce que tu veux avant de commencer. Pas de précipitation, juste un travail soigné.',          Icon: CombIcon     },
  { id: '03', title: 'Style sur mesure',    desc: 'Je fais des coupes actuelles adaptées à ta tête et ton style. Pas du copier-coller de tendances.',                            Icon: RazorIcon    },
];

export default function Concept() {
  /* Parallaxe scroll sur la photo hero */
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  return (
    <>
      {/* ══════════════════════ HERO ══════════════════════════ */}
      <section ref={heroRef}
        className="relative flex min-h-[85vh] flex-col justify-end overflow-hidden"
        style={{ background: '#5C4031' }}>

        {/* Photo avec parallaxe */}
        <motion.div className="absolute inset-0" style={{ y: photoY }}>
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920&q=80")',
              backgroundSize: 'cover', backgroundPosition: 'center top',
              filter: 'grayscale(30%) brightness(0.35)',
            }}
          />
        </motion.div>

        {/* Gradient bas */}
        <div className="absolute inset-0"
             style={{ background: 'linear-gradient(to top, #5C4031 0%, rgba(92,64,49,0.6) 50%, transparent 100%)' }} />

        {/* Lignes verticales déco */}
        <div className="absolute inset-0 pointer-events-none">
          {[20, 50, 80].map((pct, i) => (
            <motion.div key={i} className="absolute top-0 bottom-0 w-px"
              style={{ left: `${pct}%`, background: 'rgba(255,255,255,0.04)' }}
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ duration: 1.5, delay: i * 0.15, ease: EASE }} />
          ))}
        </div>

        {/* Contenu */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10 pb-16 sm:pb-20"
             style={{ paddingTop: 'var(--navbar-h, 72px)' }}>

          <motion.p
            className="text-[9px] uppercase tracking-[0.6em] font-bold mb-6"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}>
            Mon approche
          </motion.p>

          <div className="overflow-hidden">
            <motion.h1
              className="font-black uppercase leading-[0.88] tracking-[-0.04em] text-white"
              style={{ fontSize: 'clamp(4rem, 13vw, 11rem)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }}
              transition={{ duration: 1.0, delay: 0.4, ease: EASE }}>
              Le
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-10">
            <motion.h1
              className="font-black uppercase leading-[0.88] tracking-[-0.04em]"
              style={{ fontSize: 'clamp(4rem, 13vw, 11rem)', color: 'rgba(255,255,255,0.30)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }}
              transition={{ duration: 1.0, delay: 0.55, ease: EASE }}>
              Concept
            </motion.h1>
          </div>

          <motion.div
            className="max-w-lg border-l-2 border-white/20 pl-6"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}>
            <p className="text-base leading-8 font-medium" style={{ color: 'rgba(244,239,234,0.65)' }}>
              Je suis barbier indépendant. Je loue mon siège au cœur de Brie-Comte-Robert et je travaille à mon compte depuis 2018.
            </p>
          </motion.div>
        </div>
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
      <section style={{ background: '#405568' }} className="py-14 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <motion.div
            className="flex items-center gap-4 mb-12 pb-6 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="text-[9px] uppercase tracking-[0.55em] font-bold text-white/40">Mes valeurs</span>
            <span className="block h-px flex-1 bg-white/10" />
          </motion.div>

          {PILLARS.map((p, i) => (
            <PillarRow key={p.id} {...p} delay={i * 0.12} />
          ))}
        </div>
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
