import { Link } from 'react-router-dom';

function Home() {
  return (
    <section className="mx-auto max-w-6xl space-y-10 py-10 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-block rounded-full bg-slate-800 px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-300">
            Wonder Cut
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            La nouvelle expérience barber, sans salon fixe.
          </h1>
          <p className="max-w-2xl text-slate-300 sm:text-lg">
            Un réseau de barbiers indépendants qui se déplacent ou vous accueillent sur des lieux sélectionnés. Des coupes, des rasages et des styles maîtrisés, dans un environnement urbain.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/reservation"
              className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Réserver maintenant
            </Link>
            <Link
              to="/concept"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              En savoir plus
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
          <div className="space-y-4">
            <div className="h-64 rounded-3xl bg-slate-800/90" />
            <div className="space-y-2 text-slate-300">
              <p className="text-sm uppercase tracking-[0.2em] text-amber-400">Simplicité</p>
              <p>Réservez en quelques clics, choisissez la prestation et le lieu adapté à votre style.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {['Design mobile', 'Barbiers nomades', 'Réservation fluide'].map((item) => (
          <div key={item} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-lg font-semibold text-white">{item}</h2>
            <p className="mt-3 text-slate-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Home;
