import { useEffect, useState } from "react";
import { Check, Flame } from "lucide-react";
import { Card as HeroCard, CardBody, CircularProgress } from "@heroui/react";
import { Button } from "@/components/ui/button";
import {
  Card as SCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Titlebar } from "@/components/titlebar";
import { TrendChart } from "@/components/trend-chart";

const records = [
  { date: "9月18日", note: "晨读 30 分钟 + 背单词", minutes: 38 },
  { date: "9月17日", note: "夜跑 5 公里", minutes: 42 },
  { date: "9月16日", note: "项目复盘 + 写作", minutes: 55 },
];

function App() {
  const [dark, setDark] = useState(false);
  const [checked, setChecked] = useState(false);
  const [streak, setStreak] = useState(6);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function toggleCheck() {
    setStreak((s) => (checked ? s - 1 : s + 1));
    setChecked((c) => !c);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Titlebar
        title="打卡"
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
      />
      <div className="flex-1 overflow-y-auto">
        <main className="mx-auto w-full max-w-3xl space-y-4 p-6">
          <p className="text-[13px] tabular-nums text-muted-foreground">
            9月18日 星期五 · 已连续 {streak} 天
          </p>

          <SCard>
            <CardHeader>
              <CardTitle>今日打卡</CardTitle>
              <CardDescription>每天一个小目标，坚持就会有变化</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="size-4 text-ios-orange" />
                <span className="text-4xl font-bold tabular-nums tracking-tight">
                  {streak}
                </span>
                <span className="self-end pb-1.5 text-[13px] text-muted-foreground">
                  天连续打卡
                </span>
              </div>
              <Button
                size="lg"
                variant={checked ? "secondary" : "default"}
                className="w-full rounded-full text-[15px]"
                onClick={toggleCheck}
              >
                {checked ? (
                  <>
                    <Check /> 今日已完成
                  </>
                ) : (
                  "打卡"
                )}
              </Button>
            </CardContent>
          </SCard>

          <div className="grid grid-cols-2 gap-4">
            <HeroCard shadow="none" className="rounded-xl border border-border">
              <CardBody className="flex flex-row items-center gap-4">
                <CircularProgress
                  aria-label="本周进度"
                  value={checked ? 100 : 80}
                  color="primary"
                  size="md"
                  strokeWidth={6}
                  showValueLabel
                  classNames={{
                    value: "text-[13px] font-semibold tabular-nums",
                  }}
                />
                <div>
                  <p className="text-[13px] text-muted-foreground">本周进度</p>
                  <p className="text-[15px] font-semibold tabular-nums">
                    {checked ? "5 / 5 天" : "4 / 5 天"}
                  </p>
                </div>
              </CardBody>
            </HeroCard>
            <HeroCard shadow="none" className="rounded-xl border border-border">
              <CardBody className="justify-center">
                <p className="text-[13px] text-muted-foreground">累计记录</p>
                <p className="text-[15px] font-semibold tabular-nums">
                  128 条 · 96 小时
                </p>
              </CardBody>
            </HeroCard>
          </div>

          <SCard>
            <CardHeader>
              <CardTitle>最近 14 天</CardTitle>
              <CardDescription>每日投入分钟数</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart />
            </CardContent>
          </SCard>

          <SCard className="overflow-hidden">
            <CardHeader>
              <CardTitle>最近记录</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {records.map((r) => (
                  <div
                    key={r.date}
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                  >
                    <div>
                      <p className="text-sm font-medium">{r.note}</p>
                      <p className="text-xs text-muted-foreground">{r.date}</p>
                    </div>
                    <span className="text-[13px] font-semibold tabular-nums">
                      {r.minutes}′
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </SCard>
        </main>
      </div>
    </div>
  );
}

export default App;
