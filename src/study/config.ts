/*
 * ============================================================
 *  EDIT STUDY CONFIGURATION HERE
 * ============================================================
 * This is the ONLY place that describes the study plan:
 * tasks, subjects, papers, XP, repair cost,
 * contribution-grid thresholds.
 * (Weekly quotas now live in planData.ts WEEKLY_QUOTAS;
 *  daily plan lives in planData.ts DAILY_PLAN.)
 *
 * - Real data transcribed from study_plan V2 + tracker exports.
 * - XP values below are PLACEHOLDERS and freely tunable;
 *   history records snapshot xpEarned, so edits here never
 *   rewrite the past.
 * - maxMark values below are PLACEHOLDERS and freely tunable.
 */

import type { StudyConfig } from "./types";

export const STUDY_CONFIG: StudyConfig = {
  tasks: [
    // Core science paper tasks + everyday BPhO. XP placeholder, tunable.
    { id: "p-saq", name: "Physics SAQ", xp: 20, subjectId: "physics", core: true, active: true },
    { id: "c-saq", name: "Chemistry SAQ", xp: 20, subjectId: "chemistry", core: true, active: true },
    { id: "b-saq", name: "Biology SAQ", xp: 20, subjectId: "biology", core: true, active: true },
    { id: "p-mcq", name: "Physics MCQ", xp: 20, subjectId: "physics", core: true, active: true },
    { id: "c-mcq", name: "Chemistry MCQ", xp: 20, subjectId: "chemistry", core: true, active: true },
    { id: "b-mcq", name: "Biology MCQ", xp: 20, subjectId: "biology", core: true, active: true },
    // BPhO everyday task. XP placeholder, tunable.
    { id: "bpho", name: "BPhO", xp: 15, subjectId: "physics", core: true, active: true },
    // Non-core support tasks. XP placeholder, tunable.
    { id: "math", name: "Math / Extra Study", xp: 10, subjectId: "mathematics", core: false, active: true },
    { id: "review", name: "Pre-exam Review", xp: 10, core: false, active: true },
  ],

  subjects: [
    { id: "physics", name: "Physics", active: true },
    { id: "chemistry", name: "Chemistry", active: true },
    { id: "biology", name: "Biology", active: true },
    { id: "mathematics", name: "Mathematics", active: true },
    { id: "english-lit", name: "English Literature", active: true },
  ],

  // Papers mirror the subjects above.
  // maxMark values are PLACEHOLDERS and freely tunable:
  // SAQ 60, MCQ 40, Math 100, EngLit 60.
  papers: [
    { id: "physics-saq", subjectId: "physics", name: "Physics SAQ", maxMark: 60 },
    { id: "physics-mcq", subjectId: "physics", name: "Physics MCQ", maxMark: 40 },
    { id: "chemistry-saq", subjectId: "chemistry", name: "Chemistry SAQ", maxMark: 60 },
    { id: "chemistry-mcq", subjectId: "chemistry", name: "Chemistry MCQ", maxMark: 40 },
    { id: "biology-saq", subjectId: "biology", name: "Biology SAQ", maxMark: 60 },
    { id: "biology-mcq", subjectId: "biology", name: "Biology MCQ", maxMark: 40 },
    { id: "math-p1", subjectId: "mathematics", name: "Mathematics Paper 1", maxMark: 100 },
    { id: "math-p5", subjectId: "mathematics", name: "Mathematics Paper 5", maxMark: 100 },
    { id: "englit-p1", subjectId: "english-lit", name: "English Literature Paper 1", maxMark: 60 },
    { id: "englit-p2", subjectId: "english-lit", name: "English Literature Paper 2", maxMark: 60 },
  ],

  streakRepairCostXp: 25,

  contributionBuckets: [
    { minXp: 1, level: 1 },
    { minXp: 41, level: 2 },
    { minXp: 81, level: 3 },
    { minXp: 121, level: 4 },
  ],

  // 14 real exams from the Rules & Exams sheet.
  exams: [
    { id: "exam-englit-p1", name: "English Literature Paper 1", date: "2026-10-12" },
    { id: "exam-math-p1", name: "Mathematics Paper 1", date: "2026-10-13" },
    { id: "exam-physics-saq", name: "Physics SAQ", date: "2026-10-14" },
    { id: "exam-math-p5", name: "Mathematics Paper 5", date: "2026-10-15" },
    { id: "exam-chemistry-saq", name: "Chemistry SAQ", date: "2026-10-16" },
    { id: "exam-biology-saq", name: "Biology SAQ", date: "2026-10-20" },
    { id: "exam-physics-practical", name: "Physics Practical", date: "2026-10-22" },
    { id: "exam-englit-p2", name: "English Literature Paper 2", date: "2026-10-23" },
    { id: "exam-chemistry-practical", name: "Chemistry Practical", date: "2026-10-27" },
    { id: "exam-biology-practical", name: "Biology Practical", date: "2026-10-29" },
    { id: "exam-physics-mcq", name: "Physics MCQ", date: "2026-11-10" },
    { id: "exam-chemistry-mcq", name: "Chemistry MCQ", date: "2026-11-11" },
    { id: "exam-biology-mcq", name: "Biology MCQ", date: "2026-11-12" },
    { id: "exam-bpho-r1", name: "BPhO Round 1", date: "2026-11-16" },
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
