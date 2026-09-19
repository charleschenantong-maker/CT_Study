import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { countdownTo } from "@/study/exams";
import type { ExamDefinition } from "@/study/types";

function FlipUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="[perspective:200px]"
        aria-label={`${label} ${value}`}
        role="timer"
      >
        <div
          key={value}
          className="flip-tick min-w-[64px] rounded-xl bg-black px-2 py-3 text-center text-4xl font-bold tabular-nums text-white dark:bg-white dark:text-black"
        >
          {value}
        </div>
      </div>
      <span className="text-[11px] tabular-nums text-muted-foreground">{label}</span>
    </div>
  );
}

export function FlipClock({ exam }: { exam: ExamDefinition | undefined }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!exam) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>考试倒计时</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            暂无 upcoming 考试，去配置里加（study/config.ts → exams）
          </p>
        </CardContent>
      </Card>
    );
  }

  const c = countdownTo(exam, now);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <CardTitle>距离 {exam.name}</CardTitle>
          <span className="text-[13px] tabular-nums text-muted-foreground">
            {exam.date}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-center gap-2 sm:gap-3">
          <FlipUnit value={c.days} label="天" />
          <span className="pt-3 text-2xl font-bold text-muted-foreground">:</span>
          <FlipUnit value={c.hours} label="时" />
          <span className="pt-3 text-2xl font-bold text-muted-foreground">:</span>
          <FlipUnit value={c.minutes} label="分" />
          <span className="pt-3 text-2xl font-bold text-muted-foreground">:</span>
          <FlipUnit value={c.seconds} label="秒" />
        </div>
      </CardContent>
    </Card>
  );
}
