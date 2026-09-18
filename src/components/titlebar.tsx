import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Button } from "@/components/ui/button";

async function safeCall(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch {
    // 纯 vite 预览（非 Tauri 环境）下窗口 API 不可用，直接忽略
  }
}

const SHEEN_ID = "tl-sheen";
const BLUR_ID = "tl-spec-blur";

/* 符号路径：按 macOS 实测矢量描摹（85.4 坐标系），墨量 × 58% / − 67% */
function ClosePaths() {
  return (
    <>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.4999 57.7999L57.7999 22.5C59.1999 21.1 61.3999 21.1 62.7999 22.5L62.8999 22.6C64.2999 24 64.2999 26.2 62.8999 27.6L27.5999 62.9C26.1999 64.3 23.9999 64.3 22.5999 62.9L22.4999 62.7999C21.1999 61.3999 21.1999 59.1999 22.4999 57.7999Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.6 22.4999L62.9 57.7999C64.3 59.1999 64.3 61.3999 62.9 62.7999L62.7999 62.8999C61.3999 64.2999 59.1999 64.2999 57.7999 62.8999L22.5 27.5999C21.1 26.1999 21.1 23.9999 22.5 22.5999L22.6 22.4999C24 21.1999 26.2 21.1999 27.6 22.4999Z"
      />
    </>
  );
}

function MinimizePath() {
  return (
    <path d="M17.8 39.1H67.7C69.6 39.1 71.2 40.7 71.2 42.6V42.7C71.2 44.6 69.6 46.2 67.7 46.2H17.8C15.9 46.2 14.3 44.6 14.3 42.7V42.6C14.3 40.7 15.8 39.1 17.8 39.1Z" />
  );
}

function MaximizePaths() {
  return (
    <path d="M31.2 20.8H57.9C61.5 20.8 64.4 23.7 64.4 27.3V54L31.2 20.8ZM54.4 64.5H27.6C24 64.5 21.1 61.6 21.1 58V31.2001L54.4 64.5Z" />
  );
}

type LightTone = "close" | "minimize" | "maximize";

interface ToneSpec {
  base: string;
  activeBase: string;
  border: string;
  glyphFill: string;
  glyph: ReactNode;
}

const TONES: Record<LightTone, ToneSpec> = {
  close: {
    base: "#FF5F57",
    activeBase: "#D14E47",
    border: "#E0443E",
    glyphFill: "#8B1A0F",
    glyph: <ClosePaths />,
  },
  minimize: {
    base: "#FEBC2E",
    activeBase: "#D09A26",
    border: "#DEA123",
    glyphFill: "#A87229",
    glyph: <MinimizePath />,
  },
  maximize: {
    base: "#28C840",
    activeBase: "#21A434",
    border: "#1AAB29",
    glyphFill: "#286017",
    glyph: <MaximizePaths />,
  },
};

interface OrbProps {
  base: string;
  border: string;
  glyph?: ReactNode;
  glyphFill?: string;
  flat?: boolean;
  layerClass?: string;
}

/** 单颗灯：描边环 + 底色 + 糖果高光 + 镜面点，12px 渲染 */
function Orb({ base, border, glyph, glyphFill, flat, layerClass }: OrbProps) {
  return (
    <svg
      viewBox="0 0 85.4 85.4"
      aria-hidden
      className={`absolute inset-0 h-3 w-3${layerClass ? ` ${layerClass}` : ""}`}
    >
      <circle cx="42.7" cy="42.7" r="42.7" fill={border} />
      <circle cx="42.7" cy="42.7" r="37.5" fill={base} />
      {flat ? null : (
        <>
          <circle cx="42.7" cy="42.7" r="37.5" fill={`url(#${SHEEN_ID})`} />
          <ellipse
            cx="42.7"
            cy="25"
            rx="23"
            ry="9.5"
            fill="#ffffff"
            opacity="0.5"
            filter={`url(#${BLUR_ID})`}
          />
        </>
      )}
      {glyph ? <g fill={glyphFill}>{glyph}</g> : null}
    </svg>
  );
}

