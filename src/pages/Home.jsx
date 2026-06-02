import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import RevealText from '../components/RevealText';
import Marquee from '../components/Marquee';
import { ScissorsIcon, RazorIcon, CombIcon, BrushIcon } from '../components/BarberIcons';

/* ── Presets ── */
const fadeUp = {
  hidden: { opacity: 0, y: 44 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
};

function AnimatedCounter({ target, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let frame;
    const start = performance.now();
    const animate = (now) => {
      const t = Math.min((now - start) / 1400, 1);
      setCount(Math.floor((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) frame = requestAnimationFrame(animate);
      else setCount(target);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function Section({ children, className = '', style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className} style={style}>
      {children}
    </motion.div>
  );
}

function Eyebrow({ children, Icon = ScissorsIcon }) {
  return (
    <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
      <Icon className="w-4 h-4 shrink-0 text-brand" />
      <span className="text-[9px] uppercase tracking-[0.55em] font-bold text-brand">{children}</span>
    </motion.div>
  );
}

/* ── Lettre animée pour le titre hero ── */
function AnimChar({ char, delay }) {
  return (
    <div className="overflow-hidden inline-block">
      <motion.span
        className="inline-block"
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {char === ' ' ? ' ' : char}
      </motion.span>
    </div>
  );
}

const SERVICES = [
  { id: '01', title: 'Coupe',         desc: 'Consultation, lavage, coupe ciseaux ou tondeuse, finition au rasoir.', price: '20€', duration: '25 min', Icon: ScissorsIcon },
  { id: '02', title: 'Coupe + Barbe', desc: 'Coupe + taille et mise en forme de la barbe, contours dessinés au rasoir.', price: '30€', duration: '30 min', Icon: RazorIcon },
  { id: '03', title: 'Taille barbe',  desc: 'Peignage, taille à la longueur voulue, contours définis au rasoir.', price: '13€', duration: '15 min', Icon: CombIcon },
];

const STEPS = [
  { num: '01', title: 'Choisis ta prestation',  desc: 'Parcours mes services et sélectionne ce qui te correspond.', Icon: ScissorsIcon },
  { num: '02', title: 'Réserve ton créneau',    desc: 'Prends un horaire en quelques clics, le calendrier s\'adapte à la durée.', Icon: CombIcon },
  { num: '03', title: 'Confirmation immédiate', desc: 'Tu reçois une confirmation par email et SMS tout de suite.', Icon: BrushIcon },
];

/* ═══════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <>
      {/* ════════════════════ HERO ANIMÉ ════════════════════════ */}
      <section
        className="relative flex flex-col overflow-hidden"
        style={{ minHeight: 'clamp(560px, 92vh, 1000px)', background: '#5C4031' }}
      >
        {/* Grille déco animée en fond */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Lignes verticales */}
          {[15, 35, 65, 85].map((pct, i) => (
            <motion.div key={i}
              className="absolute top-0 bottom-0 w-px"
              style={{ left: `${pct}%`, background: 'rgba(255,255,255,0.04)' }}
              initial={{ scaleY: 0, originY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.2, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
          {/* Lignes horizontales */}
          {[25, 75].map((pct, i) => (
            <motion.div key={i}
              className="absolute left-0 right-0 h-px"
              style={{ top: `${pct}%`, background: 'rgba(255,255,255,0.04)' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.4, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
          {/* WC watermark */}
          <motion.p
            className="absolute inset-0 flex items-center justify-center font-black uppercase leading-none tracking-[-0.05em] select-none"
            style={{ fontSize: 'clamp(12rem, 40vw, 36rem)', color: 'rgba(255,255,255,0.03)' }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
          >
            WC
          </motion.p>
        </div>

        {/* Ligne scan horizontale */}
        <motion.div
          className="absolute left-0 right-0 h-[1px] z-20 pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.25)', top: '50%' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: [0, 1, 1, 0] }}
          transition={{ duration: 1.2, times: [0, 0.4, 0.8, 1], delay: 0.1, ease: 'easeInOut' }}
        />

        {/* Coin déco haut-droit */}
        <motion.div
          className="absolute top-20 right-10 hidden lg:block pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
          <div className="w-16 h-16 border border-white/10 flex items-center justify-center">
            <ScissorsIcon className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.15)' }} />
          </div>
        </motion.div>

        {/* Contenu centré */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 sm:px-10 text-center"
             style={{ paddingTop: 'var(--navbar-h, 72px)' }}>

          {/* Badge */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-10"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}>
            <motion.span className="block h-px w-12 sm:w-20 bg-white/25"
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 1.0 }} />
            <span className="text-[9px] uppercase tracking-[0.6em] font-bold" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Barbier indépendant · Brie-Comte-Robert
            </span>
            <motion.span className="block h-px w-12 sm:w-20 bg-white/25"
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 1.0 }} />
          </motion.div>

          {/* WONDER — lettres qui montent */}
          <div className="mb-1 sm:mb-2">
            <h1 className="font-black uppercase leading-[0.88] tracking-[-0.04em] text-white"
                style={{ fontSize: 'clamp(4rem, 15vw, 13rem)' }}>
              {'WONDER'.split('').map((c, i) => (
                <AnimChar key={i} char={c} delay={0.35 + i * 0.07} />
              ))}
            </h1>
          </div>

          {/* CLUB — légèrement décalé, couleur différente */}
          <div className="mb-8 sm:mb-10">
            <h1 className="font-black uppercase leading-[0.88] tracking-[-0.02em]"
                style={{ fontSize: 'clamp(4rem, 15vw, 13rem)', color: 'rgba(255,255,255,0.40)' }}>
              {'CLUB'.split('').map((c, i) => (
                <AnimChar key={i} char={c} delay={0.72 + i * 0.07} />
              ))}
            </h1>
          </div>

          {/* Séparateur animé */}
          <motion.div
            className="flex items-center justify-center gap-5 mb-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
            <motion.span className="block h-px bg-white/30"
              initial={{ width: 0 }} animate={{ width: '4rem' }}
              transition={{ duration: 0.8, delay: 1.3, ease: [0.22, 1, 0.36, 1] }} />
            <motion.span
              initial={{ opacity: 0, scale: 0, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 1.6, ease: 'backOut' }}
              style={{ color: 'rgba(255,255,255,0.40)', fontSize: '0.85rem' }}>✦</motion.span>
            <motion.span className="block h-px bg-white/30"
              initial={{ width: 0 }} animate={{ width: '4rem' }}
              transition={{ duration: 0.8, delay: 1.3, ease: [0.22, 1, 0.36, 1] }} />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 1.7, ease: [0.34, 1.56, 0.64, 1] }}
            className="mb-10">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link to="/prestations"
                className="inline-flex items-center gap-3 bg-white px-10 sm:px-14 py-4 sm:py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-300 hover:bg-cream hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                style={{ color: '#5C4031' }}>
                <ScissorsIcon className="w-3.5 h-3.5" /> Réserver un créneau
              </Link>
            </motion.div>
          </motion.div>

          {/* Diplôme */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }}
            className="text-[9px] uppercase tracking-[0.45em] font-bold"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            Diplôme BP · CMA Saint-Maur-des-Fossés
          </motion.p>
        </div>

        {/* Stats bar */}
        <motion.div
          className="relative z-10 border-t border-white/8"
          style={{ background: 'rgba(64,85,104,0.55)', backdropFilter: 'blur(10px)' }}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 2.1 }}>
          <div className="mx-auto max-w-7xl grid grid-cols-3 divide-x divide-white/10 px-4 sm:px-10">
            {[
              { target: 100, suffix: '%', label: 'Satisfaits' },
              { target: 8,   suffix: '+', label: "Ans d'exp."  },
              { fixed: 'BP',              label: 'Diplôme'     },
            ].map((s) => (
              <div key={s.label} className="py-4 sm:py-5 text-center">
                <p className="text-lg sm:text-2xl font-black text-white">
                  {s.fixed ?? <AnimatedCounter target={s.target} suffix={s.suffix} />}
                </p>
                <p className="mt-0.5 text-[8px] sm:text-[9px] uppercase tracking-[0.35em] font-medium"
                   style={{ color: 'rgba(244,239,234,0.40)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* fond clair → texte bleu */}
      <Marquee light />

      {/* ══════════════════ SERVICES PREVIEW ══════════════════ */}
      <section style={{ background: '#405568' }} className="py-14 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Section>
            <div className="flex items-end justify-between pb-6 sm:pb-8 border-b mb-2"
                 style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
              <div>
                <Eyebrow Icon={RazorIcon}>Mes prestations</Eyebrow>
                <RevealText tag="h2" className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] text-white leading-tight mt-2">
                  Services
                </RevealText>
              </div>
              <Link to="/prestations"
                className="hidden lg:inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.35em] font-bold transition-colors"
                style={{ color: 'rgba(244,239,234,0.40)' }}
                onMouseEnter={e => e.currentTarget.style.color='#FFFFFF'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(244,239,234,0.40)'}>
                Voir tout <span className="block h-px w-8 bg-current" />
              </Link>
            </div>

            <motion.div variants={stagger} className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {SERVICES.map((s) => (
                <motion.div key={s.id} variants={fadeUp}
                  className="grid grid-cols-[32px_1fr_auto] sm:grid-cols-[48px_1fr_auto] items-center gap-3 sm:gap-8 py-6 sm:py-8 group cursor-default transition-all duration-300 px-4 -mx-4"
                  style={{}}
                  whileHover={{ backgroundColor: 'rgba(92,64,49,0.5)', paddingLeft: '2rem', paddingRight: '2rem' }}>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.55em] text-brand/70 font-bold">{s.id}</span>
                  <div>
                    <h3 className="text-base sm:text-xl lg:text-2xl font-black uppercase tracking-[-0.02em] text-white transition-colors duration-300 leading-tight group-hover:text-brand">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-medium leading-6"
                       style={{ color: 'rgba(244,239,234,0.50)' }}>{s.desc}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-base sm:text-xl font-black transition-colors duration-300 text-white/25 group-hover:text-white">{s.price}</span>
                    <span className="text-[8px] font-bold" style={{ color: 'rgba(244,239,234,0.35)' }}>{s.duration}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-5 lg:hidden">
              <Link to="/prestations"
                className="inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.35em] font-bold transition-colors text-white/40 hover:text-white">
                Voir tout <span className="block h-px w-8 bg-current" />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* fond sombre → texte blanc */}
      <Marquee reverse />

      {/* ══════════════════ COMMENT ÇA MARCHE ══════════════════ */}
      <section style={{ background: '#5C4031' }} className="py-14 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-10 sm:mb-16">
              <Eyebrow>Simple et rapide</Eyebrow>
              <RevealText tag="h2" className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] text-white leading-tight">
                Comment ça marche
              </RevealText>
              <motion.p variants={fadeUp} className="mt-4 sm:mt-5 max-w-md mx-auto text-sm leading-7 sm:leading-8 font-medium"
                        style={{ color: 'rgba(244,239,234,0.50)' }}>
                Prends un créneau en quelques clics et tu reçois ta confirmation par email et SMS de suite.
              </motion.p>
            </motion.div>

            <motion.div variants={stagger} className="grid gap-px sm:grid-cols-3"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
              {STEPS.map((step) => (
                <motion.div key={step.num} variants={fadeUp}
                  className="p-6 sm:p-8 lg:p-10 flex flex-col gap-5 sm:gap-6 group cursor-default transition-colors duration-500"
                  style={{ background: '#5C4031' }}
                  whileHover={{ backgroundColor: '#405568' }}>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center bg-white text-[9px] font-black tracking-widest shrink-0 transition-colors duration-500 group-hover:bg-white/90"
                          style={{ color: '#5C4031' }}>{step.num}</span>
                    <step.Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-500 text-white/20 group-hover:text-white/40" />
                    <span className="block h-px flex-1 transition-colors duration-500 bg-white/10 group-hover:bg-white/20" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-[-0.01em] text-white transition-colors duration-500">{step.title}</h3>
                    <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-6 sm:leading-7 font-medium transition-colors duration-500"
                       style={{ color: 'rgba(244,239,234,0.45)' }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 sm:mt-10 text-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Link to="/prestations"
                  className="inline-flex items-center gap-3 bg-white px-8 sm:px-10 py-3.5 sm:py-4 text-[10px] font-black uppercase tracking-[0.35em] transition-all duration-300 hover:bg-creamMid"
                  style={{ color: '#5C4031' }}>
                  <ScissorsIcon className="w-3.5 h-3.5" /> Commencer
                </Link>
              </motion.div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* fond denim → texte blanc */}
      <Marquee dark reverse />

      {/* ══════════════════ ABOUT TEASER ══════════════════════ */}
      <section style={{ background: '#405568' }} className="py-14 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Section className="grid gap-10 sm:gap-16 lg:grid-cols-2 lg:items-center">
            <motion.div variants={fadeUp}>
              <Eyebrow Icon={CombIcon}>Mon approche</Eyebrow>
              <RevealText tag="h2" className="text-[clamp(2.2rem,5vw,4rem)] font-black uppercase tracking-[-0.04em] text-white leading-[0.93] mt-2">
                Précision. Style. Indépendance.
              </RevealText>
              <p className="mt-6 sm:mt-8 text-sm sm:text-base leading-7 sm:leading-8 max-w-sm font-medium"
                 style={{ color: 'rgba(244,239,234,0.60)' }}>
                Je suis barbier indépendant et je loue mon siège au 1 Rue de la Madeleine. Quand tu réserves ici tu réserves avec moi directement. Je fais ça avec passion depuis 2018.
              </p>
              <Link to="/concept"
                className="mt-8 sm:mt-10 inline-flex items-center gap-3 sm:gap-4 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:text-brand transition-colors group">
                Découvrir le concept
                <span className="block h-px w-10 bg-white/30 transition-all duration-300 group-hover:w-16 group-hover:bg-white" />
              </Link>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { bg: '#5C4031', val: '100%', label: 'Clients satisfaits', sub: 'Clients', hoverBg: '#4A3225' },
                { bg: '#FFFFFF', val: '8+',   label: 'Ans depuis 2018',    sub: 'Expérience', dark: true, hoverBg: '#E8E0D8' },
              ].map((c) => (
                <motion.div key={c.val} variants={fadeUp}
                  className="p-5 sm:p-7 aspect-square flex flex-col justify-between cursor-default transition-colors duration-300"
                  style={{ background: c.bg }}
                  whileHover={{ backgroundColor: c.hoverBg }}>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.5em] font-bold"
                        style={{ color: c.dark ? 'rgba(74,47,26,0.55)' : 'rgba(255,255,255,0.40)' }}>{c.sub}</span>
                  <div>
                    <p className="text-4xl sm:text-5xl font-black"
                       style={{ color: c.dark ? '#5C4031' : '#FFFFFF' }}>{c.val}</p>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium"
                       style={{ color: c.dark ? 'rgba(74,47,26,0.45)' : 'rgba(244,239,234,0.40)' }}>{c.label}</p>
                  </div>
                </motion.div>
              ))}
              <motion.div variants={fadeUp}
                className="col-span-2 p-5 sm:p-7 flex items-center justify-between border transition-colors duration-300 cursor-default"
                style={{ background: '#5C4031', borderColor: 'rgba(255,255,255,0.10)' }}
                whileHover={{ backgroundColor: '#4A3225', borderColor: 'rgba(255,255,255,0.20)' }}>
                <div>
                  <p className="text-base sm:text-xl font-black text-white">Diplôme BP · Certifié</p>
                  <p className="mt-0.5 text-xs sm:text-sm font-medium"
                     style={{ color: 'rgba(244,239,234,0.40)' }}>1 Rue de la Madeleine, 77170</p>
                </div>
                <div className="flex gap-0.5 sm:gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <motion.span key={i}
                      initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, duration: 0.3, ease: 'backOut' }} viewport={{ once: true }}
                      className="text-white text-lg sm:text-xl">★</motion.span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </Section>
        </div>
      </section>

      <Marquee />

      {/* ══════════════════ CTA FINAL — DESIGN DISTINCT ════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: '#F4EFEA' }}
      >
        {/* Fond déco — grand texte fantôme */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
          <p className="font-black uppercase leading-none tracking-[-0.05em] whitespace-nowrap"
             style={{ fontSize: 'clamp(6rem, 20vw, 18rem)', color: 'rgba(64,85,104,0.06)' }}>
            RÉSERVER
          </p>
        </div>

        {/* Frame déco */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 sm:px-10 py-20 sm:py-28 lg:py-36">
          <div className="border border-denim/20 p-8 sm:p-14 lg:p-20 text-center relative">

            {/* Coins décoratifs */}
            {[
              'absolute -top-[1px] -left-[1px] w-6 h-6 border-t-2 border-l-2 border-denim/50',
              'absolute -top-[1px] -right-[1px] w-6 h-6 border-t-2 border-r-2 border-denim/50',
              'absolute -bottom-[1px] -left-[1px] w-6 h-6 border-b-2 border-l-2 border-denim/50',
              'absolute -bottom-[1px] -right-[1px] w-6 h-6 border-b-2 border-r-2 border-denim/50',
            ].map((cls, i) => <div key={i} className={cls} />)}

            <Section>
              <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-6">
                <ScissorsIcon className="w-4 h-4" style={{ color: '#405568' }} />
                <span className="text-[9px] uppercase tracking-[0.55em] font-bold" style={{ color: '#405568' }}>
                  Prêt à transformer ton style ?
                </span>
                <ScissorsIcon className="w-4 h-4" style={{ color: '#405568' }} />
              </motion.div>

              <RevealText tag="h2"
                className="font-black uppercase tracking-[-0.04em] leading-tight mb-6"
                style={{ fontSize: 'clamp(2rem,5vw,4.5rem)', color: '#5C4031' }}>
                Réserve ton créneau.
              </RevealText>

              <motion.p variants={fadeUp}
                className="max-w-sm mx-auto text-sm sm:text-base font-medium mb-10 leading-7"
                style={{ color: 'rgba(92,64,49,0.60)' }}>
                Choisis ta prestation, prends l'horaire qui t'arrange et confirme en quelques secondes.
              </motion.p>

              <motion.div variants={fadeUp}>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
                  <Link to="/prestations"
                    className="inline-flex items-center gap-3 px-10 sm:px-14 py-4 sm:py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-300"
                    style={{ background: '#5C4031', color: '#FFFFFF' }}
                    onMouseEnter={e => e.currentTarget.style.background='#405568'}
                    onMouseLeave={e => e.currentTarget.style.background='#5C4031'}>
                    <ScissorsIcon className="w-3.5 h-3.5" /> Voir les services
                  </Link>
                </motion.div>
              </motion.div>

              <motion.p variants={fadeUp}
                className="mt-8 text-[9px] uppercase tracking-[0.45em] font-bold"
                style={{ color: 'rgba(92,64,49,0.30)' }}>
                Paiement sur place · Espèces ou chèque uniquement
              </motion.p>
            </Section>
          </div>
        </div>
      </section>
    </>
  );
}
