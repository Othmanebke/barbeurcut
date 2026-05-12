function Services() {
  return (
    <section className="mx-auto max-w-6xl space-y-8 py-10 lg:py-16">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.25em] text-amber-400">Prestations</p>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Nos catégories de services</h1>
        <p className="max-w-3xl text-slate-300 sm:text-lg">
          Un aperçu des prestations proposées : coupes, rasage, barbe, crâne, design et couleur. Chaque catégorie est conçue pour offrir une prestation claire et adaptée.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">Coupes & Rasage</h2>
          <p className="mt-3 text-slate-400">Coupes classiques, dégradés, finitions au rasoir et rasage à l’ancienne.</p>
        </article>
        <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">Barbe & Crâne</h2>
          <p className="mt-3 text-slate-400">Entretien de barbe, contours précis et grooming pour crâne rasé.</p>
        </article>
        <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">Design & Couleur</h2>
          <p className="mt-3 text-slate-400">Styles personnalisés, lignes graphiques et touches de couleur pour un look unique.</p>
        </article>
      </div>
    </section>
  );
}

export default Services;
