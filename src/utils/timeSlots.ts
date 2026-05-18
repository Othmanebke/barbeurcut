export function generateAvailableSlots(date: Date): string[] {
  const slots: string[] = [];
  const startMinutes = 9 * 60;
  const endMinutes = 19 * 60;

  for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    slots.push(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (!isToday) {
    return slots;
  }

  return slots.filter((slot) => {
    const [hours, minutes] = slot.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);
    return slotDate > now;
  });
}
