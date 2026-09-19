import * as React from "react";
import LiquidGlass from "liquid-glass-react";

export function useDarkMode(): boolean {
  const [isDark, setIsDark] = React.useState<boolean>(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  React.useEffect(() => {
    const el = document.documentElement;
    const update = () => setIsDark(el.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return isDark;
}

export interface GlassCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick" | "onMouseMove"> {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  onMouseMove?: React.MouseEventHandler<HTMLDivElement>;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, style, onClick, onMouseMove, ...rest }, ref) => {
    const isDark = useDarkMode();

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
      onMouseMove?.(e);
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }

    return (
      <div
        ref={ref}
        {...rest}
        onMouseMove={handleMouseMove}
        style={{ position: "relative", ...style }}
        className="glass-wrap"
      >
        <LiquidGlass
          displacementScale={56}
          blurAmount={0.08}
          saturation={135}
          aberrationIntensity={1.5}
          elasticity={0.12}
          cornerRadius={18}
          mode="standard"
          overLight={!isDark}
          className={className}
          onClick={onClick}
        >
          {children}
        </LiquidGlass>
        <span aria-hidden className="glass-glow" />
      </div>
    );
  },
);
GlassCard.displayName = "GlassCard";
