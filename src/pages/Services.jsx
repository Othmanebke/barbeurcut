import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import RevealText from '../components/RevealText';
import Marquee from '../components/Marquee';
import BentoServices from '../components/BentoServices';
import { ScissorsIcon, RazorIcon, CombIcon, BrushIcon, DiamondDivider } from '../components/BarberIcons';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.13, delayChildren: 0.06 } } };

function Section({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

const ENGAGEMENTS = [
  { Icon: ScissorsIcon, title: 'Tarifs fixes',        desc: 'Pas de surprise — le prix affiché est le prix payé, toujours.' },
  { Icon: CombIcon,     title: 'Paiement sur place',  desc: 'Tu règles directement au salon, en espèces ou par carte.' },
  { Icon: RazorIcon,    title: 'Barbiers certifiés',  desc: 'Chaque artiste est sélectionné pour son savoir-faire et sa précision.' },
  { Icon: BrushIcon,    title: 'Satisfaction garantie', desc: 'Si la coupe ne te convient pas, on la rectifie — sans frais.' },
];

export default function Services() {
  const gridRef = useRef(null);
  const gridInView = useInView(gridRef, { once: true, margin: '0px 0px -5% 0px' });

  return (
    <>
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section
        className="relative flex min-h-[68vh] flex-col justify-end overflow-hidden grain"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(74,47,26,0.48) 0%, rgba(74,47,26,0.92) 100%),' +
            'url("https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <RazorIcon className="absolute top-28 right-14 w-32 h-20 text-brand/7 hidden lg:block pointer-events-none" />

        <div
          className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10 pb-16"
          style={{ paddingTop: 'var(--navbar-h, 72px)' }}
        >
          <motion.div initial="hidden" animate="show" variants={stagger} className="grid gap-10 lg:grid-cols-2 lg:items-end">
            <div>
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
                <ScissorsIcon className="w-4 h-4 text-brand" />
                <span className="block h-px w-6 bg-brand" />
                <span className="text-[9px] uppercase tracking-[0.55em] text-brand font-bold">Nos prestations</span>
              </motion.div>
              <div className="overflow-mask">
                <motion.h1 variants={fadeUp} className="text-[clamp(3rem,7vw,6rem)] font-black uppercase tracking-[-0.04em] text-cream leading-[0.92]">
                  Services
                </motion.h1>
              </div>
            </div>
            <motion.div variants={fadeUp} className="border-l-2 border-brand pl-8 flex flex-col gap-5">
              <p className="text-base leading-8 text-cream/65 font-medium">
                Sélectionne une prestation et démarre ta réservation. Tarifs transparents, affichés avant confirmation.
              </p>
              <div className="flex flex-wrap gap-3">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
                  <Link
                    to="/reservation"
                    className="inline-flex items-center gap-2 bg-brand px-8 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-dark transition-colors duration-300 hover:bg-brandDark"
                  >
                    <ScissorsIcon className="w-3.5 h-3.5" />
                    Réserver un créneau
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Prix strip ── */}
      <div className="bg-dark border-b border-cream/8">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-2 py-4">
            {[
              { label: 'À partir de', val: '13€' },
              { label: 'Jusqu\'à',    val: '35€' },
              { label: 'Sur devis',   val: 'Design & Couleur' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {i > 0 && <span className="text-cream/15 hidden sm:block">·</span>}
                <span className="text-[9px] uppercase tracking-[0.4em] text-cream/30 font-medium">{item.label}</span>
                <span className="text-sm font-black text-brand">{item.val}</span>
              </div>
            ))}
            <div className="ml-auto hidden md:flex items-center gap-2">
              <ScissorsIcon className="w-3 h-3 text-cream/20" />
              <span className="text-[9px] uppercase tracking-[0.4em] text-cream/25 font-medium">Paiement sur place</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Marquee ── */}
      <Marquee />

      {/* ═══════════════ SERVICES LIST ══════════════════════ */}
      <section className="bg-cream py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          {/* Label hint */}
          <motion.div
            ref={gridRef}
            initial={{ opacity: 0, y: 20 }}
            animate={gridInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 pb-6 mb-8 border-b border-beige/60"
          >
            <ScissorsIcon className="w-4 h-4 text-brand shrink-0" />
            <p className="text-[9px] uppercase tracking-[0.55em] text-muted font-bold">
              Clique sur une prestation pour réserver directement
            </p>
            <span className="h-px flex-1 bg-beige/60 hidden sm:block" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={gridInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <BentoServices />
          </motion.div>
        </div>
      </section>

      {/* ── Marquee gold ── */}
      <Marquee gold speed={24} />

      {/* ═══════════ NOS ENGAGEMENTS ════════════════════════ */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Section>
            <motion.div variants={fadeUp} className="mb-12 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <ScissorsIcon className="w-4 h-4 text-brand" />
                  <span className="text-[9px] uppercase tracking-[0.55em] text-brand font-bold">La Wonder Cut promesse</span>
                </div>
                <RevealText tag="h2" className="text-3xl font-black uppercase tracking-[-0.04em] text-dark sm:text-4xl leading-tight">
                  Nos engagements
                </RevealText>
              </div>
              <DiamondDivider className="text-dark hidden lg:flex max-w-[120px]" />
            </motion.div>

            <motion.div variants={stagger} className="grid gap-px bg-beige/40 sm:grid-cols-2 lg:grid-cols-4">
              {ENGAGEMENTS.map((e) => (
                <motion.div
                  key={e.title}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  className="group bg-cream p-8 flex flex-col gap-5 hover:bg-dark transition-colors duration-400"
                >
                  <e.Icon className="w-6 h-5 text-brand/50 group-hover:text-brand transition-colors duration-400" />
                  <div>
                    <p className="text-sm font-black uppercase tracking-[-0.01em] text-dark group-hover:text-cream transition-colors duration-400">
                      {e.title}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted group-hover:text-cream/50 font-medium transition-colors duration-400">
                      {e.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Final CTA */}
            <motion.div variants={fadeUp} className="mt-12 text-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Link
                  to="/reservation"
                  className="inline-flex items-center gap-3 bg-dark px-10 py-5 text-[10px] font-black uppercase tracking-[0.35em] text-cream transition-all duration-300 hover:bg-brand hover:text-dark"
                >
                  <ScissorsIcon className="w-3.5 h-3.5" />
                  Réserver maintenant
                </Link>
              </motion.div>
            </motion.div>
          </Section>
        </div>
      </section>
    </>
  );
}
