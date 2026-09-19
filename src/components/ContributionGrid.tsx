import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { todayKey } from "@/study/dates";
import { buildGrid } from "@/study/grid";

const WEEKS = 26;

const LEVELS = [
  "bg-black/[0.06] dark:bg-white/10",
  "bg-[#9BE9A8] dark:bg-[#0E4429]",
  "bg-[#40C463] dark:bg-[#006D32]",
  "bg-[#30A14E] dark:bg-[#26A641]",
  "bg-[#216E39] dark:bg-[#39D353]",
];

function levelClass(level: number) {
  return LEVELS[Math.min(Math.max(level, 0), LEVELS.length - 1)];
}

interface Tip {
  x: number;
  y: number;
  date: string;
  xp: number;
}

export function ContributionGrid({
  xpOf,
  className,
}: {
  xpOf: (date: string) => number;
  className?: string;
}) {
  const today = todayKey();
  const weeks = buildGrid(today, WEEKS, xpOf);
  const [tip, setTip] = useState<Tip | null>(null);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <div>
            <CardTitle>投入日历</CardTitle>
            <CardDescription>过去 {WEEKS} 周 · 颜色越深投入越多</CardDescription>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            少
            {LEVELS.map((c, i) => (
              <span key={i} className={cn("size-[11px] rounded-[3px]", c)} />
            ))}
            多
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto" onMouseLeave={() => setTip(null)}>
        <div className="flex gap-[3px]">
          {weeks.map((w, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {w.days.map((d) => (
                <span
                  key={d.date}
                  onMouseEnter={(e) =>
                    setTip({ x: e.clientX, y: e.clientY, date: d.date, xp: d.xp })
                  }
                  onMouseLeave={() => setTip(null)}
                  className={cn(
                    "size-3 rounded-[3px]",
                    levelClass(d.level),
                    d.date === today && "ring-1 ring-black/60 dark:ring-white/70",
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
      {tip ? (
        <div
          className="pointer-events-none fixed z-50 whitespace-nowrap rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-lg"
          style={{ left: tip.x, top: tip.y - 12, transform: "translate(-50%, -100%)" }}
        >
          <span className="tabular-nums text-muted-foreground">{tip.date}</span>{" "}
          <span className="font-semibold tabular-nums">{tip.xp} XP</span>
        </div>
      ) : null}
    </Card>
  );
}
