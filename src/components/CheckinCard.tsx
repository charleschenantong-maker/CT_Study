import { Check, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STUDY_CONFIG } from "@/study/config";

interface Props {
  todayLabel: string;
  todayXp: number;
  doneIds: Set<string>;
  onToggle: (taskId: string) => void;
}

export function CheckinCard({ todayLabel, todayXp, doneIds, onToggle }: Props) {
  const tasks = [...STUDY_CONFIG.tasks]
    .filter((t) => t.active !== false)
    .sort((a, b) => Number(b.core ?? false) - Number(a.core ?? false));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <div>
            <CardTitle>今日打卡</CardTitle>
            <CardDescription>{todayLabel}</CardDescription>
          </div>
          <div className="flex items-center gap-1 text-[15px] font-bold tabular-nums">
            <Flame className="size-4 text-ios-orange" />
            {todayXp} XP
          </div>
        </div>
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
    </Card>
  );
}
