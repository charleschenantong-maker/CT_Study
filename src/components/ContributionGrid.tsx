import { useMemo } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import "react-activity-calendar/tooltips.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { levelForXp } from "@/study/grid";

const LIGHT = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
const DARK = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

export function ContributionGrid({
  xpMap,
  dark,
  className,
}: {
  xpMap: Map<string, number>;
  dark: boolean;
  className?: string;
}) {
  const data = useMemo(
    () =>
      [...xpMap.entries()]
        .filter(([, xp]) => xp > 0)
        .map(([date, xp]) => ({ date, count: xp, level: levelForXp(xp) })),
    [xpMap],
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>投入日历</CardTitle>
        <CardDescription>颜色越深投入越多 · 悬浮查看每日投入</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <ActivityCalendar
          data={data}
          theme={{ light: LIGHT, dark: DARK }}
          colorScheme={dark ? "dark" : "light"}
          blockSize={12}
          blockMargin={3}
          blockRadius={3}
          fontSize={12}
          weekStart={1}
          labels={{
            totalCount: "{{count}} XP · 过去一年",
            legend: { less: "少", more: "多" },
          }}
        />
      </CardContent>
    </Card>
  );
}
