import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Titlebar } from "@/components/titlebar";
import { CheckinCard } from "@/components/CheckinCard";
import { StreakCard } from "@/components/StreakCard";
import { WeeklyCard } from "@/components/WeeklyCard";
import { XpCard } from "@/components/XpCard";
import { ContributionGrid } from "@/components/ContributionGrid";
import { GradesCard } from "@/components/GradesCard";
import { usePlanner } from "@/study/usePlanner";

function App() {
  const [dark, setDark] = useState(false);
  const p = usePlanner();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const doneIds = new Set(
    p.history.completions
      .filter((r) => r.date === p.today && r.fraction >= 1)
      .map((r) => r.taskId),
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Titlebar />
      <div className="flex-1 overflow-y-auto">
        <main className="mx-auto w-full max-w-5xl space-y-4 p-6">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Planner</h1>
              <p className="text-[13px] tabular-nums text-muted-foreground">
                {p.today} · 今日 {p.todayXp} XP
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDark((d) => !d)}
              aria-label="切换深色模式"
            >
              {dark ? <Sun /> : <Moon />}
            </Button>
          </header>

          {!p.loaded ? (
            <p className="text-sm text-muted-foreground">加载本地数据…</p>
          ) : (
            <>
              <div className="grid items-start gap-4 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <CheckinCard
                    todayLabel={p.today}
                    todayXp={p.todayXp}
                    doneIds={doneIds}
                    onToggle={p.toggleTask}
                  />
                </div>
                <div className="space-y-4 lg:col-span-2">
                  <StreakCard
                    current={p.streakNow}
                    best={p.streakBest}
                    repair={p.repair}
                    onRepair={p.repairYesterday}
                  />
                  <XpCard
                    today={p.todayXp}
                    week={p.weekXp}
                    month={p.monthXp}
                    total={p.totalXp}
                  />
                </div>
              </div>

              <WeeklyCard quotas={p.quotas} />

              <ContributionGrid xpOf={(d) => p.xpMap.get(d) ?? 0} />

              <GradesCard grades={p.history.grades} onAdd={p.addGrade} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
