import { useEffect, useMemo, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Titlebar } from "@/components/titlebar";
import { CheckinCard } from "@/components/CheckinCard";
import { WeeklyCard } from "@/components/WeeklyCard";
import { XpCard } from "@/components/XpCard";
import { ContributionGrid } from "@/components/ContributionGrid";
import { GradesCard } from "@/components/GradesCard";
import { FlipClock } from "@/components/FlipClock";
import { ExamSchedule } from "@/components/ExamSchedule";
import { nearestExam, upcomingExams } from "@/study/exams";
import { addDays, weekStart } from "@/study/dates";
import { usePlanner } from "@/study/usePlanner";

type Theme = "light" | "dark" | "system";

const THEMES: Array<{ v: Theme; Icon: typeof Sun; label: string }> = [
  { v: "light", Icon: Sun, label: "浅色" },
  { v: "dark", Icon: Moon, label: "深色" },
  { v: "system", Icon: Monitor, label: "跟随系统" },
];

function App() {
  const [theme, setTheme] = useState<Theme>("system");
  const [pinnedExamId, setPinnedExamId] = useState<string | null>(null);
  const p = usePlanner();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    if (theme === "system") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  const doneIds = new Set(
    p.history.completions
      .filter((r) => r.date === p.today && r.fraction >= 1)
      .map((r) => r.taskId),
  );

  const exams = useMemo(() => upcomingExams(p.today), [p.today]);
  const pinned = exams.find((e) => e.id === pinnedExamId);
  const target = pinned && pinned.date >= p.today ? pinned : nearestExam(p.today);
  // 每日/每周刷新靠 today key 派生（todayPlan/quotas/doneIds 均已按 today 计算），无需定时器。
  const weekMonday = weekStart(p.today);
  const weekLabel = `${weekMonday.slice(5)} ~ ${addDays(weekMonday, 6).slice(5)} · 本周`;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Titlebar />

      {!p.loaded ? (
        <p className="p-6 text-sm text-muted-foreground">加载本地数据…</p>
      ) : (
        <main className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-4 lg:grid-cols-[260px_minmax(0,1fr)_280px] lg:overflow-hidden min-[1400px]:grid-cols-[300px_minmax(0,1fr)_320px]">
          <section className="w-full min-w-0 space-y-4 lg:overflow-y-auto lg:pb-2">
            <p className="px-1 text-xs tabular-nums text-muted-foreground">
              {p.today} · 今日 {p.todayXp} XP
            </p>
            <CheckinCard
              doneIds={doneIds}
              onToggle={p.toggleTask}
              todayPlan={p.todayPlan}
              today={p.today}
              streakNow={p.streakNow}
              streakBest={p.streakBest}
              repair={p.repair}
              onRepair={p.repairYesterday}
            />
            <WeeklyCard quotas={p.quotas} weekLabel={weekLabel} />
            <XpCard
              today={p.todayXp}
              week={p.weekXp}
              month={p.monthXp}
              total={p.totalXp}
            />
          </section>

          <section className="w-full min-w-0 flex-1 space-y-4 lg:overflow-y-auto lg:pb-2">
            <div className="flex flex-col gap-3 min-[1700px]:flex-row">
              <div className="min-w-0 flex-1">
                <FlipClock exam={target} className="h-full" />
              </div>
              <div className="w-full shrink-0 min-[1700px]:w-[440px]">
              <ContributionGrid
                xpOf={(d) => p.xpMap.get(d) ?? 0}
                className="h-full"
              />
              </div>
            </div>
            <GradesCard
              grades={p.history.grades}
              today={p.today}
              onAdd={p.addGrade}
              onDelete={p.deleteGrade}
              onBulkDelete={p.deleteGrades}
            />
          </section>

          <aside className="w-full min-w-0 lg:overflow-y-auto lg:pb-2">
            <ExamSchedule
              exams={exams}
              pinnedId={pinnedExamId}
              onPin={setPinnedExamId}
            />
          </aside>
        </main>
      )}

      <div className="fixed bottom-5 right-5 z-50 flex items-center rounded-full border bg-card p-1 shadow-lg">
        {THEMES.map(({ v, Icon, label }) => (
          <button
            key={v}
            onClick={() => setTheme(v)}
            aria-label={label}
            title={label}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              theme === v
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
