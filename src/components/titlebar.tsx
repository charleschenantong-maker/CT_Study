import { useEffect, useState, type MouseEvent } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import closeBase from "@/assets/traffic/close-base.png";
import closeHover from "@/assets/traffic/close-hover.png";
import minimizeBase from "@/assets/traffic/minimize-base.png";
import minimizeHover from "@/assets/traffic/minimize-hover.png";
import maximizeBase from "@/assets/traffic/maximize-base.png";
import maximizeHover from "@/assets/traffic/maximize-hover.png";
import unfocused from "@/assets/traffic/unfocused.png";
import { t, type Lang } from "@/settings/i18n";

async function safeCall(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch (e) {
    // 纯 vite 预览（非 Tauri 环境）下窗口 API 不可用；devtools 里可见，别吞错
    console.error("[titlebar]", e);
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
      className={`pointer-events-none absolute inset-0 h-[13.5px] w-[13.5px] transition-opacity duration-150${
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
        className="relative block h-[13.5px] w-[13.5px] outline-none"
      >
        <LampImg src={unfocused} />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="group/btn relative block h-[13.5px] w-[13.5px] outline-none drop-shadow-[0_1px_1px_#00000040]"
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

export function Titlebar({ lang = "zh" }: { lang?: Lang }) {
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
      className="grid h-8 shrink-0 select-none grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-background px-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
    >
      {/* 注意：data-tauri-drag-region 只对直接带该属性的元素生效，
          子元素必须逐个加；按钮不加，保证可点击 */}
      <div
        data-tauri-drag-region
        className="group/traffic flex items-center gap-[4.5px]"
      >
        <Light
          label={t(lang, "tb.close")}
          base={closeBase}
          hover={closeHover}
          focused={focused}
          onClick={() => safeCall(() => getCurrentWindow().close())}
        />
        <Light
          label={t(lang, "tb.min")}
          base={minimizeBase}
          hover={minimizeHover}
          focused={focused}
          onClick={() => safeCall(() => getCurrentWindow().minimize())}
        />
        <Light
          label={t(lang, "tb.max")}
          base={maximizeBase}
          hover={maximizeHover}
          focused={focused}
          onClick={() => safeCall(() => getCurrentWindow().toggleMaximize())}
        />
      </div>
      <div data-tauri-drag-region className="text-center text-[13px] font-semibold">
        Planner
      </div>
      <div data-tauri-drag-region />
    </header>
  );
}
