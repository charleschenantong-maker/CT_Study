/* Local-calendar date helpers. All keys are local YYYY-MM-DD strings. */

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function toKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayKey(): string {
  return toKey(new Date());
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

/** Monday of the week containing key (weeks start Monday). */
export function weekStart(key: string): string {
  const d = parseKey(key);
  const dow = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  d.setDate(d.getDate() - dow);
  return toKey(d);
}

export function monthStart(key: string): string {
  const d = parseKey(key);
  return toKey(new Date(d.getFullYear(), d.getMonth(), 1));
}

/** Short label like "9/18". */
export function shortLabel(key: string): string {
  const d = parseKey(key);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
