/*
 * usePlanner: the single state outlet of the app.
 * UI reads derived data from here; mutations only append history records.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { STUDY_CONFIG, getTask } from "./config";
import { monthStart, todayKey, weekStart } from "./dates";
import { DAILY_PLAN } from "./planData";
import { loadHistory, saveHistory } from "./store";
import { currentStreak, longestStreak, repairEligibility } from "./streak";
import { quotasForWeek } from "./weekly";
import { sumXp, xpByDay, xpOnDay } from "./xp";
import type {
  GradeRecord,
  PlannerHistory,
  TaskCompletionRecord,
} from "./types";

const EMPTY: PlannerHistory = { completions: [], grades: [], repairs: [] };

function uid() {
  return crypto.randomUUID();
}

function findEntry(date: string) {
  return DAILY_PLAN.find((e) => e.date === date);
}

export function usePlanner() {
  const [history, setHistory] = useState<PlannerHistory>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [today] = useState(todayKey);
  const skipFirstSave = useRef(true);

  useEffect(() => {
    loadHistory().then((h) => {
      setHistory(h);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    void saveHistory(history).catch((e) => console.error("[store] save failed:", e));
  }, [history, loaded]);

  function toggleTask(taskId: string, displayName?: string) {
    const task = getTask(taskId);
    if (!task || task.active === false) return;
    setHistory((prev) => {
      const existing = prev.completions.find(
        (r) => r.taskId === taskId && r.date === today && r.fraction >= 1,
      );
      const completions = existing
        ? prev.completions.filter((r) => r.id !== existing.id)
        : [
            ...prev.completions,
            {
              id: uid(),
              taskId,
              taskName: displayName ?? task.name,
              date: today,
              xpEarned: task.xp,
              fraction: 1,
              createdAt: Date.now(),
            } satisfies TaskCompletionRecord,
          ];
      return { ...prev, completions };
    });
  }

  function addGrade(input: {
    date: string;
    subjectId: string;
    paperId: string;
    raw: number;
    max: number;
    note?: string;
  }) {
    const record: GradeRecord = { ...input, id: uid(), createdAt: Date.now() };
    setHistory((prev) => ({ ...prev, grades: [...prev.grades, record] }));
  }

  function deleteGrade(id: string) {
    setHistory((prev) => ({
      ...prev,
      grades: prev.grades.filter((g) => g.id !== id),
    }));
  }

  function deleteGrades(ids: string[]) {
    if (ids.length === 0) return;
    const set = new Set(ids);
    setHistory((prev) => ({
      ...prev,
      grades: prev.grades.filter((g) => !set.has(g.id)),
    }));
  }

  function repairYesterday() {
    const e = repairEligibility(today, history.completions, history.repairs, findEntry);
    if (!e.eligible) return;
    setHistory((prev) => ({
      ...prev,
      repairs: [
        ...prev.repairs,
        {
          id: uid(),
          repairedDate: e.missedDate,
          completedAt: Date.now(),
          xpSpent: e.cost,
        },
      ],
    }));
  }

  const derived = useMemo(() => {
    const { completions, grades, repairs } = history;
    const xpMap = xpByDay(completions);
    const wk = weekStart(today);
    const mo = monthStart(today);
    const inWeek = completions.filter((r) => r.date >= wk);
    const inMonth = completions.filter((r) => r.date >= mo);
    return {
      todayXp: xpOnDay(completions, today),
      weekXp: sumXp(inWeek),
      monthXp: sumXp(inMonth),
      totalXp: sumXp(completions),
      quotas: quotasForWeek(weekStart(today), completions),
      streakNow: currentStreak(today, completions, repairs, findEntry),
      streakBest: longestStreak(today, completions, repairs, findEntry),
      repair: repairEligibility(today, completions, repairs, findEntry),
      todayPlan: findEntry(today),
      xpMap,
      gradesSorted: [...grades].sort((a, b) =>
        a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt,
      ),
    };
  }, [history, today]);

  return {
    loaded,
    today,
    history,
    tasks: STUDY_CONFIG.tasks,
    ...derived,
    toggleTask,
    addGrade,
    deleteGrade,
    deleteGrades,
    repairYesterday,
  };
}

export type Planner = ReturnType<typeof usePlanner>;
