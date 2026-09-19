import { Check, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTask } from "@/study/config";
import type { RepairEligibility } from "@/study/streak";
import type { DailyPlanEntry } from "@/study/types";

interface Props {
  doneIds: Set<string>;
  onToggle: (taskId: string, displayName?: string) => void;
  todayPlan: DailyPlanEntry | undefined;
  today: string;
  streakNow: number;
  streakBest: number;
  repair: RepairEligibility;
  onRepair: () => void;
}

export function CheckinCard({
  doneIds,
  onToggle,
  todayPlan,
  today,
  streakNow,
  streakBest,
  repair,
  onRepair,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>今日打卡</CardTitle>
        {todayPlan ? (
          <>
            <div className="flex items-center gap-2 pt-1">
              <span
                className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                  todayPlan.dayType === "Exam"
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {todayPlan.dayType}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {today}
              </span>
            </div>
            {todayPlan.note ? (
              <p className="text-xs text-muted-foreground">{todayPlan.note}</p>
            ) : null}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            计划外日期（{today}）· 显示全部任务
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        {todayPlan
          ? todayPlan.tasks.map((entry, i) => {
              const task = getTask(entry.type);
              const done = doneIds.has(entry.type);
              return (
                <div
                  key={`${entry.type}-${i}`}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${
                    done ? "opacity-55" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {entry.label ?? task?.name ?? entry.type}
                      {task?.core ? (
                        <span className="ml-2 rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                          核心
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs tabular-nums text-muted-foreground">
                      {task?.xp ?? 0} XP
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={done ? "secondary" : "default"}
                    onClick={() => onToggle(entry.type, entry.label)}
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
            })
          : (
            <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">
              计划外日期（{today}），暂无打卡任务
            </p>
          )}
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
