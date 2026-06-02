/* Wonderclub — Mer–Sam, 10h00–19h30, créneaux dynamiques par durée de prestation */

export const OPEN_DAYS = new Set([3, 4, 5, 6]); // mer jeu ven sam

const OPEN_MINUTES  = 10 * 60;       // 10:00
const CLOSE_MINUTES = 19 * 60 + 30;  // 19:30

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function toTimeStr(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface BusyRange {
  start: number; // minutes from midnight
  end:   number;
}

/* Convertit une liste de RDV existants + blocs admin en plages occupées */
export function buildBusyRanges(
  bookings: { time: string; duration: number }[],
  blocks:   { time: string | null; endTime?: string | null }[],
): BusyRange[] {
  const ranges: BusyRange[] = [];

  for (const b of bookings) {
    const start = toMinutes(b.time);
    ranges.push({ start, end: start + b.duration });
  }

  for (const bl of blocks) {
    if (!bl.time) continue; // journée entière — géré ailleurs
    const start = toMinutes(bl.time);
    const end   = bl.endTime ? toMinutes(bl.endTime) : start + 30;
    ranges.push({ start, end });
  }

  return ranges.sort((a, b) => a.start - b.start);
}

/* Génère les créneaux disponibles pour une durée de prestation donnée.
   Produit des slots au début de chaque "fenêtre libre" puis tous les
   [duration] minutes à l'intérieur de cette fenêtre. */
export function generateDynamicSlots(
  serviceDuration: number,
  busyRanges: BusyRange[],
): string[] {
  const slots: string[] = [];

  // Calcule les fenêtres libres dans la journée
  const windows: { start: number; end: number }[] = [];
  let cursor = OPEN_MINUTES;

  for (const busy of busyRanges) {
    if (busy.start > cursor) {
      windows.push({ start: cursor, end: busy.start });
    }
    cursor = Math.max(cursor, busy.end);
  }
  if (cursor < CLOSE_MINUTES) {
    windows.push({ start: cursor, end: CLOSE_MINUTES });
  }

  for (const win of windows) {
    let t = win.start;
    while (t + serviceDuration <= win.end) {
      slots.push(toTimeStr(t));
      t += serviceDuration;
    }
  }

  return slots;
}

/* Filtre les créneaux passés pour aujourd'hui */
export function filterPastSlots(slots: string[], date: Date): string[] {
  const now = new Date();
  if (date.toDateString() !== now.toDateString()) return slots;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return slots.filter(s => toMinutes(s) > nowMinutes);
}
