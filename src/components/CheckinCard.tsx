import { Check, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STUDY_CONFIG } from "@/study/config";
import type { RepairEligibility } from "@/study/streak";

interface Props {
  doneIds: Set<string>;
  onToggle: (taskId: string) => void;
  streakNow: number;
  streakBest: number;
  repair: RepairEligibility;
  onRepair: () => void;
}

export function CheckinCard({
  doneIds,
  onToggle,
  streakNow,
  streakBest,
  repair,
  onRepair,
}: Props) {
  const tasks = [...STUDY_CONFIG.tasks]
    .filter((t) => t.active !== false)
    .sort((a, b) => Number(b.core ?? false) - Number(a.core ?? false));

  return (
    <Card>
      <CardHeader>
        <CardTitle>今日打卡</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {tasks.map((t) => {
          const done = doneIds.has(t.id);
          return (
            <div
              key={t.id}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${
                done ? "opacity-55" : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium">
                  {t.name}
                  {t.core ? (
                    <span className="ml-2 rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                      核心
                    </span>
                  ) : null}
                </p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {t.xp} XP
                </p>
              </div>
              <Button
                size="sm"
                variant={done ? "secondary" : "default"}
                onClick={() => onToggle(t.id)}
              >
                {done ? (
                  <>
                    <Check /> 已完成
                  </>
                ) : (
                  "打卡"
                )}
              </Button>
            </div>
          );
        })}
      </CardContent>

      <div className="mx-5 border-t border-border" />

      <CardContent className="space-y-3 pt-4">
        <div className="flex items-center gap-3">
          <Flame className="size-10 text-ios-orange" />
          <div>
            <p className="text-3xl font-bold tabular-nums leading-none">
              {streakNow}
              <span className="ml-1 text-sm font-medium text-muted-foreground">天</span>
            </p>
            <p className="mt-1 text-xs tabular-nums text-muted-foreground">
              连续打卡 · 历史最长 {streakBest} 天
            </p>
          </div>
        </div>
        {repair.eligible ? (
          <div className="space-y-2 rounded-xl bg-primary/[0.07] p-3">
            <p className="text-[13px]">
              昨日断签，可用今日额外 {repair.cost} XP 修复
            </p>
            <Button size="sm" className="w-full" onClick={onRepair}>
              修复昨日
            </Button>
          </div>
        ) : repair.reason ? (
          <p className="text-xs text-muted-foreground">{repair.reason}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
