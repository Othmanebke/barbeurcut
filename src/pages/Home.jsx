import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
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

/* ── Anneau pulsant carré ── */
function SquarePulse({ delay, size }) {
  return (
    <motion.div className="absolute pointer-events-none"
      style={{ width: size, height: size, top: '50%', left: '50%',
               marginTop: -size / 2, marginLeft: -size / 2,
               border: '1px solid rgba(255,255,255,0.06)' }}
      initial={{ scale: 0.2, opacity: 0.7 }}
      animate={{ scale: 3.2, opacity: 0 }}
      transition={{ duration: 5, delay, repeat: Infinity, ease: 'easeOut', repeatDelay: 0.3 }}
    />
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
  const heroRef = useRef(null);
  const mouseX  = useMotionValue(0.5);
  const mouseY  = useMotionValue(0.5);
  const spring  = { damping: 28, stiffness: 90 };
  const smoothX = useSpring(mouseX, spring);
  const smoothY = useSpring(mouseY, spring);
  const titleX  = useTransform(smoothX, [0, 1], [-22, 22]);
  const titleY  = useTransform(smoothY, [0, 1], [-12, 12]);
  const driftX  = useTransform(smoothX, [0, 1], [12, -12]);

  const onMouseMove = (e) => {
    const r = heroRef.current?.getBoundingClientRect();
    if (!r) return;
    mouseX.set((e.clientX - r.left) / r.width);
    mouseY.set((e.clientY - r.top)  / r.height);
  };

  return (
    <>
      {/* ═══════════════════ HERO ════════════════════════════ */}
      <section
        ref={heroRef}
        onMouseMove={onMouseMove}
        className="relative flex flex-col overflow-hidden select-none"
        style={{ minHeight: 'clamp(480px, 88vh, 1040px)', background: '#5C4031' }}
      >
        {/* ── Couche 1 : anneaux carrés pulsants ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          <SquarePulse delay={0}   size={200} />
          <SquarePulse delay={1.6} size={200} />
          <SquarePulse delay={3.2} size={200} />
        </div>

        {/* ── Couche 2 : texte fantôme défilant en fond ── */}
        <motion.div
          className="absolute bottom-24 left-0 right-0 pointer-events-none overflow-hidden"
          style={{ x: driftX }}
        >
          <motion.p
            className="whitespace-nowrap font-black uppercase leading-none"
            style={{ fontSize: 'clamp(5rem,18vw,14rem)', color: 'rgba(255,255,255,0.028)' }}
            animate={{ x: ['0%', '-33%'] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          >
            BARBERSHOP · WONDERCLUB · BRIE-COMTE-ROBERT · BARBERSHOP · WONDERCLUB · BRIE-COMTE-ROBERT ·
          </motion.p>
        </motion.div>

        {/* ── Couche 3 : lignes de grille qui s'étendent ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[12, 37, 63, 88].map((pct, i) => (
            <motion.div key={i} className="absolute top-0 bottom-0 w-px"
              style={{ left: `${pct}%`, background: 'rgba(255,255,255,0.04)' }}
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ duration: 1.5, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </div>

        {/* ── Couche 4 : ligne scanner ── */}
        <motion.div
          className="absolute left-0 right-0 z-20 pointer-events-none"
          style={{ height: 1, top: '50%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5) 50%, transparent)' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.0, times: [0, 0.35, 0.7, 1], delay: 0.05 }}
        />


        {/* ── Contenu principal (couche parallaxe) ── */}
        <motion.div
          className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 sm:px-10 text-center"
          style={{ paddingTop: 'var(--navbar-h, 72px)', x: titleX, y: titleY }}
        >
          {/* WONDER — tombe du haut */}
          <div className="overflow-hidden leading-none mb-0 mt-4 sm:mt-6">
            <motion.h1
              className="font-black uppercase tracking-[-0.04em] text-white"
              style={{ fontSize: 'clamp(2.8rem, 16vw, 14rem)', lineHeight: 0.92 }}
              initial={{ y: '-105%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              WONDER
            </motion.h1>
          </div>

          {/* CLUB — monte du bas */}
          <div className="overflow-hidden leading-none mb-5 sm:mb-6">
            <motion.h1
              className="font-black uppercase tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2.8rem, 16vw, 14rem)', lineHeight: 0.92, color: 'rgba(255,255,255,0.28)' }}
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              CLUB
            </motion.h1>
          </div>

          {/* Ligne centrale qui s'étend */}
          <motion.div className="flex items-center gap-4 mb-5 sm:mb-6">
            <motion.span className="block h-px bg-white/25"
              initial={{ width: 0 }} animate={{ width: '4rem' }}
              transition={{ delay: 1.4, duration: 0.9 }} />
            <motion.span
              initial={{ opacity: 0, rotate: -90, scale: 0 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{ delay: 1.7, duration: 0.5, ease: 'backOut' }}
              style={{ color: 'rgba(255,255,255,0.35)', fontSize: '1rem' }}>✦</motion.span>
            <motion.span className="block h-px bg-white/25"
              initial={{ width: 0 }} animate={{ width: '4rem' }}
              transition={{ delay: 1.4, duration: 0.9 }} />
          </motion.div>

          {/* Réseaux sociaux */}
          <motion.div
            className="flex items-center justify-center gap-5 mb-5 sm:mb-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.6 }}>
            <a href="https://www.instagram.com/teewdr/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ color: 'rgba(255,255,255,0.65)' }}>
              {/* Instagram SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="text-[9px] uppercase tracking-[0.4em] font-bold hidden sm:block">Instagram</span>
            </a>
            <span className="w-px h-4 bg-white/20" />
            <a href="https://www.tiktok.com/@s_wonderss" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ color: 'rgba(255,255,255,0.65)' }}>
              {/* TikTok SVG */}
              <svg width="18" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.89a8.27 8.27 0 004.84 1.55V7a4.85 4.85 0 01-1.07-.31z"/>
              </svg>
              <span className="text-[9px] uppercase tracking-[0.4em] font-bold hidden sm:block">TikTok</span>
            </a>
          </motion.div>

          {/* CTA avec glow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.95, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 sm:mb-6"
          >
            <motion.div
              whileHover={{ scale: 1.06, boxShadow: '0 0 60px rgba(255,255,255,0.18), 0 0 120px rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.96 }}
              className="inline-block"
            >
              <Link to="/prestations"
                className="inline-flex items-center gap-3 bg-white px-10 sm:px-14 py-4 sm:py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-colors duration-300 hover:bg-creamMid"
                style={{ color: '#5C4031' }}>
                <ScissorsIcon className="w-3.5 h-3.5" /> Réserver un créneau
              </Link>
            </motion.div>
          </motion.div>

          {/* Diplôme */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 2.1, duration: 0.8 }}
            className="text-[9px] uppercase tracking-[0.45em] font-bold"
            style={{ color: 'rgba(255,255,255,0.22)' }}>
            Diplôme BP · CMA Saint-Maur-des-Fossés
          </motion.p>
        </motion.div>

        {/* ── Stats bar ── */}
        <motion.div
          className="relative z-10 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(64,85,104,0.60)', backdropFilter: 'blur(12px)' }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.7 }}
        >
          <div className="mx-auto max-w-7xl grid grid-cols-3 divide-x px-4 sm:px-10"
               style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {[
              { target: 100, suffix: '%', label: 'Satisfaits' },
              { target: 8,   suffix: '+', label: "Ans d'exp."  },
              { fixed: 'BP',              label: 'Diplôme'     },
            ].map((s) => (
              <div key={s.label} className="py-5 sm:py-6 text-center">
                <p className="text-xl sm:text-3xl font-black text-white">
                  {s.fixed ?? <AnimatedCounter target={s.target} suffix={s.suffix} />}
                </p>
                <p className="mt-1 text-[8px] sm:text-[9px] uppercase tracking-[0.4em] font-bold"
                   style={{ color: 'rgba(244,239,234,0.35)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* fond clair → texte bleu */}
      <Marquee />

      {/* ══════════════════ SERVICES PREVIEW ══════════════════ */}
      <section style={{ background: '#405568' }} className="py-10 sm:py-16 lg:py-24">
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
      <Marquee brown reverse />

      {/* ══════════════════ COMMENT ÇA MARCHE ══════════════════ */}
      <section style={{ background: '#5C4031' }} className="py-10 sm:py-16 lg:py-24">
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
      <Marquee brown reverse />

      {/* ══════════════════ ABOUT TEASER ══════════════════════ */}
      <section style={{ background: '#405568' }} className="py-10 sm:py-16 lg:py-24">
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