interface LightProps {
  label: string;
  tone: LightTone;
  focused: boolean;
  unfocusedBase: string;
  unfocusedBorder: string;
  onClick: () => void;
}

function Light({
  label,
  tone,
  focused,
  unfocusedBase,
  unfocusedBorder,
  onClick,
}: LightProps) {
  const t = TONES[tone];

  if (!focused) {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="relative block h-3 w-3 outline-none"
      >
        <Orb base={unfocusedBase} border={unfocusedBorder} flat />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="group/btn relative block h-3 w-3 outline-none"
    >
      <Orb
        base={t.base}
        border={t.border}
        layerClass="group-hover/traffic:opacity-0 group-active/btn:opacity-0"
      />
      <Orb
        base={t.base}
        border={t.border}
        glyph={t.glyph}
        glyphFill={t.glyphFill}
        layerClass="opacity-0 group-hover/traffic:opacity-100 group-active/btn:opacity-0"
      />
      <Orb
        base={t.activeBase}
        border={t.border}
        glyph={t.glyph}
        glyphFill={t.glyphFill}
        layerClass="opacity-0 group-active/btn:opacity-100"
      />
    </button>
  );
}

interface TitlebarProps {
  title: string;
  dark: boolean;
  onToggleDark: () => void;
}

export function Titlebar({ title, dark, onToggleDark }: TitlebarProps) {
  const [focused, setFocused] = useState(true);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    safeCall(async () => {
      unlisten = await getCurrentWindow().onFocusChanged(({ payload }) =>
        setFocused(payload),
      );
    });
    return () => unlisten?.();
  }, []);

  function handleDoubleClick(e: MouseEvent<HTMLElement>) {
    if ((e.target as HTMLElement).closest("button")) return;
    safeCall(() => getCurrentWindow().toggleMaximize());
  }

  return (
    <header
      data-tauri-drag-region
      onDoubleClick={handleDoubleClick}
      className="grid h-12 shrink-0 select-none grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-background px-3"
    >
      {/* 共享高光渐变 + 镜面模糊：全文档定义一次 */}
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <linearGradient
            id={SHEEN_ID}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="0.38" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="0.62" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.18" />
          </linearGradient>
          <filter
            id={BLUR_ID}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
      </svg>
      {/* 注意：data-tauri-drag-region 只对直接带该属性的元素生效，
          子元素必须逐个加；按钮及内部符号不加，保证可点击 */}
      <div data-tauri-drag-region className="group/traffic flex items-center gap-2">
        <Light
          label="关闭"
          tone="close"
          focused={focused}
          unfocusedBase={dark ? "#545558" : "#D9D9DE"}
          unfocusedBorder={dark ? "#3A3A3C" : "#C6C6CB"}
          onClick={() => safeCall(() => getCurrentWindow().close())}
        />
        <Light
          label="最小化"
          tone="minimize"
          focused={focused}
          unfocusedBase={dark ? "#545558" : "#D9D9DE"}
          unfocusedBorder={dark ? "#3A3A3C" : "#C6C6CB"}
          onClick={() => safeCall(() => getCurrentWindow().minimize())}
        />
        <Light
          label="最大化"
          tone="maximize"
          focused={focused}
          unfocusedBase={dark ? "#545558" : "#D9D9DE"}
          unfocusedBorder={dark ? "#3A3A3C" : "#C6C6CB"}
          onClick={() => safeCall(() => getCurrentWindow().toggleMaximize())}
        />
      </div>
      <div data-tauri-drag-region className="text-[13px] font-semibold">
        {title}
      </div>
      <div data-tauri-drag-region className="flex items-center justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onToggleDark}
          aria-label="切换深色模式"
        >
          {dark ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  );
}
