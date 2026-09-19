/* XP domain: single place where effort totals are calculated. */

import type { TaskCompletionRecord } from "./types";

export function sumXp(records: TaskCompletionRecord[]): number {
  return records.reduce((s, r) => s + r.xpEarned, 0);
}

export function xpOnDay(records: TaskCompletionRecord[], date: string): number {
  return sumXp(records.filter((r) => r.date === date));
}

/** dateKey -> total XP, built once and reused by grid/streak/weekly. */
export function xpByDay(records: TaskCompletionRecord[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of records) m.set(r.date, (m.get(r.date) ?? 0) + r.xpEarned);
  return m;
}

/** Completions of one task on one day. */
export function completionsOf(
  records: TaskCompletionRecord[],
  taskId: string,
  date: string,
): TaskCompletionRecord[] {
  return records.filter((r) => r.taskId === taskId && r.date === date);
}

/** Full (fraction >= 1) completions of one task on one day. */
export function fullCompletionsOf(
  records: TaskCompletionRecord[],
  taskId: string,
  date: string,
): TaskCompletionRecord[] {
  return completionsOf(records, taskId, date).filter((r) => r.fraction >= 1);
}
