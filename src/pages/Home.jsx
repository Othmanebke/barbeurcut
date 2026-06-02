import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import RevealText from '../components/RevealText';
import Marquee from '../components/Marquee';
import { ScissorsIcon, RazorIcon, CombIcon, BrushIcon } from '../components/BarberIcons';

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

function Section({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
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

const SERVICES = [
  { id: '01', title: 'Coupe',        desc: 'Consultation, lavage, coupe ciseaux ou tondeuse, finition au rasoir.', price: '20€', duration: '25 min', Icon: ScissorsIcon },
  { id: '02', title: 'Coupe + Barbe', desc: 'Coupe + taille et mise en forme de la barbe, contours dessinés au rasoir.', price: '30€', duration: '30 min', Icon: RazorIcon },
  { id: '03', title: 'Taille barbe', desc: 'Peignage, taille à la longueur voulue, contours définis au rasoir.', price: '13€', duration: '15 min', Icon: CombIcon },
];

const STEPS = [
  { num: '01', title: 'Choisis ta prestation', desc: 'Parcours mes services et sélectionne ce qui te correspond.', Icon: ScissorsIcon },
  { num: '02', title: 'Réserve ton créneau',   desc: 'Prends un horaire en quelques clics, le calendrier s\'adapte à la durée.', Icon: CombIcon },
  { num: '03', title: 'Confirmation immédiate', desc: 'Tu reçois une confirmation par email et SMS tout de suite.', Icon: BrushIcon },
];

export default function Home() {
  return (
    <>
      {/* ══════════════════════ HERO ══════════════════════════ */}
      <section
        className="relative flex flex-col overflow-hidden"
        style={{ minHeight: 'clamp(520px, 90vh, 980px)', background: '#5C4031' }}
      >
        {/* Watermark WC en fond */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
          <p className="font-black uppercase leading-none tracking-[-0.05em]"
             style={{ fontSize: 'clamp(12rem, 40vw, 36rem)', color: 'rgba(255,255,255,0.03)' }}>
            WC
          </p>
        </div>

        {/* Ligne déco gauche */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-brand/20 hidden lg:block" />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 sm:px-10 text-center"
             style={{ paddingTop: 'var(--navbar-h, 72px)' }}>
          <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-5xl mx-auto">

            {/* Badge */}
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-10">
              <span className="block h-px w-8 bg-brand" />
              <span className="text-[9px] uppercase tracking-[0.6em] text-brand font-bold">Barbier indépendant · Brie-Comte-Robert</span>
              <span className="block h-px w-8 bg-brand" />
            </motion.div>

            {/* Titre principal */}
            <div className="overflow-mask mb-2">
              <motion.h1 variants={fadeUp}
                className="font-black uppercase leading-[0.88] tracking-[-0.04em]"
                style={{ fontSize: 'clamp(4.5rem, 16vw, 14rem)', color: '#FFFFFF' }}>
                Wonder
              </motion.h1>
            </div>
            <div className="overflow-mask mb-10">
              <motion.h1 variants={fadeUp}
                className="font-black uppercase leading-[0.88] tracking-[-0.04em] text-brand"
                style={{ fontSize: 'clamp(4.5rem, 16vw, 14rem)' }}>
                club
              </motion.h1>
            </div>

            {/* Séparateur */}
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-10">
              <span className="block h-px w-16 sm:w-24 bg-brand/40" />
              <span className="text-brand text-xs">✦</span>
              <span className="block h-px w-16 sm:w-24 bg-brand/40" />
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp} className="mb-10">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Link to="/prestations"
                  className="inline-flex items-center gap-3 bg-white px-10 sm:px-14 py-4 sm:py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-cream transition-colors"
                  style={{ color: '#5C4031' }}>
                  <ScissorsIcon className="w-3.5 h-3.5" /> Réserver un créneau
                </Link>
              </motion.div>
            </motion.div>

            {/* Diplôme */}
            <motion.p variants={fadeUp}
              className="text-[9px] uppercase tracking-[0.45em] font-bold"
              style={{ color: 'rgba(244,239,234,0.35)' }}>
              Diplôme BP · CMA Saint-Maur-des-Fossés
            </motion.p>

          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 border-t border-white/8" style={{ background: 'rgba(64,85,104,0.6)', backdropFilter: 'blur(8px)' }}>
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
                <p className="mt-0.5 text-[8px] sm:text-[9px] uppercase tracking-[0.35em] font-medium" style={{ color: 'rgba(244,239,234,0.4)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Marquee />

      {/* ══════════════════ SERVICES PREVIEW ══════════════════ */}
      <section style={{ background: '#405568' }} className="py-14 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Section>
            <div className="flex items-end justify-between pb-6 sm:pb-8 border-b mb-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <div>
                <Eyebrow Icon={RazorIcon}>Mes prestations</Eyebrow>
                <RevealText tag="h2" className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] text-white leading-tight mt-2">
                  Services
                </RevealText>
              </div>
              <Link to="/prestations" className="hidden lg:inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.35em] text-white/40 hover:text-brand font-bold transition-colors">
                Voir tout <span className="block h-px w-8 bg-current" />
              </Link>
            </div>

            <motion.div variants={stagger} className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {SERVICES.map((s) => (
                <motion.div key={s.id} variants={fadeUp}
                  className="grid grid-cols-[32px_1fr_auto] sm:grid-cols-[48px_1fr_auto] items-center gap-3 sm:gap-8 py-6 sm:py-8 group cursor-default">
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.55em] text-brand/70 font-bold">{s.id}</span>
                  <div>
                    <h3 className="text-base sm:text-xl lg:text-2xl font-black uppercase tracking-[-0.02em] text-white group-hover:text-brand transition-colors duration-300 leading-tight">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-medium leading-6" style={{ color: 'rgba(244,239,234,0.55)' }}>{s.desc}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-base sm:text-xl font-black text-white/20 group-hover:text-brand transition-colors duration-300">{s.price}</span>
                    <span className="text-[8px] text-brand/50 font-bold">{s.duration}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-5 lg:hidden">
              <Link to="/prestations" className="inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.35em] text-white/40 hover:text-brand font-bold transition-colors">
                Voir tout <span className="block h-px w-8 bg-current" />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

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
              <motion.p variants={fadeUp} className="mt-4 sm:mt-5 max-w-md mx-auto text-sm leading-7 sm:leading-8 font-medium" style={{ color: 'rgba(244,239,234,0.55)' }}>
                Prends un créneau en quelques clics et tu reçois ta confirmation par email et SMS de suite.
              </motion.p>
            </motion.div>

            <motion.div variants={stagger} className="grid gap-px sm:grid-cols-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
              {STEPS.map((step) => (
                <motion.div key={step.num} variants={fadeUp}
                  className="p-6 sm:p-8 lg:p-10 flex flex-col gap-5 sm:gap-6 group hover:bg-brand transition-colors duration-500"
                  style={{ background: '#5C4031' }}>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center bg-brand text-dark text-[9px] font-black tracking-widest shrink-0 group-hover:bg-dark group-hover:text-white transition-colors duration-500">{step.num}</span>
                    <step.Icon className="w-4 h-4 sm:w-5 sm:h-5 text-brand/40 group-hover:text-dark/40 transition-colors duration-500" />
                    <span className="block h-px flex-1 bg-white/10 group-hover:bg-dark/20 transition-colors duration-500" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-[-0.01em] text-white group-hover:text-dark transition-colors duration-500">{step.title}</h3>
                    <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-6 sm:leading-7 font-medium transition-colors duration-500 group-hover:text-dark/65" style={{ color: 'rgba(244,239,234,0.50)' }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 sm:mt-10 text-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Link to="/prestations"
                  className="inline-flex items-center gap-3 bg-white px-8 sm:px-10 py-3.5 sm:py-4 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-brand hover:text-dark transition-all duration-300"
                  style={{ color: '#5C4031' }}>
                  <ScissorsIcon className="w-3.5 h-3.5" /> Commencer
                </Link>
              </motion.div>
            </motion.div>
          </Section>
        </div>
      </section>

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
              <p className="mt-6 sm:mt-8 text-sm sm:text-base leading-7 sm:leading-8 max-w-sm font-medium" style={{ color: 'rgba(244,239,234,0.60)' }}>
                Je suis barbier indépendant et je loue mon siège au 1 Rue de la Madeleine. Quand tu réserves ici tu réserves avec moi directement. Je fais ça avec passion depuis 2018.
              </p>
              <Link to="/concept" className="mt-8 sm:mt-10 inline-flex items-center gap-3 sm:gap-4 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:text-brand transition-colors group">
                Découvrir le concept
                <span className="block h-px w-10 bg-brand transition-all duration-300 group-hover:w-16" />
              </Link>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { bg: '#5C4031', val: '100%', label: 'Clients satisfaits', sub: 'Clients' },
                { bg: '#FFFFFF', val: '8+',   label: 'Ans depuis 2018',    sub: 'Expérience', dark: true },
              ].map((c) => (
                <motion.div key={c.val} variants={fadeUp}
                  className="p-5 sm:p-7 aspect-square flex flex-col justify-between cursor-default"
                  style={{ background: c.bg }}>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.5em] font-bold" style={{ color: c.dark ? 'rgba(74,47,26,0.6)' : 'rgba(198,142,23,0.7)' }}>{c.sub}</span>
                  <div>
                    <p className="text-4xl sm:text-5xl font-black" style={{ color: c.dark ? '#4A2F1A' : '#FFFFFF' }}>{c.val}</p>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium" style={{ color: c.dark ? 'rgba(74,47,26,0.55)' : 'rgba(244,239,234,0.45)' }}>{c.label}</p>
                  </div>
                </motion.div>
              ))}
              <motion.div variants={fadeUp}
                className="border col-span-2 p-5 sm:p-7 flex items-center justify-between"
                style={{ background: '#5C4031', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div>
                  <p className="text-base sm:text-xl font-black text-white">Diplôme BP · Certifié</p>
                  <p className="mt-0.5 text-xs sm:text-sm font-medium" style={{ color: 'rgba(244,239,234,0.45)' }}>1 Rue de la Madeleine, 77170</p>
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

      {/* ══════════════════ CTA BANNER ════════════════════════ */}
      <section style={{ background: '#5C4031' }} className="relative py-20 sm:py-28 lg:py-36 overflow-hidden">
        {/* Texture lignes */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.02) 60px, rgba(255,255,255,0.02) 61px)',
        }} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 text-center">
          <Section>
            <Eyebrow>Prêt à transformer ton style ?</Eyebrow>
            <RevealText tag="h2" className="mt-3 text-[clamp(2rem,5vw,4.5rem)] font-black uppercase tracking-[-0.04em] text-white leading-tight">
              Réserve ton créneau.
            </RevealText>
            <motion.p variants={fadeUp} className="mt-4 sm:mt-6 text-sm sm:text-base max-w-md mx-auto font-medium" style={{ color: 'rgba(244,239,234,0.50)' }}>
              Choisis ta prestation, prends l'horaire qui t'arrange et confirme en quelques secondes.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 sm:mt-14 flex flex-wrap gap-3 sm:gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link to="/prestations"
                  className="inline-flex items-center gap-2 sm:gap-3 bg-white px-8 sm:px-10 py-4 sm:py-5 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-brand hover:text-dark transition-colors"
                  style={{ color: '#5C4031' }}>
                  <ScissorsIcon className="w-3.5 h-3.5" /> Voir les services
                </Link>
              </motion.div>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-8 text-[9px] uppercase tracking-[0.45em] font-bold" style={{ color: 'rgba(244,239,234,0.25)' }}>
              Paiement sur place · Espèces ou chèque uniquement
            </motion.p>
          </Section>
        </div>
      </section>
    </>
  );
}
