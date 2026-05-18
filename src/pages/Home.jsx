import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import RevealText from '../components/RevealText';
import Marquee from '../components/Marquee';
import { ScissorsIcon, RazorIcon, CombIcon, BrushIcon, DiamondDivider } from '../components/BarberIcons';

/* ── Animation presets ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 48 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
};

/* ── ScrambleText hook ──────────────────────────────────────── */
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
      setDisplay(
        text.split('').map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < settled) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('')
      );
      if (progress < 1) raf.current = requestAnimationFrame(step);
      else setDisplay(text);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [active, text, duration]);
  return display;
}

/* ── AnimatedCounter ────────────────────────────────────────── */
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

/* ── Section wrapper (scroll reveal) ──────────────────────── */
function Section({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

/* ── Eyebrow label with icon ───────────────────────────────── */
function Eyebrow({ children, dark = false, Icon = ScissorsIcon }) {
  return (
    <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
      <Icon className={`w-4 h-4 shrink-0 ${dark ? 'text-brand' : 'text-brand'}`} />
      <span className={`text-[9px] uppercase tracking-[0.55em] font-bold ${dark ? 'text-brand' : 'text-brand'}`}>
        {children}
      </span>
    </motion.div>
  );
}

/* ── Data ──────────────────────────────────────────────────── */
const SERVICES = [
  { id: '01', title: 'Coupe homme',               desc: 'Consultation, lavage, coupe ciseaux ou tondeuse, finition au rasoir sur les contours.', price: '20€', Icon: ScissorsIcon },
  { id: '02', title: 'Coupe + Barbe',             desc: 'Coupe homme + taille et mise en forme de la barbe, contours dessinés au rasoir.',       price: '30€', Icon: RazorIcon   },
  { id: '03', title: 'Coupe + Rasage traditionnel', desc: 'Mousse chaude, rasage au coupe-chou, compresse froide pour fermer les pores.',        price: '35€', Icon: CombIcon    },
];

const STEPS = [
  { num: '01', title: 'Choisis ta coupe',    desc: 'Parcours nos prestations et sélectionne le service qui te correspond.', Icon: ScissorsIcon },
  { num: '02', title: 'Réserve ton créneau', desc: 'Choisis une date et un horaire en trois clics, sans attente.',          Icon: CombIcon     },
  { num: '03', title: "Reçois l'adresse",    desc: "Tu reçois l'adresse exacte du drop par SMS avant ton créneau.",         Icon: BrushIcon    },
];

const GALLERY = [
  { url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&q=80',  alt: 'Barber au travail',  wide: false },
  { url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=700&q=80',  alt: 'Coupe homme',        wide: false },
  { url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=700&q=80',  alt: 'Outils de barbier',  wide: true  },
  { url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=700&q=80',  alt: 'Coupe dégradé',      wide: false },
];

const TESTIMONIALS = [
  {
    quote: '"Une expérience incomparable. Le barbier a su exactement ce que je voulais. Ambiance, qualité et rapidité — c\'est parfait."',
    name: 'Alonso D.', role: 'Client fidèle depuis 2021', initial: 'A',
  },
  {
    quote: '"Le meilleur barbier de Paris. Réservation simple, équipe pro et résultat nickel. Je recommande à 100%."',
    name: 'Karim M.', role: 'Client régulier', initial: 'K',
  },
];

/* ══════════════════════════════════════════════════════════ */
export default function Home() {
  /* Scramble fires once hero mounts */
  const [scrambleActive, setScrambleActive] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setScrambleActive(true), 700);
    return () => clearTimeout(t);
  }, []);
  const scrambled = useScramble('COUPE PARFAITE.', scrambleActive, 1100);

  return (
    <>
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section
        className="relative flex min-h-screen flex-col overflow-hidden grain"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(74,47,26,0.75) 0%, rgba(74,47,26,0.48) 45%, rgba(74,47,26,0.92) 100%),' +
            'url("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* ── Content ── */}
        <div className="relative z-10 flex flex-1 items-center px-6 sm:px-10" style={{ paddingTop: 'var(--navbar-h, 72px)' }}>
          <div className="mx-auto w-full max-w-7xl py-20 lg:py-28">
            <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-5xl">

              {/* eyebrow */}
              <motion.div variants={fadeUp} className="flex items-center gap-4 mb-10">
                <ScissorsIcon className="w-4 h-4 text-brand" />
                <span className="block h-px w-8 bg-brand" />
                <span className="text-[9px] uppercase tracking-[0.6em] text-brand font-bold">
                  Wonder Cut — Barbershop Paris
                </span>
              </motion.div>

              {/* headline line 1 */}
              <div className="overflow-mask">
                <motion.p
                  variants={fadeUp}
                  className="text-[clamp(3rem,8vw,7rem)] font-black uppercase tracking-[-0.03em] text-cream leading-[0.9] mb-2"
                >
                  L'art de la
                </motion.p>
              </div>

              {/* headline line 2 — SCRAMBLE + SHIMMER */}
              <div className="overflow-mask mb-8">
                <motion.p
                  variants={fadeUp}
                  className="text-[clamp(3rem,8vw,7rem)] font-black uppercase tracking-[-0.03em] leading-[0.9] scramble-mono shimmer-gold"
                  aria-label="coupe parfaite."
                >
                  {scrambled}
                </motion.p>
              </div>

              <motion.p variants={fadeUp} className="max-w-lg text-base leading-8 text-cream/65 font-medium">
                L'art de la coupe sans compromis. Réserve ton créneau en trois clics et reçois l'adresse exacte du drop par message.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} className="mt-12 flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/prestations"
                    className="inline-flex items-center gap-3 bg-brand px-9 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-dark transition-colors duration-300 hover:bg-brandDark"
                  >
                    <ScissorsIcon className="w-3.5 h-3.5" />
                    Réserver maintenant
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/concept"
                    className="inline-flex items-center justify-center border border-cream/30 px-9 py-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-cream transition-all duration-300 hover:border-cream/65 hover:bg-cream/8"
                  >
                    Notre concept
                  </Link>
                </motion.div>
              </motion.div>

              {/* scroll indicator */}
              <motion.div
                variants={fadeUp}
                className="mt-16 hidden lg:flex items-center gap-4"
              >
                <motion.span
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="block w-px h-10 bg-gradient-to-b from-brand to-transparent"
                />
                <span className="text-[9px] uppercase tracking-[0.5em] text-cream/35 font-medium">Scroll</span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="relative z-10 border-t border-cream/10 bg-dark/65 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl grid grid-cols-3 divide-x divide-cream/10 px-6 sm:px-10">
            {[
              { target: 200, suffix: '+', label: 'Clients satisfaits' },
              { target: 5,   suffix: '+', label: "Années d'expertise" },
              { target: 3,   suffix: '',  label: 'Artistes barbiers'  },
            ].map((s) => (
              <div key={s.label} className="py-5 text-center">
                <p className="text-xl font-black text-cream sm:text-2xl">
                  <AnimatedCounter target={s.target} suffix={s.suffix} />
                </p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.35em] text-cream/45 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marquee 1 ── */}
      <Marquee />

      {/* ═══════════════════ SERVICES PREVIEW ══════════════════ */}
      <section className="bg-cream py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Section>
            <div className="flex items-end justify-between pb-8 border-b border-beige mb-2">
              <div>
                <Eyebrow Icon={RazorIcon}>Nos prestations</Eyebrow>
                <RevealText
                  tag="h2"
                  className="text-4xl font-black uppercase tracking-[-0.04em] text-dark sm:text-5xl leading-tight mt-2"
                >
                  Services
                </RevealText>
              </div>
              <Link
                to="/prestations"
                className="hidden lg:inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.35em] text-muted hover:text-brand font-bold transition-colors"
              >
                Voir tout <span className="block h-px w-8 bg-current" />
              </Link>
            </div>

            <motion.div variants={stagger} className="divide-y divide-beige/60">
              {SERVICES.map((s) => (
                <motion.div
                  key={s.id}
                  variants={fadeUp}
                  className="grid grid-cols-[48px_1fr_auto] items-center gap-8 py-8 group cursor-default"
                >
                  <span className="text-[9px] uppercase tracking-[0.55em] text-brand/70 font-bold">{s.id}</span>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-[-0.02em] text-dark group-hover:text-brand transition-colors duration-300">
                      {s.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted font-medium">{s.desc}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xl font-black text-dark/20 group-hover:text-brand transition-colors duration-300">{s.price}</span>
                    <s.Icon className="w-4 h-4 text-dark/15 group-hover:text-brand/60 transition-colors duration-300 shrink-0" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── Marquee 2 (reverse) ── */}
      <Marquee reverse />

      {/* ═══════════════ COMMENT ÇA MARCHE ═════════════════════ */}
      <section className="bg-cream py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <Eyebrow>Simple & rapide</Eyebrow>
              <RevealText
                tag="h2"
                className="text-4xl font-black uppercase tracking-[-0.04em] text-dark sm:text-5xl leading-tight"
              >
                Comment ça marche
              </RevealText>
              <motion.p variants={fadeUp} className="mt-5 max-w-md mx-auto text-sm leading-8 text-muted font-medium">
                Réserve ton créneau en trois clics et reçois l'adresse exacte du drop par message.
              </motion.p>
            </motion.div>

            <motion.div variants={stagger} className="grid gap-px bg-beige/40 sm:grid-cols-3">
              {STEPS.map((step) => (
                <motion.div
                  key={step.num}
                  variants={fadeUp}
                  className="bg-cream p-10 flex flex-col gap-6 group hover:bg-dark transition-colors duration-500"
                >
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center bg-brand text-dark text-[9px] font-black tracking-widest shrink-0 group-hover:bg-brand transition-colors duration-500">
                      {step.num}
                    </span>
                    <step.Icon className="w-5 h-5 text-brand/40 group-hover:text-brand/70 transition-colors duration-500" />
                    <span className="block h-px flex-1 bg-beige group-hover:bg-cream/10 transition-colors duration-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-[-0.01em] text-dark group-hover:text-cream transition-colors duration-500">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted group-hover:text-cream/55 font-medium transition-colors duration-500">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 text-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Link
                  to="/prestations"
                  className="inline-flex items-center gap-3 bg-dark px-10 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-cream transition-all duration-300 hover:bg-brand hover:text-dark"
                >
                  <ScissorsIcon className="w-3.5 h-3.5" />
                  Commencer maintenant
                </Link>
              </motion.div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ═══════════════════ GALLERY ═══════════════════════════ */}
      <section className="bg-dark overflow-hidden">
        <Section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-dark">
          {GALLERY.map((img) => (
            <motion.div key={img.url} variants={fadeUp} className="overflow-hidden">
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-[280px] sm:h-[300px] lg:h-[340px] object-cover saturate-[0.82] hover:saturate-105 hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                loading="lazy"
              />
            </motion.div>
          ))}
        </Section>
      </section>

      {/* ── Marquee gold band ── */}
      <Marquee gold speed={22} />

      {/* ═══════════════ ABOUT TEASER ══════════════════════════ */}
      <section className="bg-creamMid py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Section className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <motion.div variants={fadeUp}>
              <Eyebrow Icon={CombIcon}>Notre approche</Eyebrow>
              <RevealText
                tag="h2"
                className="text-[clamp(2.4rem,5vw,4rem)] font-black uppercase tracking-[-0.04em] text-dark leading-[0.93] mt-2"
              >
                Précision. Style. Excellence.
              </RevealText>
              <p className="mt-8 text-base leading-8 text-dark/65 max-w-sm font-medium">
                Wonder Cut combine le savoir-faire traditionnel du barbershop avec une esthétique moderne et urbaine. Chaque coupe est pensée sur mesure.
              </p>
              <Link
                to="/concept"
                className="mt-10 inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.35em] text-dark hover:text-brand transition-colors group"
              >
                Découvrir le concept
                <span className="block h-px w-10 bg-brand transition-all duration-300 group-hover:w-16" />
              </Link>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-2 gap-4">
              {[
                { bg: 'bg-dark',  hover: 'hover:bg-brand', val: '100%', valCls: 'text-cream group-hover:text-dark', label: 'Satisfaction client', labelCls: 'text-cream/40 group-hover:text-dark/60', eyebrow: 'text-brand group-hover:text-dark/50', ey: 'Qualité' },
                { bg: 'bg-brand', hover: 'hover:bg-dark',  val: '5+',   valCls: 'text-dark group-hover:text-cream', label: "Années d'expertise",  labelCls: 'text-dark/55 group-hover:text-cream/50', eyebrow: 'text-dark/50 group-hover:text-brand', ey: 'Expérience' },
              ].map((c) => (
                <motion.div
                  key={c.val}
                  variants={fadeUp}
                  className={`${c.bg} ${c.hover} p-8 aspect-square flex flex-col justify-between group transition-colors duration-500 cursor-default`}
                >
                  <span className={`text-[9px] uppercase tracking-[0.5em] font-bold ${c.eyebrow} transition-colors duration-500`}>{c.ey}</span>
                  <div>
                    <p className={`text-5xl font-black transition-colors duration-500 ${c.valCls}`}>{c.val}</p>
                    <p className={`mt-2 text-sm font-medium transition-colors duration-500 ${c.labelCls}`}>{c.label}</p>
                  </div>
                </motion.div>
              ))}
              <motion.div
                variants={fadeUp}
                className="bg-beige border border-beige/60 p-8 col-span-2 flex items-center justify-between hover:border-brand transition-colors duration-300 group"
              >
                <div>
                  <p className="text-xl font-black text-dark">Top Barbershop Paris</p>
                  <p className="mt-1 text-sm text-muted font-medium">Reconnu parmi les meilleurs de la ville</p>
                </div>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, duration: 0.3, ease: 'backOut' }}
                      viewport={{ once: true }}
                      className="text-brand text-xl"
                    >★</motion.span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ══════════════════════════ */}
      <section className="bg-dark py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Section>
            <div className="mb-14">
              <Eyebrow dark Icon={BrushIcon}>Avis clients</Eyebrow>
              <RevealText
                tag="h2"
                className="text-4xl font-black uppercase tracking-[-0.04em] text-cream sm:text-5xl leading-tight mt-2"
              >
                Ce qu'ils disent.
              </RevealText>
            </div>

            <motion.div variants={stagger} className="grid gap-4 md:grid-cols-2">
              {TESTIMONIALS.map((t) => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  whileHover={{ x: 6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="border-l-2 border-brand/50 hover:border-brand pl-8 py-6 transition-colors duration-300"
                >
                  <div className="flex items-center gap-1 mb-5">
                    {[1,2,3,4,5].map((i) => <span key={i} className="text-brand text-sm">★</span>)}
                  </div>
                  <blockquote className="text-base font-light leading-9 text-cream/72 italic">
                    {t.quote}
                  </blockquote>
                  <div className="mt-7 flex items-center gap-4">
                    <div className="h-11 w-11 bg-brand flex items-center justify-center text-sm font-black text-dark shrink-0">
                      {t.initial}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-cream">{t.name}</p>
                      <p className="text-[9px] uppercase tracking-[0.35em] text-cream/35 font-medium">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12 flex justify-center">
              <DiamondDivider className="w-full max-w-xs text-cream" />
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── Bande or large après avis ── */}
      <div className="overflow-hidden bg-cream border-y-4 border-brand py-5 select-none">
        <motion.div
          className="flex items-center whitespace-nowrap w-max"
          animate={{ x: ['0%', '-33.33%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          {[...Array(3)].map((_, gi) =>
            ['WONDER CUT', 'COUPE HOMME', 'BARBE & RASAGE', 'BRIE-COMTE-Robert', 'RÉSERVATION EN LIGNE', 'RASAGE TRADITIONNEL', 'BARBIERS EXPERTS', 'COUPE SUR MESURE'].map((word, i) => (
              <span key={`${gi}-${i}`} className="flex items-center">
                <span className="text-[clamp(1.4rem,3vw,2.2rem)] font-black uppercase tracking-[0.18em] text-dark/12 px-8">
                  {word}
                </span>
                <span className="text-brand text-[clamp(1.2rem,2.5vw,1.8rem)] shrink-0">✦</span>
              </span>
            ))
          )}
        </motion.div>
      </div>

      {/* ═══════════════ CTA BANNER ═════════════════════════════ */}
      <section
        className="relative py-36 overflow-hidden grain"
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(74,47,26,0.95) 0%, rgba(61,39,16,0.88) 100%),' +
            'url("https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* decorative barber icons floating */}
        <ScissorsIcon className="absolute top-16 right-16 w-24 h-24 text-brand/6 hidden lg:block pointer-events-none" />
        <CombIcon     className="absolute bottom-16 left-16 w-28 h-20 text-brand/6 hidden lg:block pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 text-center">
          <Section>
            <Eyebrow dark>Prêt à transformer ton style ?</Eyebrow>
            <RevealText
              tag="h2"
              className="mt-3 text-[clamp(2.5rem,5vw,4.5rem)] font-black uppercase tracking-[-0.04em] text-cream leading-tight"
            >
              Réserve ton créneau maintenant.
            </RevealText>
            <motion.p variants={fadeUp} className="mt-6 text-base text-cream/55 max-w-md mx-auto font-medium">
              Choisis ta prestation, sélectionne un créneau et confirme en quelques secondes.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-14 flex flex-wrap gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/prestations"
                  className="inline-flex items-center gap-3 bg-brand px-10 py-5 text-[10px] font-black uppercase tracking-[0.35em] text-dark transition-colors duration-300 hover:bg-brandDark"
                >
                  <ScissorsIcon className="w-3.5 h-3.5" />
                  Voir les services
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/concept"
                  className="inline-flex items-center justify-center border border-cream/22 px-10 py-5 text-[10px] font-semibold uppercase tracking-[0.35em] text-cream transition-all duration-300 hover:border-cream/50 hover:bg-cream/6"
                >
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
