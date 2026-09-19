import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  today: number;
  week: number;
  month: number;
  total: number;
}

const ITEMS = [
  { key: "today", label: "今日" },
  { key: "week", label: "本周" },
  { key: "month", label: "本月" },
  { key: "total", label: "累计" },
] as const;

export function XpCard(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>投入 XP</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {ITEMS.map((it) => (
          <div key={it.key} className="rounded-xl bg-muted/60 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">{it.label}</p>
            <p className="text-xl font-bold tabular-nums">{props[it.key]}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
