import { useEffect, useState } from "react";
import { Check, Flame, Moon, Sun } from "lucide-react";
import { Card as HeroCard, CardBody, CircularProgress } from "@heroui/react";
import { Button } from "@/components/ui/button";
import {
  Card as SCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-4 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">打卡</h1>
          <p className="text-[13px] text-muted-foreground">
            9月18日 星期五 · 已连续 {streak} 天
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDark((d) => !d)}
          aria-label="切换深色模式"
        >
          {dark ? <Sun /> : <Moon />}
        </Button>
      </header>

      <SCard>
        <CardHeader>
          <CardTitle>今日打卡</CardTitle>
          <CardDescription>每天一个小目标，坚持就会有变化</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[15px] font-semibold">
            <Flame className="size-5 text-ios-orange" />
            连续 {streak} 天
          </div>
          <Button onClick={toggleCheck}>
            {checked ? (
              <>
                <Check /> 已打卡
              </>
            ) : (
              "打卡"
            )}
          </Button>
        </CardContent>
      </SCard>

      <div className="grid grid-cols-2 gap-4">
        <HeroCard shadow="sm" className="rounded-2xl">
          <CardBody className="flex flex-row items-center gap-4">
            <CircularProgress
              value={checked ? 100 : 62}
              color="primary"
              showValueLabel
              size="lg"
            />
            <div>
              <p className="text-[13px] text-muted-foreground">本周进度</p>
              <p className="text-[15px] font-semibold">
                {checked ? "5 / 5 天" : "4 / 5 天"}
              </p>
            </div>
          </CardBody>
        </HeroCard>
        <HeroCard shadow="sm" className="rounded-2xl">
          <CardBody className="justify-center">
            <p className="text-[13px] text-muted-foreground">累计记录</p>
            <p className="text-[15px] font-semibold">128 条 · 96 小时</p>
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

      <SCard>
        <CardHeader>
          <CardTitle>最近记录</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {records.map((r) => (
            <div
              key={r.date}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-accent"
            >
              <div>
                <p className="text-sm font-medium">{r.note}</p>
                <p className="text-xs text-muted-foreground">{r.date}</p>
              </div>
              <span className="text-[13px] font-semibold text-ios-blue">
                {r.minutes}′
              </span>
            </div>
          ))}
        </CardContent>
      </SCard>
    </main>
  );
}

export default App;
