import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RepairEligibility } from "@/study/streak";

interface Props {
  current: number;
  best: number;
  repair: RepairEligibility;
  onRepair: () => void;
}

export function StreakCard({ current, best, repair, onRepair }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>连续打卡</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Flame className="size-8 text-ios-orange" />
          <div>
            <p className="text-3xl font-bold tabular-nums leading-none">
              {current}
              <span className="ml-1 text-sm font-medium text-muted-foreground">天</span>
            </p>
            <p className="mt-1 text-xs tabular-nums text-muted-foreground">
              历史最长 {best} 天
            </p>
          </div>
        </div>
        {repair.eligible ? (
          <div className="space-y-2 rounded-xl bg-primary/[0.07] p-3">
            <p className="text-[13px]">
              昨日断签，可用今日额外 {repair.cost} XP 修复
            </p>
            <Button size="sm" className="w-full" onClick={onRepair}>
              修复昨日
            </Button>
          </div>
        ) : repair.reason ? (
          <p className="text-xs text-muted-foreground">{repair.reason}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
