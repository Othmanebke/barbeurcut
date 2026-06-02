import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

function Section({ title, children }) {
  return (
    <motion.div
      className="border-b pb-8 mb-8 last:border-0"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: EASE }}>
      <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white mb-4">{title}</h2>
      <div className="text-sm leading-7 font-medium space-y-2" style={{ color: 'rgba(244,239,234,0.60)' }}>
        {children}
      </div>
    </motion.div>
  );
}

export default function LegalMentions() {
  return (
    <div className="min-h-screen" style={{ background: '#5C4031', paddingTop: 'var(--navbar-h, 72px)' }}>

      {/* Header */}
      <div className="border-b" style={{ background: '#3D2A1E', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-3xl px-6 sm:px-10 py-12 sm:py-16">
          <motion.p className="text-[9px] uppercase tracking-[0.6em] font-bold mb-4"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            Informations légales
          </motion.p>
          <div className="overflow-hidden">
            <motion.h1 className="font-black uppercase leading-[0.88] tracking-[-0.04em] text-white"
              style={{ fontSize: 'clamp(2.2rem, 8vw, 5rem)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: EASE }}>
              Mentions
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1 className="font-black uppercase leading-[0.88] tracking-[-0.04em]"
              style={{ fontSize: 'clamp(2.2rem, 8vw, 5rem)', color: 'rgba(255,255,255,0.28)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: EASE }}>
              Légales
            </motion.h1>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="mx-auto max-w-3xl px-6 sm:px-10 py-12 sm:py-16">

        <Section title="Éditeur du site">
          <p><strong className="text-white">Nom commercial :</strong> Wonderclub</p>
          <p><strong className="text-white">Activité :</strong> Barbier indépendant — artisan en location de siège</p>
          <p><strong className="text-white">Adresse professionnelle :</strong> 1 Rue de la Madeleine, 77170 Brie-Comte-Robert</p>
          <p><strong className="text-white">Email :</strong> wonderclubsm@gmail.com</p>
          <p><strong className="text-white">Diplôme :</strong> Brevet Professionnel (BP) Coiffure — obtenu à la CMA Saint-Maur-des-Fossés</p>
          <p><strong className="text-white">Responsable de publication :</strong> Le gérant de Wonderclub</p>
        </Section>

        <Section title="Hébergement">
          <p><strong className="text-white">Hébergeur :</strong> Vercel Inc.</p>
          <p><strong className="text-white">Adresse :</strong> 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</p>
          <p><strong className="text-white">Site :</strong> vercel.com</p>
        </Section>

        <Section title="Propriété intellectuelle">
          <p>
            Le site Wonderclub et l'ensemble de ses contenus (textes, images, logo, design) sont protégés par le droit de la propriété intellectuelle.
            Toute reproduction, représentation ou diffusion, même partielle, sans autorisation écrite préalable est strictement interdite.
          </p>
        </Section>

        <Section title="Données personnelles (RGPD)">
          <p>
            Dans le cadre de la prise de rendez-vous en ligne, les données collectées (prénom, nom, numéro de téléphone, adresse e-mail)
            sont utilisées uniquement pour la gestion des réservations et l'envoi des confirmations.
          </p>
          <p>
            Ces données ne sont ni vendues, ni cédées à des tiers. Elles sont conservées pendant une durée maximale de 12 mois
            à compter de la date de réservation.
          </p>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés,
            vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
            Pour exercer ces droits, contactez-nous à : <strong className="text-white">wonderclubsm@gmail.com</strong>
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            Ce site utilise des cookies techniques strictement nécessaires à son bon fonctionnement.
            Ces cookies ne collectent aucune donnée personnelle à des fins publicitaires.
          </p>
          <p>
            Vous pouvez paramétrer votre navigateur pour refuser les cookies.
            Dans ce cas, certaines fonctionnalités du site peuvent être affectées.
          </p>
        </Section>

        <Section title="Responsabilité">
          <p>
            Wonderclub s'efforce de maintenir les informations présentes sur ce site à jour et exactes.
            Cependant, nous ne pouvons garantir l'exactitude, l'exhaustivité ou l'actualité de toutes les informations.
          </p>
          <p>
            La disponibilité des créneaux affichée en ligne est indicative et peut varier en temps réel.
          </p>
        </Section>

        <p className="text-[9px] uppercase tracking-[0.4em] font-bold mt-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Dernière mise à jour : juin 2026
        </p>
      </div>
    </div>
  );
}
