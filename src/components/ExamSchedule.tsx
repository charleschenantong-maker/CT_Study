import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExamDefinition } from "@/study/types";

interface Props {
  exams: ExamDefinition[];
  pinnedId: string | null;
  onPin: (id: string | null) => void;
}

function examLabel(date: string) {
  const [, m, d] = date.split("-");
  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];
  return `${Number(d)} ${months[Number(m) - 1]}`;
}

export function ExamSchedule({ exams, pinnedId, onPin }: Props) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>考试日程</CardTitle>
        <CardDescription>
          {exams.length > 0 ? `接下来 ${exams.length} 场` : "暂无安排"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 p-2">
        {exams.map((e) => {
          const pinned = pinnedId === e.id;
          return (
            <div
              key={e.id}
              className={
                pinned
                  ? "flex items-center gap-3 rounded-xl px-3 py-2.5 bg-primary/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.14)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.55)]"
                  : "flex items-center gap-3 rounded-xl px-3 py-2.5"
              }
            >
              <span className="w-16 shrink-0 text-[13px] font-bold tabular-nums">
                {examLabel(e.date)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {e.name}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 shrink-0 px-2 text-xs"
                onClick={() => onPin(pinned ? null : e.id)}
              >
                {pinned ? "目标中" : "设为目标"}
              </Button>
            </div>
          );
        })}
        {exams.length === 0 ? (
          <p className="px-3 py-4 text-[13px] text-muted-foreground">
            在 study/config.ts 的 exams 里添加
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
