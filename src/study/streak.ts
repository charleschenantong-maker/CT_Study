/*
 * Streak domain. A day is COMPLETE when every active core task has a
 * full completion that day (falls back to "any XP" if no core tasks
 * are configured). Repairs only cover the immediately previous missed day.
 */

import { STUDY_CONFIG, getTask } from "./config";
import { addDays } from "./dates";
import type {
  DayStatus,
  StreakRepairRecord,
  TaskCompletionRecord,
} from "./types";
import { fullCompletionsOf, sumXp } from "./xp";

export function coreTasks() {
  return STUDY_CONFIG.tasks.filter((t) => t.active !== false && t.core === true);
}

function repairedDates(repairs: StreakRepairRecord[]): Set<string> {
  return new Set(repairs.map((r) => r.repairedDate));
}

export function dayStatus(
  date: string,
  completions: TaskCompletionRecord[],
  repairs: StreakRepairRecord[],
): DayStatus {
  if (repairedDates(repairs).has(date)) return "repaired";
  const cores = coreTasks();
  if (cores.length === 0) {
    return sumXp(completions.filter((r) => r.date === date)) > 0
      ? "complete"
      : "missed";
  }
  const ok = cores.every(
    (t) => fullCompletionsOf(completions, t.id, date).length > 0,
  );
  return ok ? "complete" : "missed";
}

/** XP earned today beyond one full completion per core task. */
export function additionalXpToday(
  today: string,
  completions: TaskCompletionRecord[],
): number {
  const total = sumXp(completions.filter((r) => r.date === today));
  let required = 0;
  for (const t of coreTasks()) {
    if (fullCompletionsOf(completions, t.id, today).length > 0) {
      required += getTask(t.id)?.xp ?? 0;
    }
  }
  return Math.max(0, total - required);
}

export interface RepairEligibility {
  eligible: boolean;
  missedDate: string;
  cost: number;
  reason?: string;
}

export function repairEligibility(
  today: string,
  completions: TaskCompletionRecord[],
  repairs: StreakRepairRecord[],
): RepairEligibility {
  const missedDate = addDays(today, -1);
  const cost = STUDY_CONFIG.streakRepairCostXp;
  if (dayStatus(missedDate, completions, repairs) !== "missed") {
    return { eligible: false, missedDate, cost, reason: "昨日未断签，无需修复" };
  }
  if (dayStatus(today, completions, repairs) !== "complete") {
    return { eligible: false, missedDate, cost, reason: "先完成今日全部核心任务" };
  }
  if (additionalXpToday(today, completions) < cost) {
    return {
      eligible: false,
      missedDate,
      cost,
      reason: `今日额外投入需 ≥ ${cost} XP（核心任务之外）`,
    };
  }
  return { eligible: true, missedDate, cost };
}

function isGoodDay(
  date: string,
  completions: TaskCompletionRecord[],
  repairs: StreakRepairRecord[],
): boolean {
  const s = dayStatus(date, completions, repairs);
  return s === "complete" || s === "repaired";
}

export function currentStreak(
  today: string,
  completions: TaskCompletionRecord[],
  repairs: StreakRepairRecord[],
): number {
  let day = isGoodDay(today, completions, repairs) ? today : addDays(today, -1);
  let n = 0;
  while (isGoodDay(day, completions, repairs)) {
    n++;
    day = addDays(day, -1);
    if (n > 3650) break;
  }
  return n;
}

export function longestStreak(
  today: string,
  completions: TaskCompletionRecord[],
  repairs: StreakRepairRecord[],
  lookbackDays = 730,
): number {
  let best = 0;
  let run = 0;
  for (let i = lookbackDays; i >= 0; i--) {
    if (isGoodDay(addDays(today, -i), completions, repairs)) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}
