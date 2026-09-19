import type { CSSProperties, ReactNode } from "react";
import LiquidGlassBase from "liquid-glass-react";

export function LiquidGlass({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/55 bg-white/55 shadow-lg backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55 ${className}`} style={style}>
      <LiquidGlassBase className="pointer-events-none absolute inset-0 !m-0 !h-full !w-full opacity-25" style={{ position: "absolute", top: "0", left: "0" }} cornerRadius={22} padding="0" blurAmount={0.18} saturation={150} displacementScale={18} mode="standard"><span /></LiquidGlassBase>
      <div className="relative z-10 w-full text-foreground">{children}</div>
    </div>
  );
}
