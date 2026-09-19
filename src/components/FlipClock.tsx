import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExamDefinition } from "@/study/types";

export function FlipClock({ exam }: { exam: ExamDefinition | undefined }) {
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

  const [y, m, d] = exam.date.split("-").map(Number);
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
      <CardContent className="flex justify-center overflow-x-auto py-2">
        <FlipClockCountdown
          to={new Date(y, m - 1, d).getTime()}
          labels={["天", "时", "分", "秒"]}
          labelStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
          digitBlockStyle={{ width: 42, height: 62, fontSize: 30 }}
          duration={0.5}
          hideOnComplete={false}
        />
      </CardContent>
    </Card>
  );
}
