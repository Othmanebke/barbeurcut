function Concept() {
  return (
    <section className="mx-auto max-w-6xl space-y-8 py-10 lg:py-16">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.25em] text-amber-400">Concept</p>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Un modèle sans salon, pensé pour les clients et les barbiers.</h1>
        <p className="max-w-3xl text-slate-300 sm:text-lg">
          Wonder Cut propose une expérience flexible où les barbiers viennent à vous ou vous accueillent dans des lieux choisis. Une approche agile, urbaine et contemporaine.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">Location de sièges</h2>
          <p className="mt-3 text-slate-400">Les barbiers sélectionnent des lieux dédiés pour offrir une expérience premium sans salon fixe.</p>
        </article>
        <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">Flexibilité</h2>
          <p className="mt-3 text-slate-400">Choisissez votre prestation, votre créneau et votre lieu en toute simplicité.</p>
        </article>
        <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">Expérience urbaine</h2>
          <p className="mt-3 text-slate-400">Un concept orienté vers les villes, les styles et les rendez-vous express.</p>
        </article>
      </div>
    </section>
  );
}

export default Concept;
