import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STUDY_CONFIG, getPaper, getSubject } from "@/study/config";
import { shortLabel, todayKey } from "@/study/dates";
import type { GradeRecord } from "@/study/types";

interface Point {
  date: string;
  pct: number;
  raw: number;
  max: number;
  note?: string;
}

function GradeTip(props: {
  active?: boolean;
  payload?: Array<{ payload: Point }>;
  label?: string;
}) {
  if (!props.active || !props.payload?.length) return null;
  const d = props.payload[0].payload;
  return (
    <div className="rounded-xl border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold tabular-nums">
        {d.raw} / {d.max}（{d.pct}%）
      </p>
      <p className="text-muted-foreground">{props.label}</p>
      {d.note ? <p className="mt-0.5 text-muted-foreground">{d.note}</p> : null}
    </div>
  );
}

interface FormProps {
  onAdd: (input: {
    date: string;
    subjectId: string;
    paperId: string;
    raw: number;
    max: number;
    note?: string;
  }) => void;
}

function GradeForm({ onAdd }: FormProps) {
  const [subjectId, setSubjectId] = useState(STUDY_CONFIG.subjects[0]?.id ?? "");
  const papers = STUDY_CONFIG.papers.filter((p) => p.subjectId === subjectId);
  const [paperId, setPaperId] = useState(papers[0]?.id ?? "");
  const paper = getPaper(paperId);
  const [date, setDate] = useState(todayKey());
  const [raw, setRaw] = useState("");
  const [max, setMax] = useState(paper ? String(paper.maxMark) : "");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function pickSubject(id: string) {
    setSubjectId(id);
    const first = STUDY_CONFIG.papers.find((p) => p.subjectId === id);
    setPaperId(first?.id ?? "");
    setMax(first ? String(first.maxMark) : "");
  }

  function pickPaper(id: string) {
    setPaperId(id);
    const p = getPaper(id);
    if (p) setMax(String(p.maxMark));
  }

  function submit() {
    const r = Number(raw);
    const m = Number(max);
    if (!subjectId || !paperId || !date) {
      setError("请完整选择科目、试卷和日期");
      return;
    }
    if (!Number.isFinite(r) || !Number.isFinite(m) || m <= 0 || r < 0) {
      setError("分数必须是 ≥ 0 的数字，满分必须 > 0");
      return;
    }
    if (r > m) {
      setError(`得分 ${r} 超过满分 ${m}`);
      return;
    }
    setError("");
    onAdd({ date, subjectId, paperId, raw: r, max: m, note: note || undefined });
    setRaw("");
    setNote("");
  }

  const field =
    "h-9 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-xs text-muted-foreground">
          日期
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={field}
          />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          科目
          <select value={subjectId} onChange={(e) => pickSubject(e.target.value)} className={field}>
            {STUDY_CONFIG.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          试卷
          <select value={paperId} onChange={(e) => pickPaper(e.target.value)} className={field}>
            {papers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          备注（可选）
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="错因 / 心态…"
            className={field}
          />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          得分
          <input
            type="number"
            min={0}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="57"
            className={field}
          />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          满分
          <input
            type="number"
            min={1}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className={field}
          />
        </label>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <Button size="sm" className="w-full" onClick={submit}>
        <Plus /> 录入成绩
      </Button>
    </div>
  );
}

interface Props {
  grades: GradeRecord[];
  onAdd: FormProps["onAdd"];
  onDelete: (id: string) => void;
}

const DELETE_WINDOW_MS = 5 * 60 * 1000;

export function GradesCard({ grades, onAdd, onDelete }: Props) {
  const [subjectId, setSubjectId] = useState(STUDY_CONFIG.subjects[0]?.id ?? "");
  const [paperId, setPaperId] = useState("");

  const papers = STUDY_CONFIG.papers.filter((p) => p.subjectId === subjectId);
  const points: Point[] = useMemo(
    () =>
      grades
        .filter((g) => g.subjectId === subjectId && (!paperId || g.paperId === paperId))
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.createdAt - b.createdAt))
        .map((g) => ({
          date: shortLabel(g.date),
          pct: Math.round((g.raw / g.max) * 1000) / 10,
          raw: g.raw,
          max: g.max,
          note: g.note,
        })),
    [grades, subjectId, paperId],
  );

  const recent = [...grades]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt))
    .slice(0, 5);

  const field =
    "h-8 rounded-lg border border-input bg-card px-2 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <Card>
      <CardHeader>
        <CardTitle>成绩追踪</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <GradeForm onAdd={onAdd} />
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setPaperId("");
              }}
              className={field}
            >
              {STUDY_CONFIG.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select value={paperId} onChange={(e) => setPaperId(e.target.value)} className={field}>
              <option value="">全部试卷</option>
              {papers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {points.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -14 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    width={38}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip content={<GradeTip />} />
                  <Line
                    type="monotone"
                    dataKey="pct"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--chart-1)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-10 text-center text-[13px] text-muted-foreground">
              暂无成绩，先在左侧录入一条
            </p>
          )}
          <div className="divide-y divide-border">
            {recent.map((g) => {
              const deletable = Date.now() - g.createdAt <= DELETE_WINDOW_MS;
              return (
                <div key={g.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">
                      {getSubject(g.subjectId)?.name} · {getPaper(g.paperId)?.name}
                    </p>
                    <p className="text-xs tabular-nums text-muted-foreground">
                      {g.date}
                      {g.note ? ` · ${g.note}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold tabular-nums">
                      {g.raw}/{g.max} · {Math.round((g.raw / g.max) * 100)}%
                    </span>
                    {deletable ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(g.id)}
                        aria-label="删除这条成绩（5分钟内）"
                      >
                        <Trash2 />
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
