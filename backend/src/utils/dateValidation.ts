export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isToday(date: string): boolean {
  return date === getTodayDateString();
}

export function assertTodayDate(date: string | undefined): { ok: true; date: string } | { ok: false; message: string } {
  const target = date ?? getTodayDateString();
  if (!isToday(target)) {
    return {
      ok: false,
      message: 'Solo se permiten registros del día actual',
    };
  }
  return { ok: true, date: target };
}

export function parseIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
