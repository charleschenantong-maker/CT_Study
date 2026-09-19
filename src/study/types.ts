/*
 * Domain types for the Planner study tracker.
 *
 * Two worlds, never mixed:
 *  - TEMPLATE (StudyConfig in config.ts): disposable plan data, EDIT HERE.
 *  - HISTORY (records below): append-only user data, snapshots values
 *    (e.g. xpEarned) so template edits never rewrite the past.
 */

// ---------- TEMPLATE ----------

export interface SubjectDefinition {
  id: string;
  name: string;
  color?: string;
  active?: boolean;
}

export interface PaperDefinition {
  id: string;
  subjectId: string;
  name: string;
  maxMark: number;
}

export interface StudyTaskDefinition {
  id: string;
  name: string;
  /** XP granted for one full completion (template value; history snapshots it). */
  xp: number;
  subjectId?: string;
  category?: string;
  /** Core tasks decide streak days. */
  core?: boolean;
  /** Whether fraction < 1 completions are meaningful for this task. */
  allowPartial?: boolean;
  active?: boolean;
}

export interface WeeklyQuota {
  taskId: string;
  timesPerWeek: number;
}

/** Contribution-grid intensity bucket: xp >= minXp maps to level. */
export interface ContributionBucket {
  minXp: number;
  level: number;
}

export interface DailyTaskRef {
  type: string;
  label?: string;
}

export interface DailyPlanEntry {
  date: string;
  dayType: string;
  tasks: DailyTaskRef[];
  note?: string;
}

export interface StudyConfig {
  tasks: StudyTaskDefinition[];
  subjects: SubjectDefinition[];
  papers: PaperDefinition[];
  streakRepairCostXp: number;
  contributionBuckets: ContributionBucket[];
  exams: ExamDefinition[];
}

/** An upcoming exam. Template data; countdown/schedule render from here. */
export interface ExamDefinition {
  id: string;
  name: string;
  /** Local YYYY-MM-DD. */
  date: string;
  note?: string;
}

// ---------- HISTORY (append-only) ----------

/** One completion event. xpEarned is a snapshot, immune to later template edits. */
export interface TaskCompletionRecord {
  id: string;
  taskId: string;
  taskName: string;
  date: string; // local YYYY-MM-DD
  xpEarned: number;
  /** 0..1, 1 = full completion. */
  fraction: number;
  createdAt: number;
}

export interface GradeRecord {
  id: string;
  date: string; // local YYYY-MM-DD
  subjectId: string;
  paperId: string;
  raw: number;
  max: number;
  note?: string;
  createdAt: number;
}

export interface StreakRepairRecord {
  id: string;
  /** The missed day that was repaired (YYYY-MM-DD). */
  repairedDate: string;
  completedAt: number;
  xpSpent: number;
}

export interface PlannerHistory {
  completions: TaskCompletionRecord[];
  grades: GradeRecord[];
  repairs: StreakRepairRecord[];
}

// ---------- DERIVED (computed, never stored) ----------

export type DayStatus = "complete" | "repaired" | "missed";

export interface QuotaProgress {
  taskId: string;
  target: number;
  completed: number;
  remaining: number;
  done: boolean;
}

export interface GridCell {
  date: string;
  xp: number;
  level: number;
}
