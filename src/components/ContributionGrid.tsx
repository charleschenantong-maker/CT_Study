import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { t, type Lang } from "@/settings/i18n";
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

interface Tip {
  x: number;
  y: number;
  date: string;
  xp: number;
}

export function ContributionGrid({
  xpOf,
  className,
  lang = "zh",
}: {
  xpOf: (date: string) => number;
  className?: string;
  lang?: Lang;
}) {
  const today = todayKey();
  const weeks = buildGrid(today, WEEKS, xpOf);
  const [tip, setTip] = useState<Tip | null>(null);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <div>
            <CardTitle>{t(lang, "cal.title")}</CardTitle>
            <CardDescription>{t(lang, "cal.descPrefix")}{WEEKS}{t(lang, "cal.descMid")}</CardDescription>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            {t(lang, "cal.less")}
            {LEVELS.map((c, i) => (
              <span key={i} className={cn("size-[11px] rounded-[3px]", c)} />
            ))}
            {t(lang, "cal.more")}
          </div>
        </div>
      </CardHeader>
      <CardContent
        className="flex justify-safe-center overflow-x-auto"
        onMouseLeave={() => setTip(null)}
      >
        <div className="flex w-max gap-[3px]">
          {weeks.map((w, wi) => (
            <div key={wi} className="flex shrink-0 flex-col gap-[3px]">
              {w.days.map((d) => (
                <span
                  key={d.date}
                  onMouseEnter={(e) =>
                    setTip({ x: e.clientX, y: e.clientY, date: d.date, xp: d.xp })
                  }
                  onMouseLeave={() => setTip(null)}
                  className={cn(
                    "size-3 shrink-0 rounded-[3px]",
                    LEVELS[Math.min(Math.max(d.level, 0), LEVELS.length - 1)],
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
