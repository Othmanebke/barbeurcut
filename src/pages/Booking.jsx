function Booking() {
  return (
    <section className="mx-auto max-w-4xl space-y-8 py-10 lg:py-16">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.25em] text-amber-400">Réservation</p>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Réservez votre créneau</h1>
        <p className="max-w-3xl text-slate-300 sm:text-lg">
          Squelette du formulaire de réservation : sélection de prestation, lieu et date. Nous garderons la structure simple pour intégrer rapidement les champs fonctionnels.
        </p>
      </header>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">Prestations</label>
            <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-slate-300">
              <p>- Coupe classique</p>
              <p>- Rasage traditionnel</p>
              <p>- Design barbe / crâne</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">Lieu</label>
            <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-slate-300">
              <p>- Studio pop-up</p>
              <p>- Lieu privé</p>
              <p>- À domicile</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">Date</label>
            <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-slate-300">
              <p>Sélectionnez un créneau pour recevoir votre confirmation.</p>
            </div>
          </div>

          <button className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">
            Continuer vers la confirmation
          </button>
        </div>
      </div>
    </section>
  );
}

export default Booking;
