import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { day: "9/05", minutes: 20 },
  { day: "9/06", minutes: 35 },
  { day: "9/07", minutes: 28 },
  { day: "9/08", minutes: 45 },
  { day: "9/09", minutes: 30 },
  { day: "9/10", minutes: 52 },
  { day: "9/11", minutes: 40 },
  { day: "9/12", minutes: 25 },
  { day: "9/13", minutes: 60 },
  { day: "9/14", minutes: 48 },
  { day: "9/15", minutes: 33 },
  { day: "9/16", minutes: 55 },
  { day: "9/17", minutes: 42 },
  { day: "9/18", minutes: 38 },
];

export function TrendChart() {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            interval={2}
            dy={6}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={40}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--muted-foreground)" }}
          />
          <Area
            type="monotone"
            dataKey="minutes"
            name="分钟"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            fill="url(#trendFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
