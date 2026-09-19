/*
 * Streak domain, plan-aware.
 * - When a DailyPlanEntry exists for the date (via getEntry), the day is
 *   COMPLETE when every core task in that day's plan has a full completion.
 * - Dates without a plan fall back to the legacy rule: every active core
 *   task has a full completion (or "any XP" if no core tasks configured).
 * Repairs only cover the immediately previous missed day.
 */

import { STUDY_CONFIG, getTask } from "./config";
import { addDays } from "./dates";
import type {
  DailyPlanEntry,
  DayStatus,
  StreakRepairRecord,
  TaskCompletionRecord,
} from "./types";
import { fullCompletionsOf, sumXp } from "./xp";

/** Lookup for the daily plan; returns undefined when the date has no plan. */
export type PlanLookup = (date: string) => DailyPlanEntry | undefined;

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
  getEntry?: PlanLookup,
): DayStatus {
  if (repairedDates(repairs).has(date)) return "repaired";
  const entry = getEntry?.(date);
  if (entry) {
    const planCoreTypes = [
      ...new Set(entry.tasks.map((t) => t.type)),
    ].filter((id) => {
      const def = getTask(id);
      return def !== undefined && def.active !== false && def.core === true;
    });
    if (planCoreTypes.length > 0) {
      const ok = planCoreTypes.every(
        (id) => fullCompletionsOf(completions, id, date).length > 0,
      );
      return ok ? "complete" : "missed";
    }
    // Plan exists but lists no core task: fall through to legacy rule.
  }
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
  getEntry?: PlanLookup,
): RepairEligibility {
  const missedDate = addDays(today, -1);
  const cost = STUDY_CONFIG.streakRepairCostXp;
  if (dayStatus(missedDate, completions, repairs, getEntry) !== "missed") {
    return { eligible: false, missedDate, cost, reason: "昨日未断签，无需修复" };
  }
  if (dayStatus(today, completions, repairs, getEntry) !== "complete") {
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
  getEntry?: PlanLookup,
): boolean {
  const s = dayStatus(date, completions, repairs, getEntry);
  return s === "complete" || s === "repaired";
}

export function currentStreak(
  today: string,
  completions: TaskCompletionRecord[],
  repairs: StreakRepairRecord[],
  getEntry?: PlanLookup,
): number {
  let day = isGoodDay(today, completions, repairs, getEntry)
    ? today
    : addDays(today, -1);
  let n = 0;
  while (isGoodDay(day, completions, repairs, getEntry)) {
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
  getEntry?: PlanLookup,
  lookbackDays = 730,
): number {
  let best = 0;
  let run = 0;
  for (let i = lookbackDays; i >= 0; i--) {
    if (isGoodDay(addDays(today, -i), completions, repairs, getEntry)) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}
