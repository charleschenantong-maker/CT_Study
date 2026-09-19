import { useEffect, useState, type MouseEvent } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import closeBase from "@/assets/traffic/close-base.png";
import closeHover from "@/assets/traffic/close-hover.png";
import minimizeBase from "@/assets/traffic/minimize-base.png";
import minimizeHover from "@/assets/traffic/minimize-hover.png";
import maximizeBase from "@/assets/traffic/maximize-base.png";
import maximizeHover from "@/assets/traffic/maximize-hover.png";

async function safeCall(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch {
    // 纯 vite 预览（非 Tauri 环境）下窗口 API 不可用，直接忽略
  }
}

/* 灯图直接从 traffic-ref.png 原图裁出（48px 透明底，12px 显示），不重画 */

function LampImg({
  src,
  layerClass,
}: {
  src: string;
  layerClass?: string;
}) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className={`pointer-events-none absolute inset-0 h-3 w-3 transition-opacity duration-150${
        layerClass ? ` ${layerClass}` : ""
      }`}
    />
  );
}

interface LightProps {
  label: string;
  base: string;
  hover: string;
  focused: boolean;
  onClick: () => void;
}

function Light({ label, base, hover, focused, onClick }: LightProps) {
  if (!focused) {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="relative block h-3 w-3 outline-none"
      >
        <LampImg src={base} layerClass="saturate-0 brightness-[1.65]" />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="group/btn relative block h-3 w-3 outline-none drop-shadow-[0_1px_1px_#00000040]"
    >
      <LampImg
        src={base}
        layerClass="group-hover/traffic:opacity-0 group-active/btn:opacity-0"
      />
      <LampImg
        src={hover}
        layerClass="opacity-0 group-hover/traffic:opacity-100 group-active/btn:opacity-0"
      />
      <LampImg
        src={hover}
        layerClass="opacity-0 brightness-[0.85] group-active/btn:opacity-100"
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
      {/* 注意：data-tauri-drag-region 只对直接带该属性的元素生效，
          子元素必须逐个加；按钮不加，保证可点击 */}
      <div
        data-tauri-drag-region
        className="group/traffic flex items-center gap-[4.5px]"
      >
        <Light
          label="关闭"
          base={closeBase}
          hover={closeHover}
          focused={focused}
          onClick={() => safeCall(() => getCurrentWindow().close())}
        />
        <Light
          label="最小化"
          base={minimizeBase}
          hover={minimizeHover}
          focused={focused}
          onClick={() => safeCall(() => getCurrentWindow().minimize())}
        />
        <Light
          label="最大化"
          base={maximizeBase}
          hover={maximizeHover}
          focused={focused}
          onClick={() => safeCall(() => getCurrentWindow().toggleMaximize())}
        />
      </div>
      <div data-tauri-drag-region />
      <div data-tauri-drag-region />
    </header>
  );
}
