/* Exam schedule domain: upcoming list + nearest target, data-driven. */

import { STUDY_CONFIG } from "./config";
import type { ExamDefinition } from "./types";

/** Upcoming exams (date >= today), ascending. */
export function upcomingExams(today: string): ExamDefinition[] {
  return STUDY_CONFIG.exams
    .filter((e) => e.date >= today)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function nearestExam(today: string): ExamDefinition | undefined {
  return upcomingExams(today)[0];
}

export interface Countdown {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  totalMs: number;
}

function two(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Time left until local midnight of the exam date. */
export function countdownTo(exam: ExamDefinition, now: number): Countdown {
  const [y, m, d] = exam.date.split("-").map(Number);
  const totalMs = Math.max(0, new Date(y, m - 1, d).getTime() - now);
  const s = Math.floor(totalMs / 1000);
  return {
    days: two(Math.floor(s / 86400)),
    hours: two(Math.floor((s % 86400) / 3600)),
    minutes: two(Math.floor((s % 3600) / 60)),
    seconds: two(s % 60),
    totalMs,
  };
}
