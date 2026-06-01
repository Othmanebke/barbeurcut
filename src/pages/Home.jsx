import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import RevealText from '../components/RevealText';
import Marquee from '../components/Marquee';
import { ScissorsIcon, RazorIcon, CombIcon, BrushIcon, DiamondDivider } from '../components/BarberIcons';

/* ── Animation presets ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 44 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
};

/* ── ScrambleText ──────────────────────────────────────────── */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!$&*';
function useScramble(text, active, duration = 900) {
  const [display, setDisplay] = useState(text.replace(/[^\s]/g, '_'));
  const raf = useRef(null);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const settled = Math.floor(progress * text.length);
      setDisplay(text.split('').map((ch, i) => {
        if (ch === ' ') return ' ';
        if (i < settled) return ch;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join(''));
      if (progress < 1) raf.current = requestAnimationFrame(step);
      else setDisplay(text);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [active, text, duration]);
  return display;
}

/* ── AnimatedCounter ───────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let frame;
    const start = performance.now();
    const dur = 1400;
    const animate = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCount(Math.floor(ease * target));
      if (t < 1) frame = requestAnimationFrame(animate);
      else setCount(target);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Section scroll reveal ─────────────────────────────────── */
function Section({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

/* ── Eyebrow ───────────────────────────────────────────────── */
function Eyebrow({ children, Icon = ScissorsIcon }) {
  return (
    <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
      <Icon className="w-4 h-4 shrink-0 text-brand" />
      <span className="text-[9px] uppercase tracking-[0.55em] font-bold text-brand">{children}</span>
    </motion.div>
  );
}

/* ── Data ──────────────────────────────────────────────────── */
const SERVICES = [
  { id: '01', title: 'Coupe homme',    desc: 'Consultation, lavage, coupe ciseaux ou tondeuse, finition au rasoir.', price: '20€', Icon: ScissorsIcon },
  { id: '02', title: 'Coupe + Barbe',  desc: 'Coupe homme + taille et mise en forme de la barbe au rasoir.',         price: '30€', Icon: RazorIcon   },
  { id: '03', title: 'Coupe + Rasage', desc: 'Mousse chaude, rasage au coupe-chou, compresse froide.',               price: '35€', Icon: CombIcon    },
];

const STEPS = [
  { num: '01', title: 'Choisis ta coupe',       desc: 'Parcours mes prestations et prends ce qui te correspond.', Icon: ScissorsIcon },
  { num: '02', title: 'Réserve ton créneau',    desc: 'Prends un horaire en quelques clics depuis ton téléphone.', Icon: CombIcon     },
  { num: '03', title: 'Reçois la confirmation', desc: "Tu reçois un email avec tous les détails de suite.", Icon: BrushIcon },
];


/* ══════════════════════════════════════════════════════════ */
export default function Home() {
  const [scrambleActive, setScrambleActive] = useState(false);
  useEffect(() => { const t = setTimeout(() => setScrambleActive(true), 700); return () => clearTimeout(t); }, []);
  const scrambled = useScramble('COUPE PARFAITE.', scrambleActive, 1100);

  return (
    <>
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section
        className="relative flex flex-col overflow-hidden grain"
        style={{
          minHeight: 'clamp(520px, 82vh, 900px)',
          backgroundImage:
            'linear-gradient(to bottom, rgba(74,47,26,0.75) 0%, rgba(74,47,26,0.48) 45%, rgba(74,47,26,0.92) 100%),' +
            'url("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920&q=80")',
          backgroundSize: 'cover', backgroundPosition: 'center top',
        }}
      >
        <div className="relative z-10 flex flex-1 items-center px-6 sm:px-10" style={{ paddingTop: 'var(--navbar-h, 72px)' }}>
          <div className="mx-auto w-full max-w-7xl py-8 sm:py-12 lg:py-16">
            <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-5xl">

              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5 sm:mb-7">
                <ScissorsIcon className="w-4 h-4 text-brand" />
                <span className="block h-px w-8 bg-brand" />
                <span className="text-[9px] uppercase tracking-[0.5em] sm:tracking-[0.6em] text-brand font-bold">
                  Wonder Cut — Barbershop
                </span>
              </motion.div>

              <div className="overflow-mask">
                <motion.p variants={fadeUp} className="text-[clamp(2.2rem,6vw,5.5rem)] font-black uppercase tracking-[-0.03em] text-cream leading-[0.9] mb-2">
                  L'art de la
                </motion.p>
              </div>
              <div className="overflow-mask mb-5 sm:mb-7">
                <motion.p variants={fadeUp} className="text-[clamp(2.2rem,6vw,5.5rem)] font-black uppercase tracking-[-0.03em] leading-[0.9] scramble-mono shimmer-gold" aria-label="coupe parfaite.">
                  {scrambled}
                </motion.p>
              </div>

              <motion.p variants={fadeUp} className="max-w-lg text-sm sm:text-base leading-7 sm:leading-8 text-cream/65 font-medium">
                Je coupe et je soigne la barbe depuis 2018. Prends ton créneau en ligne et reçois ta confirmation par email tout de suite.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 sm:mt-12 flex flex-wrap gap-3 sm:gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/prestations" className="inline-flex items-center gap-2 sm:gap-3 bg-brand px-6 sm:px-9 py-3.5 sm:py-4 text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.35em] text-dark hover:bg-brandDark transition-colors">
                    <ScissorsIcon className="w-3.5 h-3.5" /> Réserver
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/concept" className="inline-flex items-center justify-center border border-cream/30 px-6 sm:px-9 py-3.5 sm:py-4 text-[10px] font-semibold uppercase tracking-[0.3em] sm:tracking-[0.35em] text-cream hover:border-cream/65 transition-all">
                    Concept
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-12 hidden lg:flex items-center gap-4">
                <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} className="block w-px h-10 bg-gradient-to-b from-brand to-transparent" />
                <span className="text-[9px] uppercase tracking-[0.5em] text-cream/35 font-medium">Scroll</span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 border-t border-cream/10 bg-dark/65 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl grid grid-cols-3 divide-x divide-cream/10 px-4 sm:px-10">
            {[
              { target: 100, suffix: '%', label: 'Satisfaits' },
              { target: 8,   suffix: '+', label: "Ans d'exp." },
              { fixed: 'CAP',             label: 'Coiffure' },
            ].map((s) => (
              <div key={s.label} className="py-4 sm:py-5 text-center">
                <p className="text-lg sm:text-2xl font-black text-cream">
                  {s.fixed ?? <AnimatedCounter target={s.target} suffix={s.suffix} />}
                </p>
                <p className="mt-0.5 text-[8px] sm:text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.35em] text-cream/45 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Marquee />

      {/* ═══════════════════ SERVICES PREVIEW ══════════════════ */}
      <section className="bg-cream py-14 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Section>
            <div className="flex items-end justify-between pb-6 sm:pb-8 border-b border-beige mb-2">
              <div>
                <Eyebrow Icon={RazorIcon}>Nos prestations</Eyebrow>
                <RevealText tag="h2" className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] text-dark leading-tight mt-2">
                  Services
                </RevealText>
              </div>
              <Link to="/prestations" className="hidden lg:inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.35em] text-muted hover:text-brand font-bold transition-colors">
                Voir tout <span className="block h-px w-8 bg-current" />
              </Link>
            </div>

            <motion.div variants={stagger} className="divide-y divide-beige/60">
              {SERVICES.map((s) => (
                <motion.div key={s.id} variants={fadeUp} className="grid grid-cols-[32px_1fr_auto] sm:grid-cols-[48px_1fr_auto] items-center gap-3 sm:gap-8 py-6 sm:py-8 group cursor-default">
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.4em] sm:tracking-[0.55em] text-brand/70 font-bold">{s.id}</span>
                  <div>
                    <h3 className="text-base sm:text-xl lg:text-2xl font-black uppercase tracking-[-0.02em] text-dark group-hover:text-brand transition-colors duration-300 leading-tight">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-muted font-medium leading-5 sm:leading-7">{s.desc}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 sm:gap-2">
                    <span className="text-base sm:text-xl font-black text-dark/20 group-hover:text-brand transition-colors duration-300">{s.price}</span>
                    <s.Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-dark/15 group-hover:text-brand/60 transition-colors duration-300 shrink-0" />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-5 lg:hidden">
              <Link to="/prestations" className="inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.35em] text-muted hover:text-brand font-bold transition-colors">
                Voir tout <span className="block h-px w-8 bg-current" />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      <Marquee reverse />

      {/* ═══════════════ COMMENT ÇA MARCHE ═════════════════════ */}
      <section className="bg-cream py-14 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-10 sm:mb-16">
              <Eyebrow>Simple & rapide</Eyebrow>
              <RevealText tag="h2" className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] text-dark leading-tight">
                Comment ça marche
              </RevealText>
              <motion.p variants={fadeUp} className="mt-4 sm:mt-5 max-w-md mx-auto text-sm leading-7 sm:leading-8 text-muted font-medium">
                Prends un créneau en quelques clics et tu reçois ta confirmation par email de suite.
              </motion.p>
            </motion.div>

            <motion.div variants={stagger} className="grid gap-px bg-beige/40 sm:grid-cols-3">
              {STEPS.map((step) => (
                <motion.div key={step.num} variants={fadeUp}
                  className="bg-cream p-6 sm:p-8 lg:p-10 flex flex-col gap-5 sm:gap-6 group hover:bg-dark transition-colors duration-500">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center bg-brand text-dark text-[9px] font-black tracking-widest shrink-0">{step.num}</span>
                    <step.Icon className="w-4 h-4 sm:w-5 sm:h-5 text-brand/40 group-hover:text-brand/70 transition-colors duration-500" />
                    <span className="block h-px flex-1 bg-beige group-hover:bg-cream/10 transition-colors duration-500" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-[-0.01em] text-dark group-hover:text-cream transition-colors duration-500">{step.title}</h3>
                    <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-6 sm:leading-7 text-muted group-hover:text-cream/55 font-medium transition-colors duration-500">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 sm:mt-10 text-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Link to="/prestations" className="inline-flex items-center gap-3 bg-dark px-8 sm:px-10 py-3.5 sm:py-4 text-[10px] font-black uppercase tracking-[0.35em] text-cream hover:bg-brand hover:text-dark transition-all duration-300">
                  <ScissorsIcon className="w-3.5 h-3.5" /> Commencer
                </Link>
              </motion.div>
            </motion.div>
          </Section>
        </div>
      </section>

      <Marquee dark reverse />

      {/* ═══════════════ ABOUT TEASER ══════════════════════════ */}
      <section className="bg-creamMid py-14 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Section className="grid gap-10 sm:gap-16 lg:grid-cols-2 lg:items-center">
            <motion.div variants={fadeUp}>
              <Eyebrow Icon={CombIcon}>Notre approche</Eyebrow>
              <RevealText tag="h2" className="text-[clamp(2.2rem,5vw,4rem)] font-black uppercase tracking-[-0.04em] text-dark leading-[0.93] mt-2">
                Précision. Style. Excellence.
              </RevealText>
              <p className="mt-6 sm:mt-8 text-sm sm:text-base leading-7 sm:leading-8 text-dark/65 max-w-sm font-medium">
                Je suis barbier indépendant et je loue mon siège au 1 Rue de la Madeleine. Quand tu réserves ici tu réserves avec moi directement. Je fais ça avec passion depuis 2018.
              </p>
              <Link to="/concept" className="mt-8 sm:mt-10 inline-flex items-center gap-3 sm:gap-4 text-[10px] font-black uppercase tracking-[0.35em] text-dark hover:text-brand transition-colors group">
                Découvrir le concept
                <span className="block h-px w-10 bg-brand transition-all duration-300 group-hover:w-16" />
              </Link>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { bg: 'bg-dark', hover: 'hover:bg-brand', val: '100%', valCls: 'text-cream group-hover:text-dark', label: 'Satisfaits', labelCls: 'text-cream/40 group-hover:text-dark/60', eyebrow: 'text-brand group-hover:text-dark/50', ey: 'Clients' },
                { bg: 'bg-brand', hover: 'hover:bg-dark', val: '8+',   valCls: 'text-dark group-hover:text-cream', label: "Ans depuis 2018",  labelCls: 'text-dark/55 group-hover:text-cream/50', eyebrow: 'text-dark/50 group-hover:text-brand', ey: 'Expérience' },
              ].map((c) => (
                <motion.div key={c.val} variants={fadeUp}
                  className={`${c.bg} ${c.hover} p-5 sm:p-7 aspect-square flex flex-col justify-between group transition-colors duration-500 cursor-default`}>
                  <span className={`text-[8px] sm:text-[9px] uppercase tracking-[0.4em] sm:tracking-[0.5em] font-bold ${c.eyebrow} transition-colors duration-500`}>{c.ey}</span>
                  <div>
                    <p className={`text-4xl sm:text-5xl font-black transition-colors duration-500 ${c.valCls}`}>{c.val}</p>
                    <p className={`mt-1 sm:mt-2 text-xs sm:text-sm font-medium transition-colors duration-500 ${c.labelCls}`}>{c.label}</p>
                  </div>
                </motion.div>
              ))}
              <motion.div variants={fadeUp}
                className="bg-beige border border-beige/60 p-5 sm:p-7 col-span-2 flex items-center justify-between hover:border-brand transition-colors duration-300">
                <div>
                  <p className="text-base sm:text-xl font-black text-dark">CAP Coiffure · Certifié</p>
                  <p className="mt-0.5 text-xs sm:text-sm text-muted font-medium">1 Rue de la Madeleine, 77170</p>
                </div>
                <div className="flex gap-0.5 sm:gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <motion.span key={i} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, duration: 0.3, ease: 'backOut' }} viewport={{ once: true }}
                      className="text-brand text-lg sm:text-xl">★</motion.span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </Section>
        </div>
      </section>

      <Marquee gold speed={22} />

      {/* ═══════════════ CTA BANNER ═════════════════════════════ */}
      <section
        className="relative py-20 sm:py-28 lg:py-36 overflow-hidden grain"
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(74,47,26,0.95) 0%, rgba(61,39,16,0.88) 100%),' +
            'url("https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1920&q=80")',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        <ScissorsIcon className="absolute top-16 right-16 w-24 h-24 text-brand/6 hidden lg:block pointer-events-none" />
        <CombIcon     className="absolute bottom-16 left-16 w-28 h-20 text-brand/6 hidden lg:block pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 text-center">
          <Section>
            <Eyebrow>Prêt à transformer ton style ?</Eyebrow>
            <RevealText tag="h2" className="mt-3 text-[clamp(2rem,5vw,4.5rem)] font-black uppercase tracking-[-0.04em] text-cream leading-tight">
              Réserve ton créneau maintenant.
            </RevealText>
            <motion.p variants={fadeUp} className="mt-4 sm:mt-6 text-sm sm:text-base text-cream/55 max-w-md mx-auto font-medium">
              Choisis ta prestation, prends l'horaire qui t'arrange et confirme en quelques secondes.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 sm:mt-14 flex flex-wrap gap-3 sm:gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link to="/prestations" className="inline-flex items-center gap-2 sm:gap-3 bg-brand px-8 sm:px-10 py-4 sm:py-5 text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.35em] text-dark hover:bg-brandDark transition-colors">
                  <ScissorsIcon className="w-3.5 h-3.5" /> Voir les services
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link to="/concept" className="inline-flex items-center justify-center border border-cream/22 px-8 sm:px-10 py-4 sm:py-5 text-[10px] font-semibold uppercase tracking-[0.3em] sm:tracking-[0.35em] text-cream hover:border-cream/50 transition-all">
                  En savoir plus
                </Link>
              </motion.div>
            </motion.div>
          </Section>
        </div>
      </section>
    </>
  );
}
