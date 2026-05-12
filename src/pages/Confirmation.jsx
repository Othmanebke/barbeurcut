function Confirmation() {
  return (
    <section className="mx-auto max-w-4xl space-y-8 py-10 lg:py-16">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.25em] text-amber-400">Confirmation</p>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Votre réservation est presque prête</h1>
        <p className="max-w-3xl text-slate-300 sm:text-lg">
          Merci pour votre demande. Le résumé ci-dessous vous confirme la réservation et l’adresse finale vous sera envoyée par SMS.
        </p>
      </header>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-slate-300">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <h2 className="text-lg font-semibold text-white">Résumé de la réservation</h2>
            <ul className="mt-4 space-y-3 text-slate-300">
              <li>Prestation : Coupe classique</li>
              <li>Lieu : Studio pop-up</li>
              <li>Date : 24 mai 2026</li>
              <li>Statut : Confirmée</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <h2 className="text-lg font-semibold text-white">Information importante</h2>
            <p className="mt-4 text-slate-300">
              L’adresse exacte du lieu de rendez-vous vous sera envoyée par SMS quelques heures avant votre créneau.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Confirmation;
