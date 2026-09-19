import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
        {exams.map((e, i) => {
          const pinned = pinnedId === e.id;
          return (
            <div
              key={e.id}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5",
                i === 0 && "border-l-2 border-l-primary bg-primary/[0.06]",
              )}
            >
              <span className="w-16 shrink-0 text-[13px] font-bold tabular-nums">
                {examLabel(e.date)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {e.name}
              </span>
              <Button
                size="sm"
                variant={pinned ? "secondary" : "ghost"}
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
