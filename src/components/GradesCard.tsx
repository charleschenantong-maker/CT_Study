import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
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
import { t, type Lang, type StrKey } from "@/settings/i18n";
import { monthStart, shortLabel, todayKey, weekStart } from "@/study/dates";
import type { GradeRecord } from "@/study/types";

interface Point {
  id: string;
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
  lang: Lang;
}) {
  if (!props.active || !props.payload?.length) return null;
  const d = props.payload[0].payload;
  return (
    <div className="rounded-xl border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold tabular-nums">
        {d.raw}
        {t(props.lang, "grade.scoreUnit")}（{d.pct}%）
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
  lang: Lang;
}

function GradeForm({ onAdd, lang }: FormProps) {
  const [subjectId, setSubjectId] = useState(STUDY_CONFIG.subjects[0]?.id ?? "");
  const papers = STUDY_CONFIG.papers.filter((p) => p.subjectId === subjectId);
  const [paperId, setPaperId] = useState(papers[0]?.id ?? "");
  const paper = getPaper(paperId);
  const [date, setDate] = useState(todayKey());
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");

  function pickSubject(id: string) {
    setSubjectId(id);
    const first = STUDY_CONFIG.papers.find((p) => p.subjectId === id);
    setPaperId(first?.id ?? "");
  }

  function pickPaper(id: string) {
    setPaperId(id);
  }

  function submit() {
    if (raw.trim() === "") {
      setError(t(lang, "grade.errEmpty"));
      return;
    }
    const r = Number(raw);
    const m = paper?.maxMark ?? 0;
    if (!subjectId || !paperId || !paper || !date) {
      setError(t(lang, "grade.errIncomplete"));
      return;
    }
    if (!Number.isFinite(r) || r < 0) {
      setError(t(lang, "grade.errNumber"));
      return;
    }
    if (r > m) {
      setError(
        t(lang, "grade.errExceed")
          .replace("{r}", String(r))
          .replace("{m}", String(m)),
      );
      return;
    }
    setError("");
    onAdd({ date, subjectId, paperId, raw: r, max: m });
    setRaw("");
  }

  const field =
    "h-9 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-xs text-muted-foreground">
          {t(lang, "grade.date")}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={field}
          />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          {t(lang, "grade.subject")}
          <select value={subjectId} onChange={(e) => pickSubject(e.target.value)} className={field}>
            {STUDY_CONFIG.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          {t(lang, "grade.paper")}
          <select value={paperId} onChange={(e) => pickPaper(e.target.value)} className={field}>
            {papers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          {t(lang, "grade.score")}
          <input
            type="number"
            min={0}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="57"
            className={field}
          />
        </label>
        <div className="flex items-end pb-0.5 text-xs tabular-nums text-muted-foreground">
          {t(lang, "grade.maxPrefix")}
          {paper ? paper.maxMark : "—"}
          {t(lang, "grade.presetSuffix")}
        </div>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <Button size="sm" className="w-full" onClick={submit}>
        <Plus /> {t(lang, "grade.submit")}
      </Button>
    </div>
  );
}

interface Props {
  grades: GradeRecord[];
  today: string;
  onAdd: FormProps["onAdd"];
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  lang: Lang;
}

type Range = "all" | "today" | "week" | "month";

const RANGE_LABEL_KEYS: Record<Range, StrKey> = {
  all: "grade.all",
  today: "grade.rangeToday",
  week: "grade.rangeWeek",
  month: "grade.rangeMonth",
};

const RANGE_NAME_KEYS: Record<Exclude<Range, "all">, StrKey> = {
  today: "grade.rangeToday",
  week: "grade.rangeWeek",
  month: "grade.rangeMonth",
};

const DELETE_WINDOW_MS = 5 * 60 * 1000;

export function GradesCard({ grades, today, onAdd, onDelete, onBulkDelete, lang }: Props) {
  const [subjectId, setSubjectId] = useState(STUDY_CONFIG.subjects[0]?.id ?? "");
  const [paperId, setPaperId] = useState("");
  const [range, setRange] = useState<Range>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"list" | "detail">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function openList() {
    setSelectedId(null);
    setModalView("list");
    setModalOpen(true);
  }

  function openDetail(id: string) {
    setSelectedId(id);
    setModalView("detail");
    setModalOpen(true);
  }

  function backToList() {
    setSelectedId(null);
    setModalView("list");
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedId(null);
    setModalView("list");
  }

  useEffect(() => {
    if (!modalOpen) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [modalOpen]);

  const selected = selectedId
    ? (grades.find((g) => g.id === selectedId) ?? null)
    : null;

  const papers = STUDY_CONFIG.papers.filter((p) => p.subjectId === subjectId);
  const points: Point[] = useMemo(
    () =>
      grades
        .filter((g) => g.subjectId === subjectId && (!paperId || g.paperId === paperId))
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.createdAt - b.createdAt))
        .map((g) => ({
          id: g.id,
          date: shortLabel(g.date),
          pct: Math.round((g.raw / g.max) * 1000) / 10,
          raw: g.raw,
          max: g.max,
          note: g.note,
        })),
    [grades, subjectId, paperId],
  );

  function idsIn(which: Exclude<Range, "all">): string[] {
    const from = which === "today" ? today : which === "week" ? weekStart(today) : monthStart(today);
    return grades.filter((g) => g.date >= from).map((g) => g.id);
  }

  function bulkDelete(which: Exclude<Range, "all">, label: string) {
    const ids = idsIn(which);
    if (ids.length === 0) return;
    if (
      window.confirm(
        t(lang, "grade.bulkConfirm")
          .replace("{label}", label)
          .replace("{n}", String(ids.length)),
      )
    ) {
      onBulkDelete(ids);
    }
  }

  const recent = useMemo(() => {
    const from =
      range === "today"
        ? today
        : range === "week"
          ? weekStart(today)
          : range === "month"
            ? monthStart(today)
            : "";
    return [...grades]
      .filter((g) => !from || g.date >= from)
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt))
      .slice(0, 8);
  }, [grades, range, today]);

  const field =
    "h-8 rounded-lg border border-input bg-card px-2 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(lang, "grade.title")}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 min-[1300px]:grid-cols-[280px_1fr]">
        <GradeForm onAdd={onAdd} lang={lang} />
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
              <option value="">{t(lang, "grade.allPapers")}</option>
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
                  <Tooltip content={<GradeTip lang={lang} />} />
                  <Line
                    type="monotone"
                    dataKey="pct"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={(p: {
                      cx?: number;
                      cy?: number;
                      payload?: Point;
                    }) => (
                      <circle
                        cx={p.cx}
                        cy={p.cy}
                        r={5}
                        fill="var(--chart-1)"
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (p.payload?.id) openDetail(p.payload.id);
                        }}
                      />
                    )}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-10 text-center text-[13px] text-muted-foreground">
              {t(lang, "grade.emptyChart")}
            </p>
          )}
          <Button variant="outline" className="w-full" onClick={openList}>
            {t(lang, "grade.records")}
          </Button>
        </div>
      </CardContent>
      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {modalView === "detail" && selected ? (
              <div className="flex min-h-0 flex-col">
                <div className="flex items-center justify-between border-b p-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-[13px]"
                    onClick={backToList}
                  >
                    <ArrowLeft /> {t(lang, "grade.back")}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={closeModal}
                    aria-label={t(lang, "common.close")}
                  >
                    <X />
                  </Button>
                </div>
                <div className="overflow-y-auto p-5">
                  <p className="text-[15px] font-semibold">
                    {getSubject(selected.subjectId)?.name} ·{" "}
                    {getPaper(selected.paperId)?.name}
                  </p>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t(lang, "grade.detailDate")}</span>
                      <span className="tabular-nums">{selected.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t(lang, "grade.detailScore")}</span>
                      <span className="font-semibold tabular-nums">
                        {selected.raw}
                        {t(lang, "grade.scoreUnit")} · {Math.round((selected.raw / selected.max) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t(lang, "grade.detailTime")}</span>
                      <span className="tabular-nums">
                        {new Date(selected.createdAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US", {
                          hour12: false,
                        })}
                      </span>
                    </div>
                    {selected.note ? (
                      <div className="flex justify-between gap-4">
                        <span className="shrink-0 text-muted-foreground">{t(lang, "grade.detailNote")}</span>
                        <span className="text-right">{selected.note}</span>
                      </div>
                    ) : null}
                  </div>
                  <Button className="mt-4 w-full" onClick={closeModal}>
                    {t(lang, "grade.closeBtn")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-col">
                <div className="flex items-center justify-between border-b p-4">
                  <p className="text-[15px] font-semibold">{t(lang, "grade.records")}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={closeModal}
                    aria-label={t(lang, "common.close")}
                  >
                    <X />
                  </Button>
                </div>
                <div className="min-h-0 overflow-y-auto p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex gap-1">
                      {(Object.keys(RANGE_LABEL_KEYS) as Range[]).map((r) => (
                        <Button
                          key={r}
                          size="sm"
                          variant={range === r ? "secondary" : "ghost"}
                          className="h-7 px-2.5 text-xs"
                          onClick={() => setRange(r)}
                        >
                          {t(lang, RANGE_LABEL_KEYS[r])}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      {(
                        [
                          ["today", "grade.delToday"],
                          ["week", "grade.delWeek"],
                          ["month", "grade.delMonth"],
                        ] as Array<[Exclude<Range, "all">, StrKey]>
                      ).map(([w, delKey]) => (
                        <Button
                          key={w}
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => bulkDelete(w, t(lang, RANGE_NAME_KEYS[w]))}
                        >
                          {t(lang, delKey)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 divide-y divide-border">
                    {recent.map((g) => {
                      const deletable = Date.now() - g.createdAt <= DELETE_WINDOW_MS;
                      const pct = Math.round((g.raw / g.max) * 100);
                      return (
                        <div
                          key={g.id}
                          onClick={() => {
                            setSelectedId(g.id);
                            setModalView("detail");
                          }}
                          className="flex cursor-pointer items-center justify-between py-2"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {getSubject(g.subjectId)?.name} · {getPaper(g.paperId)?.name}
                            </p>
                            <p className="text-xs tabular-nums text-muted-foreground">{g.date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold tabular-nums">
                              {g.raw}
                              {t(lang, "grade.scoreUnit")} · {pct}%
                            </span>
                            {deletable ? (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(g.id);
                                }}
                                aria-label={t(lang, "grade.delAria")}
                              >
                                <Trash2 />
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                    {recent.length === 0 ? (
                      <p className="py-6 text-center text-[13px] text-muted-foreground">
                        {t(lang, "grade.emptyRange")}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
