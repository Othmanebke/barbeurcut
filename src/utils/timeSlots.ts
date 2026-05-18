/* Horaires Wonder Cut : Mer–Sam, 9h–12h puis 13h–19h (pause déjeuner 12h–13h) */
export function generateAvailableSlots(date: Date): string[] {
  const slots: string[] = [];

  for (let minutes = 9 * 60; minutes < 19 * 60; minutes += 30) {
    /* Exclure la pause 12h–13h */
    if (minutes >= 12 * 60 && minutes < 13 * 60) continue;

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }

  /* Pour aujourd'hui : retirer les créneaux déjà passés */
  const now = new Date();
  if (date.toDateString() !== now.toDateString()) return slots;

  return slots.filter((slot) => {
    const [h, m] = slot.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(h, m, 0, 0);
    return slotDate > now;
  });
}

/* Jours ouverts : mercredi (3), jeudi (4), vendredi (5), samedi (6) */
export const OPEN_DAYS = new Set([3, 4, 5, 6]);
