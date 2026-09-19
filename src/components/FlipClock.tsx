import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { t, type Lang } from "@/settings/i18n";
import type { ExamDefinition } from "@/study/types";

export function FlipClock({
  exam,
  className,
  lang = "zh",
}: {
  exam: ExamDefinition | undefined;
  className?: string;
  lang?: Lang;
}) {
  if (!exam) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t(lang, "clock.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t(lang, "clock.empty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const [y, m, d] = exam.date.split("-").map(Number);
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <CardTitle>{t(lang, "clock.until").replace("{name}", exam.name)}</CardTitle>
          <span className="text-[13px] tabular-nums text-muted-foreground">
            {exam.date}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex justify-center overflow-x-auto py-2">
        <FlipClockCountdown
          to={new Date(y, m - 1, d).getTime()}
          labels={[t(lang, "clock.d"), t(lang, "clock.h"), t(lang, "clock.min"), t(lang, "clock.s")]}
          labelStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
          digitBlockStyle={{ width: 56, height: 76, fontSize: 38 }}
          duration={0.5}
          hideOnComplete={false}
        />
      </CardContent>
    </Card>
  );
}
