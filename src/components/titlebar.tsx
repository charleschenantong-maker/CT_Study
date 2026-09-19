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

/*
 * 灯组 artwork 参考 D:/GMN/Gemini 的 traffic 灯（24 格坐标系）：
 * 描边环 + 纵向高光 + 顶部镜面弧光 + 镜面椭圆；悬停显符号，按压变暗。
 * 绿灯行为是窗口最大化/还原（非全屏），符号沿用展开箭头。
 */

function CloseGlyphHover() {
  return (
    <g fill="#4D0000" opacity="0.92">
      <rect x="4.6" y="11" width="14.8" height="2" rx="1" transform="rotate(45 12 12)" />
      <rect x="4.6" y="11" width="14.8" height="2" rx="1" transform="rotate(-45 12 12)" />
    </g>
  );
}

function CloseGlyphActive() {
  return (
    <g fill="#1A0000">
      <rect x="4.6" y="11" width="14.8" height="2" rx="1" transform="rotate(45 12 12)" />
      <rect x="4.6" y="11" width="14.8" height="2" rx="1" transform="rotate(-45 12 12)" />
    </g>
  );
}

function MinimizeGlyphHover() {
  return (
    <rect x="4.6" y="11" width="14.8" height="2" rx="1" fill="#885700" opacity="0.95" />
  );
}

function MinimizeGlyphActive() {
  return <rect x="4.6" y="11" width="14.8" height="2" rx="1" fill="#3A2500" />;
}

function MaximizeGlyphHover() {
  return (
    <g opacity="0.95">
      <line x1="10" y1="14" x2="15.4" y2="8.6" stroke="#005510" strokeWidth="1.9" strokeLinecap="round" />
      <polygon points="17.4,6.6 14.3,7 16.9,9.6" fill="#005510" />
      <g transform="rotate(180 12 12)">
        <line x1="10" y1="14" x2="15.4" y2="8.6" stroke="#005510" strokeWidth="1.9" strokeLinecap="round" />
        <polygon points="17.4,6.6 14.3,7 16.9,9.6" fill="#005510" />
      </g>
    </g>
  );
}

function MaximizeGlyphActive() {
  return (
    <g>
      <line x1="10" y1="14" x2="15.4" y2="8.6" stroke="#002B06" strokeWidth="1.9" strokeLinecap="round" />
      <polygon points="17.4,6.6 14.3,7 16.9,9.6" fill="#002B06" />
      <g transform="rotate(180 12 12)">
        <line x1="10" y1="14" x2="15.4" y2="8.6" stroke="#002B06" strokeWidth="1.9" strokeLinecap="round" />
        <polygon points="17.4,6.6 14.3,7 16.9,9.6" fill="#002B06" />
      </g>
    </g>
  );
}

type LightTone = "close" | "minimize" | "maximize";

interface ToneSpec {
  border: string;
  base: string;
  activeBorder: string;
  activeBase: string;
  glyphHover: ReactNode;
  glyphActive: ReactNode;
}

const TONES: Record<LightTone, ToneSpec> = {
  close: {
    border: "#E0443E",
    base: "#FF5F57",
    activeBorder: "#8F2D26",
    activeBase: "#BF4942",
    glyphHover: <CloseGlyphHover />,
    glyphActive: <CloseGlyphActive />,
  },
  minimize: {
    border: "#DEA123",
    base: "#FFBD2E",
    activeBorder: "#98701A",
    activeBase: "#BF8E22",
    glyphHover: <MinimizeGlyphHover />,
    glyphActive: <MinimizeGlyphActive />,
  },
  maximize: {
    border: "#1AAB29",
    base: "#28C840",
    activeBorder: "#14691F",
    activeBase: "#1D9730",
    glyphHover: <MaximizeGlyphHover />,
    glyphActive: <MaximizeGlyphActive />,
  },
};

function Layer({
  layerClass,
  children,
}: {
  layerClass?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`absolute inset-0 h-full w-full transition-opacity duration-150${
        layerClass ? ` ${layerClass}` : ""
      }`}
    >
      {children}
    </svg>
  );
}

function GlossBody({
  border,
  base,
  rimOpacity,
  glyph,
}: {
  border: string;
  base: string;
  rimOpacity: number;
  glyph?: ReactNode;
}) {
  return (
    <>
      <circle cx="12" cy="12" r="11.3" fill={border} />
      <circle cx="12" cy="12" r="10.4" fill={base} />
      <g clipPath="url(#tl-c)">
        <rect x="1.6" y="1.6" width="20.8" height="20.8" fill="url(#tl-g)" />
        <ellipse cx="12" cy="6.4" rx="6.6" ry="3.4" fill="#ffffff" opacity="0.24" />
        {glyph}
      </g>
      <path
        d="M 5.2 8.1 A 7.9 7.9 0 0 1 18.8 8.1"
        stroke="#ffffff"
        strokeOpacity={rimOpacity}
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}

interface LightProps {
  label: string;
  tone: LightTone;
  focused: boolean;
  onClick: () => void;
}

function Light({ label, tone, focused, onClick }: LightProps) {
  const t = TONES[tone];

  if (!focused) {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="relative block h-3.5 w-3.5 outline-none drop-shadow-[0_1px_1px_#00000040]"
      >
        <Layer>
          <circle cx="12" cy="12" r="11.3" fill="#CFCECF" />
          <circle cx="12" cy="12" r="10.4" fill="#DCDCDC" />
          <g clipPath="url(#tl-c)">
            <rect x="1.6" y="1.6" width="20.8" height="20.8" fill="url(#tl-gu)" />
          </g>
        </Layer>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="group/btn relative block h-3.5 w-3.5 outline-none drop-shadow-[0_1px_1px_#00000040]"
    >
      <Layer layerClass="group-hover/traffic:opacity-0 group-active/btn:opacity-0">
        <GlossBody border={t.border} base={t.base} rimOpacity={0.45} />
      </Layer>
      <Layer layerClass="opacity-0 group-hover/traffic:opacity-100 group-active/btn:opacity-0">
        <GlossBody border={t.border} base={t.base} rimOpacity={0.35} glyph={t.glyphHover} />
      </Layer>
      <Layer layerClass="opacity-0 group-active/btn:opacity-100">
        <circle cx="12" cy="12" r="11.3" fill={t.activeBorder} />
        <circle cx="12" cy="12" r="10.4" fill={t.activeBase} />
        <g clipPath="url(#tl-c)">
          <rect x="1.6" y="1.6" width="20.8" height="20.8" fill="#000000" opacity="0.06" />
          {t.glyphActive}
        </g>
      </Layer>
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
      {/* 共享高光渐变 + 裁剪圆：全文档定义一次 */}
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <linearGradient id="tl-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
            <stop offset="0.42" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="tl-gu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.06" />
          </linearGradient>
          <clipPath id="tl-c">
            <circle cx="12" cy="12" r="10.4" />
          </clipPath>
        </defs>
      </svg>
      {/* 注意：data-tauri-drag-region 只对直接带该属性的元素生效，
          子元素必须逐个加；按钮及内部符号不加，保证可点击 */}
      <div data-tauri-drag-region className="group/traffic flex items-center gap-2">
        <Light
          label="关闭"
          tone="close"
          focused={focused}
          onClick={() => safeCall(() => getCurrentWindow().close())}
        />
        <Light
          label="最小化"
          tone="minimize"
          focused={focused}
          onClick={() => safeCall(() => getCurrentWindow().minimize())}
        />
        <Light
          label="最大化"
          tone="maximize"
          focused={focused}
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
