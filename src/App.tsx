import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Titlebar } from "@/components/titlebar";
import { CheckinCard } from "@/components/CheckinCard";
import { StreakCard } from "@/components/StreakCard";
import { WeeklyCard } from "@/components/WeeklyCard";
import { XpCard } from "@/components/XpCard";
import { ContributionGrid } from "@/components/ContributionGrid";
import { GradesCard } from "@/components/GradesCard";
import { FlipClock } from "@/components/FlipClock";
import { ExamSchedule } from "@/components/ExamSchedule";
import { nearestExam, upcomingExams } from "@/study/exams";
import { usePlanner } from "@/study/usePlanner";

function App() {
  const [dark, setDark] = useState(false);
  const [pinnedExamId, setPinnedExamId] = useState<string | null>(null);
  const p = usePlanner();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const doneIds = new Set(
    p.history.completions
      .filter((r) => r.date === p.today && r.fraction >= 1)
      .map((r) => r.taskId),
  );

  const exams = useMemo(() => upcomingExams(p.today), [p.today]);
  const pinned = exams.find((e) => e.id === pinnedExamId);
  const target = pinned && pinned.date >= p.today ? pinned : nearestExam(p.today);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Titlebar />
      <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-2.5">
        <div>
          <h1 className="text-[17px] font-bold tracking-tight">Planner</h1>
          <p className="text-xs tabular-nums text-muted-foreground">
            {p.today} · 今日 {p.todayXp} XP
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setDark((d) => !d)}
          aria-label="切换深色模式"
        >
          {dark ? <Sun /> : <Moon />}
        </Button>
      </header>

      {!p.loaded ? (
        <p className="p-6 text-sm text-muted-foreground">加载本地数据…</p>
      ) : (
        <main className="flex min-h-0 flex-1 gap-4 p-4">
          <section className="w-[300px] shrink-0 space-y-4 overflow-y-auto pb-2">
            <CheckinCard
              todayLabel={p.today}
              todayXp={p.todayXp}
              doneIds={doneIds}
              onToggle={p.toggleTask}
            />
            <WeeklyCard quotas={p.quotas} />
          </section>

          <section className="min-w-0 flex-1 space-y-4 overflow-y-auto pb-2">
            <FlipClock exam={target} />
            <div className="grid items-start gap-4 xl:grid-cols-5">
              <div className="space-y-4 xl:col-span-3">
                <StreakCard
                  current={p.streakNow}
                  best={p.streakBest}
                  repair={p.repair}
                  onRepair={p.repairYesterday}
                />
              </div>
              <div className="xl:col-span-2">
                <XpCard
                  today={p.todayXp}
                  week={p.weekXp}
                  month={p.monthXp}
                  total={p.totalXp}
                />
              </div>
            </div>
            <ContributionGrid xpOf={(d) => p.xpMap.get(d) ?? 0} />
            <GradesCard
              grades={p.history.grades}
              onAdd={p.addGrade}
              onDelete={p.deleteGrade}
            />
          </section>

          <aside className="w-[320px] shrink-0 overflow-y-auto pb-2">
            <ExamSchedule
              exams={exams}
              pinnedId={pinnedExamId}
              onPin={setPinnedExamId}
            />
          </aside>
        </main>
      )}
    </div>
  );
}

export default App;
