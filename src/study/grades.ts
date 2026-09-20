import { monthStart, shortLabel, weekStart } from "./dates";
import type { GradeRecord } from "./types";

/**
 * 成绩域逻辑（原 GradesCard 内联计算，无 UI）：
 * 图表点映射 / 范围过滤 / 批量删除选集 / 录入校验。
 * 校验返回 i18n key（grade.err*），插值与提示由未来 UI 层做。
 */

export type GradeRange = "all" | "today" | "week" | "month";

export interface GradePoint {
  id: string;
  /** 短标签如 "9/18"（原 shortLabel 映射）。 */
  date: string;
  /** 百分比，保留 1 位小数。 */
  pct: number;
  raw: number;
  max: number;
  note?: string;
}

/** 科目+试卷过滤，按日期正序，映射为图表点。 */
export function toChartPoints(
  grades: GradeRecord[],
  subjectId: string,
  paperId: string,
): GradePoint[] {
  return grades
    .filter((g) => g.subjectId === subjectId && (!paperId || g.paperId === paperId))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.createdAt - b.createdAt))
    .map((g) => ({
      id: g.id,
      date: shortLabel(g.date),
      pct: Math.round((g.raw / g.max) * 1000) / 10,
      raw: g.raw,
      max: g.max,
      note: g.note,
    }));
}

/** 范围起点：today/weekStart/monthStart（all 返回 "" 即不过滤）。 */
export function rangeStart(range: GradeRange, today: string): string {
  if (range === "today") return today;
  if (range === "week") return weekStart(today);
  if (range === "month") return monthStart(today);
  return "";
}

/** 最近 N 条（默认 8），日期倒序。 */
export function recentGrades(
  grades: GradeRecord[],
  range: GradeRange,
  today: string,
  limit = 8,
): GradeRecord[] {
  const from = rangeStart(range, today);
  return [...grades]
    .filter((g) => !from || g.date >= from)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt))
    .slice(0, limit);
}

/** 批量删除选集：today/week/month 范围内的 id（原 idsIn + bulkDelete 确认前半段）。 */
export function idsInRange(
  grades: GradeRecord[],
  which: Exclude<GradeRange, "all">,
  today: string,
): string[] {
  const from = rangeStart(which, today);
  return grades.filter((g) => g.date >= from).map((g) => g.id);
}

export type GradeErrorKey =
  | "grade.errEmpty"
  | "grade.errIncomplete"
  | "grade.errNumber"
  | "grade.errExceed";

export interface GradeInput {
  raw: string;
  subjectId: string;
  paperId: string;
  /** 试卷满分；找不到试卷时传 null（原 !paper 分支）。 */
  paperMax: number | null;
  date: string;
}

/** 录入校验：返回错误 key，无错返回 null（原 GradeForm.submit）。 */
export function validateGradeInput(input: GradeInput): GradeErrorKey | null {
  if (input.raw.trim() === "") return "grade.errEmpty";
  const r = Number(input.raw);
  if (!input.subjectId || !input.paperId || input.paperMax === null || !input.date) {
    return "grade.errIncomplete";
  }
  if (!Number.isFinite(r) || r < 0) return "grade.errNumber";
  if (r > input.paperMax) return "grade.errExceed";
  return null;
}
