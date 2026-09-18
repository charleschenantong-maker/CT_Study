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

function CloseGlyph() {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      className="h-3 w-3 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
    >
      <path
        d="M3.2 3.2l5.6 5.6M8.8 3.2L3.2 8.8"
        fill="none"
        stroke="currentColor"
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
        d="M3.2 6h5.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
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
        d="M6.6 5.4L9.2 2.8M9.2 2.8H7.3M9.2 2.8v1.9M5.4 6.6L2.8 9.2M2.8 9.2h1.9M2.8 9.2V7.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type LightTone = "close" | "minimize" | "maximize";

interface LightProps {
  label: string;
  tone: LightTone;
  focused: boolean;
  glyph: ReactNode;
  onClick: () => void;
}

function Light({ label, tone, focused, glyph, onClick }: LightProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={
        focused
          ? `traffic-light traffic-light-${tone}`
          : "traffic-light traffic-light-unfocused"
      }
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
      className="grid h-12 shrink-0 select-none grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-background px-3"
    >
      {/* 注意：data-tauri-drag-region 只对直接带该属性的元素生效，
          子元素必须逐个加；按钮及内部符号不加，保证可点击 */}
      <div data-tauri-drag-region className="group flex items-center gap-2">
        <Light
          label="关闭"
          tone="close"
          focused={focused}
          glyph={<CloseGlyph />}
          onClick={() => safeCall(() => getCurrentWindow().close())}
        />
        <Light
          label="最小化"
          tone="minimize"
          focused={focused}
          glyph={<MinimizeGlyph />}
          onClick={() => safeCall(() => getCurrentWindow().minimize())}
        />
        <Light
          label="最大化"
          tone="maximize"
          focused={focused}
          glyph={<MaximizeGlyph />}
          onClick={() => safeCall(() => getCurrentWindow().toggleMaximize())}
        />
      </div>
      <div data-tauri-drag-region className="text-[13px] font-semibold">
        {title}
      </div>
      <div
        data-tauri-drag-region
        className="flex items-center justify-end"
      >
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
