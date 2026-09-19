import { Progress } from "@heroui/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTask } from "@/study/config";
import type { QuotaProgress } from "@/study/types";

export function WeeklyCard({
  quotas,
  weekLabel,
}: {
  quotas: QuotaProgress[];
  weekLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          本周配额
          <span className="ml-2 text-xs font-normal tabular-nums text-muted-foreground">
            {weekLabel}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {quotas.map((q) => {
          const task = getTask(q.taskId);
          const pct = q.target > 0 ? Math.min(100, (q.completed / q.target) * 100) : 0;
          return (
            <div key={q.taskId} className={q.done ? "opacity-50" : ""}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <p className="text-sm font-medium">
                  {task?.name ?? q.taskId}
                  {q.done ? (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      已达标
                    </span>
                  ) : null}
                </p>
                <p className="text-[13px] tabular-nums text-muted-foreground">
                  {q.completed} / {q.target}
                </p>
              </div>
              <Progress
                aria-label={`${task?.name ?? q.taskId} weekly progress`}
                value={pct}
                color="primary"
                size="sm"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
