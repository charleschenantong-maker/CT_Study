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

const GLYPH_STROKE = "rgba(0, 0, 0, 0.5)";
const UNFOCUSED_BG = "#D9D9DE";
const UNFOCUSED_BORDER = "#C6C6CB";

function CloseGlyph() {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      className="h-3 w-3 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
    >
      <path
        d="M3.8 3.8l4.4 4.4M8.2 3.8L3.8 8.2"
        fill="none"
        stroke={GLYPH_STROKE}
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MinimizeGlyph() {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      className="h-3 w-3 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
    >
      <path
        d="M3.7 6h4.6"
        fill="none"
        stroke={GLYPH_STROKE}
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MaximizeGlyph() {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      className="h-3 w-3 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
    >
      <path
        d="M6.9 5.1L9 3M9 3H7.1M9 3v1.9M5.1 6.9L3 9M3 9h1.9M3 9V7.1"
        fill="none"
        stroke={GLYPH_STROKE}
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface LightProps {
  label: string;
  base: string;
  border: string;
  focused: boolean;
  glyph: ReactNode;
  onClick: () => void;
}

function Light({ label, base, border, focused, glyph, onClick }: LightProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-3 w-3 items-center justify-center rounded-full outline-none active:brightness-90"
      style={{
        background: focused
          ? `linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 55%), ${base}`
          : UNFOCUSED_BG,
        border: "1px solid",
        borderColor: focused ? border : UNFOCUSED_BORDER,
      }}
    >
      {focused ? glyph : null}
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
      className="grid h-12 shrink-0 select-none grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-background px-4"
    >
      <div className="group flex items-center gap-2">
        <Light
          label="关闭"
          base="#FF5F57"
          border="#E0443E"
          focused={focused}
          glyph={<CloseGlyph />}
          onClick={() => safeCall(() => getCurrentWindow().close())}
        />
        <Light
          label="最小化"
          base="#FEBC2E"
          border="#DEA123"
          focused={focused}
          glyph={<MinimizeGlyph />}
          onClick={() => safeCall(() => getCurrentWindow().minimize())}
        />
        <Light
          label="最大化"
          base="#28C840"
          border="#1AAB29"
          focused={focused}
          glyph={<MaximizeGlyph />}
          onClick={() => safeCall(() => getCurrentWindow().toggleMaximize())}
        />
      </div>
      <div className="text-[13px] font-semibold">{title}</div>
      <div className="flex items-center justify-end">
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
