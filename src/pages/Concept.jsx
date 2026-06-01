import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import RevealText from '../components/RevealText';
import Marquee from '../components/Marquee';
import { ScissorsIcon, CombIcon, BrushIcon, RazorIcon, DiamondDivider } from '../components/BarberIcons';

const fadeUp = {
  hidden: { opacity: 0, y: 44 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.13, delayChildren: 0.06 } },
};

function Section({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

const PILLARS = [
  { id: '01', title: 'Barbier indépendant', desc: 'Je travaille à mon compte. Je loue mon siège au 1 Rue de la Madeleine et quand tu réserves ici tu réserves avec moi directement, pas avec le salon.', Icon: ScissorsIcon },
  { id: '02', title: 'À ton écoute',        desc: 'Je prends le temps de comprendre ce que tu veux avant de commencer. Pas de précipitation, juste un travail soigné.',                                    Icon: CombIcon     },
  { id: '03', title: 'Style sur mesure',    desc: 'Je fais des coupes actuelles adaptées à ta tête et ton style. Pas du copier-coller de tendances.',                                                       Icon: BrushIcon    },
];

const CHECKLIST = [
  'Réservation en ligne en 3 clics',
  'Confirmation par email immédiate',
  'Diplômé CAP Coiffure',
  'Le prix que tu vois c\'est le prix que tu paies',
];

export default function Concept() {
  return (
    <>
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section
        className="relative flex min-h-[72vh] flex-col justify-end overflow-hidden grain"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(74,47,26,0.52) 0%, rgba(74,47,26,0.9) 100%),' +
            'url("https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* decorative icon */}
        <CombIcon className="absolute top-24 right-12 w-32 h-24 text-brand/8 hidden lg:block pointer-events-none" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10 pb-16" style={{ paddingTop: 'var(--navbar-h, 72px)' }}>
          <motion.div initial="hidden" animate="show" variants={stagger} className="grid gap-10 lg:grid-cols-2 lg:items-end">
            <div>
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
                <CombIcon className="w-4 h-4 text-brand" />
                <span className="block h-px w-6 bg-brand" />
                <span className="text-[9px] uppercase tracking-[0.55em] text-brand font-bold">Notre vision</span>
              </motion.div>
              <div className="overflow-mask">
                <motion.h1
                  variants={fadeUp}
                  className="text-[clamp(3rem,7vw,6rem)] font-black uppercase tracking-[-0.04em] text-cream leading-[0.92]"
                >
                  Le Concept
                </motion.h1>
              </div>
            </div>
            <motion.div variants={fadeUp} className="border-l-2 border-brand pl-8">
              <p className="text-base leading-8 text-cream font-medium">
                Je suis barbier indépendant et je loue mon siège au cœur de Brie-Comte-Robert. Je travaille à mon compte depuis 2018 et chaque coupe je la fais avec le même soin.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats gold bar ── */}
      <section className="bg-brand">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 divide-x divide-dark/12">
          {[
            { val: '2018',  label: 'En activité depuis' },
            { val: '100%',  label: 'Clients satisfaits'  },
            { val: 'CAP',   label: 'Coiffure diplômé'   },
            { val: 'Mer–Sam', label: '9h–12h / 13h–19h' },
          ].map((v) => (
            <div key={v.label} className="py-7 px-6 text-center">
              <p className="text-2xl font-black text-dark">{v.val}</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.38em] text-dark/55 font-bold">{v.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Marquee ── */}
      <Marquee />

      {/* ═══════════════════ PILLARS ════════════════════════ */}
      <section className="bg-cream py-14 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Section>
            <motion.div variants={fadeUp} className="mb-10 sm:mb-14">
              <div className="flex items-center gap-3 mb-4">
                <ScissorsIcon className="w-4 h-4 text-brand" />
                <span className="text-[9px] uppercase tracking-[0.55em] text-brand font-bold">Nos piliers</span>
              </div>
              <RevealText tag="h2" className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] text-dark leading-tight">
                Ce qui nous définit
              </RevealText>
            </motion.div>

            <motion.div variants={stagger} className="divide-y divide-beige/60">
              {PILLARS.map((p) => (
                <motion.div
                  key={p.id}
                  variants={fadeUp}
                  className="grid grid-cols-[36px_1fr_auto] sm:grid-cols-[52px_1fr_auto] gap-4 sm:gap-8 py-7 sm:py-10 group items-center"
                >
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.4em] sm:tracking-[0.55em] text-brand/65 font-bold">{p.id}</span>
                  <div>
                    <h2 className="text-base sm:text-xl lg:text-2xl font-black uppercase tracking-[-0.02em] text-dark group-hover:text-brand transition-colors duration-300">
                      {p.title}
                    </h2>
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-6 sm:leading-7 text-dark/60 font-medium max-w-lg">{p.desc}</p>
                  </div>
                  <p.Icon className="w-5 h-4 sm:w-6 sm:h-5 text-beige group-hover:text-brand transition-colors duration-300 shrink-0" />
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── Marquee dark ── */}
      <Marquee dark reverse />

      {/* ═══════════════════ IMAGE SPLIT ════════════════════ */}
      <section className="bg-dark">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2">
          <div
            className="relative min-h-[380px] lg:min-h-[580px] overflow-hidden"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=900&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* subtle overlay */}
            <div className="absolute inset-0 bg-dark/25" />
          </div>

          <Section className="flex flex-col justify-center px-6 sm:px-10 py-10 sm:py-14 lg:py-20">
            <motion.div variants={fadeUp}>
              <div className="flex items-center gap-3 mb-5">
                <RazorIcon className="w-8 h-5 text-brand" />
                <span className="text-[9px] uppercase tracking-[0.55em] text-brand font-bold">La différence</span>
              </div>
              <RevealText tag="h2" className="text-3xl font-black uppercase tracking-[-0.04em] text-cream sm:text-4xl leading-tight">
                Je travaille pour toi, pas pour un patron.
              </RevealText>
              <p className="mt-6 text-sm leading-8 text-cream/60 font-medium max-w-sm">
                Je suis barbier indépendant. Je loue mon siège au 1 Rue de la Madeleine à Brie-Comte-Robert. Je ne travaille pas pour le salon, je travaille pour toi à mon propre compte depuis 2018.
              </p>
            </motion.div>

            <motion.div variants={stagger} className="mt-8 space-y-3">
              {CHECKLIST.map((item) => (
                <motion.div key={item} variants={fadeUp} className="flex items-center gap-4 group">
                  <span className="h-5 w-5 bg-brand shrink-0 flex items-center justify-center text-dark text-[10px] font-black">✓</span>
                  <span className="text-sm font-medium text-cream/65 group-hover:text-cream transition-colors">{item}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10">
              <DiamondDivider className="text-cream mb-8 max-w-xs" />
              <div className="flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/prestations"
                    className="inline-flex items-center gap-2 bg-brand px-8 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-dark transition-colors duration-300 hover:bg-brandDark"
                  >
                    <ScissorsIcon className="w-3.5 h-3.5" />
                    Voir les prestations
                  </Link>
                </motion.div>
                <Link
                  to="/reservation"
                  className="inline-flex items-center justify-center border border-cream/20 px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-cream transition-all duration-300 hover:border-cream/50"
                >
                  Réserver
                </Link>
              </div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ═══════════════════ ADRESSE & MAPS ═════════════════ */}
      <section className="bg-cream py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Section className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <motion.div variants={fadeUp}>
              <div className="flex items-center gap-3 mb-5">
                <ScissorsIcon className="w-4 h-4 text-brand" />
                <span className="text-[9px] uppercase tracking-[0.55em] text-brand font-bold">Nous trouver</span>
              </div>
              <h2 className="text-3xl font-black uppercase tracking-[-0.04em] text-dark sm:text-4xl leading-tight mb-6">
                1 Rue de la Madeleine<br />
                <span className="text-muted text-2xl font-bold">77170 Brie-Comte-Robert</span>
              </h2>
              <ul className="space-y-3 text-sm font-medium text-dark/65 mb-8">
                {[
                  { icon: '✂️', text: 'Mercredi — Samedi · Ouvert' },
                  { icon: '🕐', text: '9h00 – 12h00  /  13h00 – 19h00' },
                  { icon: '☕', text: 'Pause déjeuner : 12h – 13h' },
                  { icon: '🚫', text: 'Lun, Mar, Dim : fermé' },
                ].map((h) => (
                  <li key={h.text} className="flex items-center gap-3">
                    <span>{h.icon}</span>
                    <span>{h.text}</span>
                  </li>
                ))}
              </ul>
              <DiamondDivider className="text-dark max-w-xs mb-8" />
              <div className="flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=1+Rue+de+la+Madeleine+77170+Brie-Comte-Robert"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-dark px-8 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-cream transition-colors duration-300 hover:bg-brand hover:text-dark"
                  >
                    📍 Voir sur Google Maps
                  </a>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/prestations"
                    className="inline-flex items-center gap-2 border border-beige px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-dark transition-all duration-300 hover:border-dark"
                  >
                    <ScissorsIcon className="w-3.5 h-3.5 text-brand" />
                    Réserver maintenant
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Google Maps embed */}
            <motion.div variants={fadeUp} className="overflow-hidden border border-beige h-72 lg:h-96">
              <iframe
                title="Wonder Cut — Brie-Comte-Robert"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2639.0!2d2.7!3d48.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e5ef0000000001%3A0x0!2sBrie-Comte-Robert%2C+77170!5e0!3m2!1sfr!2sfr!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </Section>
        </div>
      </section>
    </>
  );
}
