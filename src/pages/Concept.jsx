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
        className="relative flex flex-col overflow-hidden"
        style={{ minHeight: 'clamp(420px, 75vh, 920px)', background: '#5C4031', paddingTop: 'var(--navbar-h, 72px)' }}>

        {/* Lignes verticales déco */}
        <div className="absolute inset-0 pointer-events-none">
          {[25, 50, 75].map((pct, i) => (
            <motion.div key={i} className="absolute top-0 bottom-0 w-px"
              style={{ left: `${pct}%`, background: 'rgba(255,255,255,0.04)' }}
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ duration: 2, delay: i * 0.2, ease: EASE }} />
          ))}
        </div>

        {/* Centre — titre géant */}
        <div className="relative z-10 px-4 sm:px-8 py-10 sm:py-16 flex-1 flex flex-col justify-center">

          {/* LE — glisse depuis la gauche */}
          <div className="overflow-hidden">
            <motion.h1
              className="font-black uppercase leading-[0.85] tracking-[-0.05em] text-white"
              style={{ fontSize: 'clamp(3.5rem, 22vw, 20rem)' }}
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
              style={{ fontSize: 'clamp(2.5rem, 16vw, 14rem)', color: 'rgba(255,255,255,0.22)' }}
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

      </section>

      {/* ══════════════════ QUI JE SUIS ══════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: '#F4EFEA' }}>

        {/* SM initiales en fond */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none select-none overflow-hidden">
          <span className="font-black leading-none tracking-[-0.08em]"
                style={{ fontSize: 'clamp(14rem, 40vw, 32rem)', color: 'rgba(64,85,104,0.05)' }}>
            SM
          </span>
        </div>

        {/* Nom pleine largeur en haut */}
        <div className="relative z-10 border-b overflow-hidden" style={{ borderColor: 'rgba(64,85,104,0.12)' }}>
          <div className="px-6 sm:px-10 pt-12 pb-8">
            <motion.p className="text-[9px] uppercase tracking-[0.6em] font-bold mb-4"
              style={{ color: 'rgba(64,85,104,0.50)' }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}>
              Qui je suis
            </motion.p>
            <div className="overflow-hidden">
              <motion.h2 className="font-black uppercase leading-[0.85] tracking-[-0.04em]"
                style={{ fontSize: 'clamp(3rem, 11vw, 9rem)', color: '#5C4031' }}
                initial={{ y: '100%' }} whileInView={{ y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE }}>
                Steevy
              </motion.h2>
            </div>
            <div className="overflow-hidden">
              <motion.h2 className="font-black uppercase leading-[0.85] tracking-[-0.04em]"
                style={{ fontSize: 'clamp(3rem, 11vw, 9rem)', color: 'rgba(64,85,104,0.40)' }}
                initial={{ y: '100%' }} whileInView={{ y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.1, ease: EASE }}>
                Manche
              </motion.h2>
            </div>
          </div>
        </div>

        {/* Corps — deux colonnes */}
        <div className="relative z-10 grid lg:grid-cols-[1fr_1.4fr]">

          {/* Gauche — stats + rôle */}
          <motion.div
            className="border-b lg:border-b-0 lg:border-r px-6 sm:px-10 py-10 sm:py-14 flex flex-col justify-between gap-10"
            style={{ borderColor: 'rgba(64,85,104,0.12)' }}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}>

            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'rgba(92,64,49,0.60)' }}>
                Barbier indépendant
              </p>
              <p className="text-[9px] uppercase tracking-[0.5em] font-bold" style={{ color: 'rgba(64,85,104,0.45)' }}>
                Wonderclub · Brie-Comte-Robert
              </p>
            </div>

            <div className="space-y-6">
              {[
                { val: '8+',      label: "Ans d'expérience" },
                { val: '100%',    label: 'Clients satisfaits' },
                { val: 'Mer–Sam', label: '10h00 → 19h30' },
              ].map((s, i) => (
                <motion.div key={s.val}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}>
                  <p className="font-black leading-none tracking-[-0.04em]"
                     style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#405568' }}>
                    {s.val}
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.45em] font-bold mt-1"
                     style={{ color: 'rgba(64,85,104,0.50)' }}>
                    {s.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Droite — bio + timeline + CTA */}
          <motion.div
            className="px-6 sm:px-10 py-10 sm:py-14 flex flex-col gap-10"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}>

            <p className="text-sm sm:text-base leading-8 font-medium max-w-lg"
               style={{ color: 'rgba(92,64,49,0.65)' }}>
              Barbier indépendant depuis 2017. J'ai décroché mon CAP puis mon BP Coiffure à la CMA de Saint-Maur-des-Fossés. Aujourd'hui je loue mon siège et je travaille à mon compte pour donner le meilleur à chaque client, sans contrainte.
            </p>

            {/* Timeline diplômes */}
            <div className="space-y-5">
              <p className="text-[9px] uppercase tracking-[0.6em] font-bold"
                 style={{ color: 'rgba(64,85,104,0.40)' }}>Parcours</p>
              {[
                { year: '2018', label: 'Lancement Wonderclub', sub: 'Artisan indépendant · Brie-Comte-Robert' },
                { year: '2019', label: 'CAP Coiffure',         sub: 'CMA Saint-Maur-des-Fossés' },
                { year: '2021', label: 'BP Coiffure',          sub: 'CMA Saint-Maur-des-Fossés', active: true },
              ].map((step, i) => (
                <motion.div key={i} className="flex items-start gap-5"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.12 }}>
                  <div className="flex flex-col items-center shrink-0 mt-1.5">
                    <div className="w-2 h-2 rounded-full"
                         style={{ background: step.active ? '#405568' : 'rgba(64,85,104,0.30)' }} />
                    {i < 2 && (
                      <motion.div className="w-px mt-1"
                        style={{ background: 'rgba(64,85,104,0.15)', height: '32px' }}
                        initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className="text-[9px] font-black uppercase tracking-[0.4em]"
                            style={{ color: step.active ? 'rgba(64,85,104,0.70)' : 'rgba(64,85,104,0.35)' }}>
                        {step.year}
                      </span>
                      <span className="h-px w-6" style={{ background: 'rgba(64,85,104,0.15)' }} />
                    </div>
                    <p className="text-sm font-black" style={{ color: '#5C4031' }}>{step.label}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(64,85,104,0.50)' }}>{step.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block self-start">
              <Link to="/reservation"
                className="inline-flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-[0.4em] transition-colors duration-300 hover:opacity-80"
                style={{ background: '#5C4031', color: '#F4EFEA' }}>
                <ScissorsIcon className="w-3.5 h-3.5" />
                Prendre rendez-vous
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Marquee brown />

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

      <Marquee brown reverse />

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

      <Marquee />

      {/* ══════════════════ ADRESSE ════════════════════════ */}
      <section style={{ background: '#FFFFFF' }} className="py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE }}>

              <p className="text-[9px] uppercase tracking-[0.6em] font-bold mb-6"
                 style={{ color: 'rgba(64,85,104,0.50)' }}>Nous trouver</p>

              <h2 className="font-black uppercase tracking-[-0.03em] mb-2"
                  style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.1, color: '#5C4031' }}>
                1 Rue de la Madeleine
              </h2>
              <p className="font-bold text-xl mb-10" style={{ color: 'rgba(64,85,104,0.55)' }}>
                77170 Brie-Comte-Robert
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { icon: '✂', label: 'Ouvert',   val: 'Mercredi → Samedi' },
                  { icon: '◷', label: 'Horaires', val: '10h00 – 19h30' },
                  { icon: '✕', label: 'Fermé',    val: 'Lundi, Mardi, Dimanche' },
                  { icon: '◈', label: 'Paiement', val: 'Espèces ou chèque' },
                ].map((row, i) => (
                  <motion.div key={i}
                    className="flex items-center gap-5 pb-4 border-b"
                    style={{ borderColor: 'rgba(64,85,104,0.10)' }}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}>
                    <span className="text-sm w-4 shrink-0" style={{ color: 'rgba(64,85,104,0.30)' }}>{row.icon}</span>
                    <span className="text-[9px] uppercase tracking-[0.4em] font-bold w-20 shrink-0"
                          style={{ color: 'rgba(64,85,104,0.45)' }}>{row.label}</span>
                    <span className="text-sm font-bold" style={{ color: '#405568' }}>{row.val}</span>
                  </motion.div>
                ))}
              </div>

              <a href="https://www.google.com/maps/search/?api=1&query=1+Rue+de+la+Madeleine+77170+Brie-Comte-Robert"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-[0.35em] transition-colors hover:opacity-80"
                style={{ background: '#5C4031', color: '#F4EFEA' }}>
                Voir sur Google Maps →
              </a>
            </motion.div>

            {/* Carte */}
            <motion.div
              className="overflow-hidden h-80 lg:h-[500px] border"
              style={{ borderColor: 'rgba(64,85,104,0.15)' }}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE }}>
              <iframe
                title="Wonderclub — 1 Rue de la Madeleine, Brie-Comte-Robert"
                src="https://maps.google.com/maps?q=1+Rue+de+la+Madeleine,+77170+Brie-Comte-Robert,+France&hl=fr&z=16&output=embed"
                width="100%" height="100%" style={{ border: 0 }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
