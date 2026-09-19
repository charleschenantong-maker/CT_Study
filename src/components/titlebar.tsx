import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

async function safeCall(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch {
    // 纯 vite 预览（非 Tauri 环境）下窗口 API 不可用，直接忽略
  }
}

const BLUR_ID = "tl-spec-blur";

/*
 * 按 traffic-ref.png 像素测量重建（220px 灯 → 120 坐标系），20px 渲染：
 * - 灯体：描边环 0.7px + 纵向糖果渐变（剖面实测色）+ 左上镜面高光
 * - ×：跨度 43%Ø，杆粗 10%Ø，圆头，#991E1C
 * - −：胶囊宽 44%Ø，粗 11%Ø，#8D5D03
 * - 绿：圆角方块边长 42%Ø + 右上→左下内嵌斜槽，#237C1C
 * - 灯间距 7.5px（83/220 实测比）
 */
function ClosePaths() {
  return (
    <>
      <line x1="41.6" y1="41.6" x2="78.4" y2="78.4" strokeWidth="12" strokeLinecap="round" />
      <line x1="78.4" y1="41.6" x2="41.6" y2="78.4" strokeWidth="12" strokeLinecap="round" />
    </>
  );
}

function MinimizePath() {
  return (
    <line x1="33.5" y1="60" x2="86.5" y2="60" strokeWidth="13" strokeLinecap="round" />
  );
}

function MaximizePaths() {
  return (
    <rect
      x="34.5"
      y="34.5"
      width="51"
      height="51"
      rx="8"
      mask="url(#tl-green-slot)"
    />
  );
}

type LightTone = "close" | "minimize" | "maximize";

interface ToneSpec {
  fill: string;
  border: string;
  glyphFill: string;
  glyph: ReactNode;
}

const TONES: Record<LightTone, ToneSpec> = {
  close: {
    fill: "url(#tl-g-red)",
    border: "#652023",
    glyphFill: "#991E1C",
    glyph: <ClosePaths />,
  },
  minimize: {
    fill: "url(#tl-g-yellow)",
    border: "#C9A92A",
    glyphFill: "#8D5D03",
    glyph: <MinimizePath />,
  },
  maximize: {
    fill: "url(#tl-g-green)",
    border: "#58C448",
    glyphFill: "#237C1C",
    glyph: <MaximizePaths />,
  },
};

const UNFOCUSED_BASE = "#D9D9DE";
const UNFOCUSED_BORDER = "#C6C6CB";

interface OrbProps {
  fill: string;
  border: string;
  glyph?: ReactNode;
  glyphFill?: string;
  gloss?: boolean;
  dimmed?: boolean;
  layerClass?: string;
}

/** 单颗灯：描边环 + 糖果渐变 + 镜面高光，20px 渲染 */
function Orb({
  fill,
  border,
  glyph,
  glyphFill,
  gloss = true,
  dimmed,
  layerClass,
}: OrbProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      className={`absolute inset-0 h-5 w-5${layerClass ? ` ${layerClass}` : ""}`}
    >
      <circle cx="60" cy="60" r="60" fill={border} />
      <circle cx="60" cy="60" r="53" fill={fill} />
      {gloss ? (
        <ellipse
          cx="36"
          cy="22"
          rx="30"
          ry="22"
          fill="#ffffff"
          opacity="0.5"
          filter={`url(#${BLUR_ID})`}
        />
      ) : null}
      {glyph ? (
        <g fill={glyphFill} stroke={glyphFill}>
          {glyph}
        </g>
      ) : null}
      {dimmed ? (
        <circle cx="60" cy="60" r="53" fill="#000000" opacity="0.14" />
      ) : null}
    </svg>
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
        className="relative block h-5 w-5 outline-none"
      >
        <Orb fill={UNFOCUSED_BASE} border={UNFOCUSED_BORDER} gloss={false} />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="group/btn relative block h-5 w-5 outline-none"
    >
      <Orb
        fill={t.fill}
        border={t.border}
        layerClass="group-hover/traffic:opacity-0 group-active/btn:opacity-0"
      />
      <Orb
        fill={t.fill}
        border={t.border}
        glyph={t.glyph}
        glyphFill={t.glyphFill}
        layerClass="opacity-0 group-hover/traffic:opacity-100 group-active/btn:opacity-0"
      />
      <Orb
        fill={t.fill}
        border={t.border}
        glyph={t.glyph}
        glyphFill={t.glyphFill}
        dimmed
        layerClass="opacity-0 group-active/btn:opacity-100"
      />
    </button>
  );
}

export function Titlebar() {
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
      {/* 共享渐变 + 模糊 + 绿槽遮罩：全文档定义一次 */}
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <linearGradient id="tl-g-red" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FD8A87" />
            <stop offset="0.15" stopColor="#FB7470" />
            <stop offset="0.3" stopColor="#F65C57" />
            <stop offset="0.48" stopColor="#F1504B" />
            <stop offset="0.65" stopColor="#EF4E49" />
            <stop offset="0.8" stopColor="#F25751" />
            <stop offset="0.92" stopColor="#F9615A" />
            <stop offset="1" stopColor="#EE5F59" />
          </linearGradient>
          <linearGradient id="tl-g-yellow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FBDD7B" />
            <stop offset="0.15" stopColor="#FBD65F" />
            <stop offset="0.3" stopColor="#F9CF4C" />
            <stop offset="0.48" stopColor="#F7C738" />
            <stop offset="0.65" stopColor="#F6C636" />
            <stop offset="0.8" stopColor="#F8CB3E" />
            <stop offset="0.92" stopColor="#FBD14E" />
            <stop offset="1" stopColor="#F5C93F" />
          </linearGradient>
          <linearGradient id="tl-g-green" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9EEA8A" />
            <stop offset="0.15" stopColor="#87E072" />
            <stop offset="0.3" stopColor="#73D75F" />
            <stop offset="0.48" stopColor="#62CE4E" />
            <stop offset="0.62" stopColor="#5ACB47" />
            <stop offset="0.78" stopColor="#5DD048" />
            <stop offset="0.9" stopColor="#6BD355" />
            <stop offset="1" stopColor="#66CC54" />
          </linearGradient>
          <filter id="tl-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <mask id="tl-green-slot">
            <rect x="34.5" y="34.5" width="51" height="51" rx="8" fill="#ffffff" />
            <line
              x1="73"
              y1="47"
              x2="47"
              y2="73"
              stroke="#000000"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </mask>
        </defs>
      </svg>
      {/* 注意：data-tauri-drag-region 只对直接带该属性的元素生效，
          子元素必须逐个加；按钮及内部符号不加，保证可点击 */}
      <div
        data-tauri-drag-region
        className="group/traffic flex items-center gap-[7.5px]"
      >
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
      <div data-tauri-drag-region />
      <div data-tauri-drag-region />
    </header>
  );
}
