/* Weekly quota domain: progress per planned task, derived from completions. */

import { addDays, weekStart } from "./dates";
import { WEEKLY_QUOTAS } from "./planData";
import type { QuotaProgress, TaskCompletionRecord } from "./types";
import { fullCompletionsOf } from "./xp";

function completedInWeek(
  taskId: string,
  weekMonday: string,
  completions: TaskCompletionRecord[],
): number {
  let completed = 0;
  for (let i = 0; i < 7; i++) {
    completed += fullCompletionsOf(completions, taskId, addDays(weekMonday, i)).length;
  }
  return completed;
}

export function quotaProgress(
  taskId: string,
  weekRefKey: string,
  completions: TaskCompletionRecord[],
  targetOverride?: number,
): QuotaProgress {
  const start = weekStart(weekRefKey);
  const target =
    targetOverride ?? WEEKLY_QUOTAS[start]?.find((q) => q.taskId === taskId)?.timesPerWeek ?? 0;
  const completed = completedInWeek(taskId, start, completions);
  return {
    taskId,
    target,
    completed,
    remaining: Math.max(0, target - completed),
    done: target > 0 && completed >= target,
  };
}

/** Quota progress for the week containing weekStartKey, from WEEKLY_QUOTAS. */
export function quotasForWeek(
  weekStartKey: string,
  completions: TaskCompletionRecord[],
): QuotaProgress[] {
  const start = weekStart(weekStartKey);
  const quotas = WEEKLY_QUOTAS[start] ?? [];
  return quotas.map((q) =>
    quotaProgress(q.taskId, start, completions, q.timesPerWeek),
  );
}

/** Back-compat alias: weekly progress for the week containing weekRefKey. */
export function allQuotaProgress(
  weekRefKey: string,
  completions: TaskCompletionRecord[],
): QuotaProgress[] {
  return quotasForWeek(weekRefKey, completions);
}
