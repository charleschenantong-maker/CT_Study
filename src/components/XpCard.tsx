import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { t, type Lang, type StrKey } from "@/settings/i18n";

interface Props {
  today: number;
  week: number;
  month: number;
  total: number;
  lang?: Lang;
}

const ITEMS: Array<{ key: "today" | "week" | "month" | "total"; labelKey: StrKey }> = [
  { key: "today", labelKey: "xp.today" },
  { key: "week", labelKey: "xp.week" },
  { key: "month", labelKey: "xp.month" },
  { key: "total", labelKey: "xp.total" },
];

export function XpCard({ today, week, month, total, lang = "zh" }: Props) {
  const values = { today, week, month, total };
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(lang, "xp.title")}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {ITEMS.map((it) => (
          <div key={it.key} className="rounded-xl bg-muted/60 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">{t(lang, it.labelKey)}</p>
            <p className="text-xl font-bold tabular-nums">{values[it.key]}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
