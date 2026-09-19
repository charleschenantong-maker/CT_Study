/*
 * ============================================================
 *  EDIT STUDY CONFIGURATION HERE
 * ============================================================
 * This is the ONLY place that describes the study plan:
 * tasks, subjects, papers, XP, weekly quotas, repair cost,
 * contribution-grid thresholds.
 *
 * - Placeholder/demo data only. UI never depends on these names.
 * - Renaming "Task A" -> "STEP" or changing 15 XP -> 10 XP
 *   means editing the lines below. Nothing else.
 * - History records snapshot xpEarned, so edits here never
 *   rewrite the past.
 */

import type { StudyConfig } from "./types";

export const STUDY_CONFIG: StudyConfig = {
  tasks: [
    { id: "task-a", name: "Task A", xp: 15, subjectId: "subject-x", core: true, active: true },
    { id: "task-b", name: "Task B", xp: 10, subjectId: "subject-x", core: true, active: true },
    { id: "task-c", name: "Task C", xp: 25, subjectId: "subject-y", active: true },
  ],

  subjects: [
    { id: "subject-x", name: "Subject X", active: true },
    { id: "subject-y", name: "Subject Y", active: true },
  ],

  papers: [
    { id: "paper-1", subjectId: "subject-x", name: "Paper 1", maxMark: 60 },
    { id: "paper-2", subjectId: "subject-x", name: "Paper 2", maxMark: 100 },
    { id: "paper-3", subjectId: "subject-x", name: "Paper 3", maxMark: 50 },
    { id: "paper-a", subjectId: "subject-y", name: "Paper A", maxMark: 40 },
    { id: "paper-b", subjectId: "subject-y", name: "Paper B", maxMark: 80 },
  ],

  weeklyPlan: [
    { taskId: "task-a", timesPerWeek: 4 },
    { taskId: "task-b", timesPerWeek: 3 },
    { taskId: "task-c", timesPerWeek: 6 },
  ],

  streakRepairCostXp: 15,

  contributionBuckets: [
    { minXp: 1, level: 1 },
    { minXp: 21, level: 2 },
    { minXp: 41, level: 3 },
    { minXp: 61, level: 4 },
  ],

  exams: [
    { id: "exam-a", name: "Exam A", date: "2026-10-12" },
    { id: "exam-b", name: "Exam B", date: "2026-10-20" },
    { id: "exam-c", name: "Exam C", date: "2026-10-27" },
    { id: "exam-d", name: "Exam D", date: "2026-11-10" },
    { id: "exam-e", name: "Exam E", date: "2026-11-18" },
  ],
};

export function getTask(id: string) {
  return STUDY_CONFIG.tasks.find((t) => t.id === id);
}

export function getSubject(id: string) {
  return STUDY_CONFIG.subjects.find((s) => s.id === id);
}

export function getPaper(id: string) {
  return STUDY_CONFIG.papers.find((p) => p.id === id);
}
