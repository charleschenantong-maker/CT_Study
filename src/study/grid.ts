/* Contribution-grid domain: buckets + week-column cells, theme-agnostic. */

import { STUDY_CONFIG } from "./config";
import { addDays } from "./dates";
import type { GridCell } from "./types";

export function levelForXp(xp: number): number {
  let level = 0;
  for (const b of STUDY_CONFIG.contributionBuckets) {
    if (xp >= b.minXp) level = Math.max(level, b.level);
  }
  return level;
}

export interface GridWeek {
  days: GridCell[]; // Mon..Sun
}

/** N week columns ending with the week containing endKey. */
export function buildGrid(
  endKey: string,
  weeks: number,
  xpOf: (date: string) => number,
): GridWeek[] {
  // Monday of current week, then step back.
  const d = new Date(`${endKey}T12:00:00`);
  const dow = (d.getDay() + 6) % 7;
  const monday = addDays(endKey, -dow);
  const start = addDays(monday, -(weeks - 1) * 7);
  const out: GridWeek[] = [];
  for (let w = 0; w < weeks; w++) {
    const days: GridCell[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(start, w * 7 + i);
      const xp = xpOf(date);
      days.push({ date, xp, level: levelForXp(xp) });
    }
    out.push({ days });
  }
  return out;
}
