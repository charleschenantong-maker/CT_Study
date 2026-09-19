/* Weekly quota domain: progress per planned task, derived from completions. */

import { STUDY_CONFIG } from "./config";
import { addDays, weekStart } from "./dates";
import type { QuotaProgress, TaskCompletionRecord } from "./types";
import { fullCompletionsOf } from "./xp";

export function quotaProgress(
  taskId: string,
  weekRefKey: string,
  completions: TaskCompletionRecord[],
): QuotaProgress {
  const quota = STUDY_CONFIG.weeklyPlan.find((q) => q.taskId === taskId);
  const target = quota?.timesPerWeek ?? 0;
  const start = weekStart(weekRefKey);
  let completed = 0;
  for (let i = 0; i < 7; i++) {
    completed += fullCompletionsOf(completions, taskId, addDays(start, i)).length;
  }
  return {
    taskId,
    target,
    completed,
    remaining: Math.max(0, target - completed),
    done: target > 0 && completed >= target,
  };
}

export function allQuotaProgress(
  weekRefKey: string,
  completions: TaskCompletionRecord[],
): QuotaProgress[] {
  return STUDY_CONFIG.weeklyPlan.map((q) =>
    quotaProgress(q.taskId, weekRefKey, completions),
  );
}
