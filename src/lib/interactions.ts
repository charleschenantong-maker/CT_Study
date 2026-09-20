import { useEffect, useState } from "react";

/**
 * 无 UI 的交互/动画逻辑抽取（去圆角、去颜色、去阴影）。
 * 来源：
 * - FlipClock（@leenguyen/react-flip-clock-countdown）：倒计时 tick + 翻页时长
 * - WeeklyCard（@heroui/react Progress）：完成度百分比
 * - GradesCard（recharts）：悬停取点 / 点击描点进详情 / 删除窗口期
 * - SettingsModal / GradesCard：Esc 关闭、遮罩点击关闭
 * - appica-ui animation：data-* 状态驱动过渡 + reduced-motion 感知
 * - appica Countdown：滚动数字竖条 + 补零 + 吸附
 * - appica TextAnimate：progress 引擎 + stagger + rAF 时钟
 * - appica Tooltip：悬停意图 delay / grace
 * - appica Toast / CopyButton：自动消失 + 剪贴板回退 + copied 超时
 * - appica useLocalStorage / useDismissible：持久状态 + 跨 tab 同步
 * - appica Drawer：边缘滑动轴 + snap 点 + flick 跳点
 */

// ---------- 倒计时（FlipClock 用法：to + duration） ----------

/** 翻页动画时长：原 FlipClockCountdown duration={0.5}，只保留数字，不带任何样式。 */
export const FLIP_DURATION_MS = 500;

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  completed: boolean;
}

/** 纯函数：目标时间戳 - 当前时间戳 -> 天/时/分/秒（与 FlipClock 的 exam.date 解析逻辑对应）。 */
export function getCountdownParts(toMs: number, nowMs: number): CountdownParts {
  const totalMs = Math.max(0, toMs - nowMs);
  const totalSec = Math.floor(totalMs / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor(totalSec / 3600) % 24,
    minutes: Math.floor(totalSec / 60) % 60,
    seconds: totalSec % 60,
    totalMs,
    completed: toMs <= nowMs,
  };
}

/** 每 intervalMs 刷新一次的 now（秒级倒计时传 1000 即可）。 */
export function useNow(intervalMs = 1000, enabled = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, enabled]);
  return now;
}

/** 组合：直接拿到可渲染的倒计时数字，渲染层自己决定用不用翻页组件。 */
export function useCountdown(toMs: number, intervalMs = 1000): CountdownParts {
  const now = useNow(intervalMs, Number.isFinite(toMs));
  return getCountdownParts(toMs, now);
}

// ---------- 进度（WeeklyCard 的 HeroUI Progress 逻辑） ----------

/** pct = min(100, completed / target * 100)，target<=0 时为 0。 */
export function progressValue(completed: number, target: number): number {
  if (!Number.isFinite(completed) || !Number.isFinite(target) || target <= 0) return 0;
  return Math.min(100, (completed / target) * 100);
}

// ---------- reduced motion（appica-ui animation 逻辑） ----------

/**
 * OS 的 prefers-reduced-motion + 祖先 data-disable-animations（ReducedMotionProvider）
 * 任一成立即视为需要关闭动画。JS 驱动动画用它，CSS 则用 motion-reduce:transition-none。
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        document.querySelector("[data-disable-animations]") !== null),
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const recompute = () =>
      setReduced(
        mq.matches || document.querySelector("[data-disable-animations]") !== null,
      );
    recompute();
    mq.addEventListener("change", recompute);
    const obs = new MutationObserver(recompute);
    obs.observe(document.documentElement, { attributes: true, subtree: true });
    return () => {
      mq.removeEventListener("change", recompute);
      obs.disconnect();
    };
  }, []);
  return reduced;
}

/**
 * appica 的 data-* 状态驱动过渡模式（进/出场共用一套）：
 * data-starting-style / data-ending-style 挂 opacity+scale，退出即另一个状态，
 * 卸载前先播出场动画。这里只出过渡类，不带 rounded / border / shadow / 颜色。
 */
export function stateTransitionClass(durationMs = 200): string {
  const duration =
    durationMs <= 150
      ? "duration-150"
      : durationMs <= 200
        ? "duration-200"
        : durationMs <= 300
          ? "duration-300"
          : "duration-500";
  return [
    "transition-[opacity,scale]",
    duration,
    "motion-reduce:transition-none",
    "data-starting-style:opacity-0",
    "data-starting-style:scale-95",
    "data-ending-style:opacity-0",
    "data-ending-style:scale-95",
  ].join(" ");
}

// ---------- 模态交互（SettingsModal / GradesCard / appica Dialog 逻辑） ----------

/** Esc 关闭（open 为 false 时不挂监听）。 */
export function useEscapeClose(open: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, onClose]);
}

/** 遮罩点击关闭 + 内容区 stopPropagation 的判定 helper（供 onClick 直接用）。 */
export function shouldCloseOnOverlayClick(
  e: { target: EventTarget | null; currentTarget: EventTarget | null },
): boolean {
  return e.target === e.currentTarget;
}

// ---------- 图表点交互（GradesCard 的 recharts 逻辑） ----------

/** 记录可删窗口期：原 DELETE_WINDOW_MS，纯时间判断。 */
export const DELETE_WINDOW_MS = 5 * 60 * 1000;

export function isDeletable(
  createdAt: number,
  nowMs = Date.now(),
  windowMs = DELETE_WINDOW_MS,
): boolean {
  return nowMs - createdAt <= windowMs;
}

/** 跟随鼠标的 tooltip 摆位：悬停点上方 gap 偏移、水平居中（原 ContributionGrid tip）。 */
export function placeAboveCursor(
  x: number,
  y: number,
  gap = 12,
): { left: number; top: number; transform: string } {
  return { left: x, top: y - gap, transform: "translate(-50%, -100%)" };
}

// ---------- 滚动数字（appica Countdown segment：0-9 竖条 GPU 位移） ----------

/** 值按 minDigits 补零拆成单个数字字符（与 CountdownSegment minDigits=2 对应）。 */
export function splitDigits(value: number, minDigits = 2): string[] {
  const abs = Math.max(0, Math.floor(Math.abs(value)));
  return abs.toString().padStart(minDigits, "0").split("");
}

/** 单个数字在竖条中的位移：translateY(-digit * 100%)，reduced-motion 下直接吸附。 */
export function digitTranslateY(digit: number, reducedMotion: boolean): string {
  if (reducedMotion) return "translateY(0)";
  const d = Math.min(9, Math.max(0, Math.floor(digit)));
  return `translateY(${-d * 100}%)`;
}

// ---------- 进度驱动引擎（appica TextAnimate：progress 0→1 + stagger） ----------

/** 将全局进度映射为第 index 个单元的本地进度（stagger 0=齐步，1=完全串行）。 */
export function unitLocalProgress(
  globalProgress: number,
  index: number,
  total: number,
  stagger: number,
): number {
  if (total <= 1) return clamp01(globalProgress);
  const s = clamp01(stagger);
  const start = (index / total) * s;
  const span = 1 - s;
  if (span <= 0) return globalProgress >= start ? 1 : 0;
  return clamp01((globalProgress - start) / span);
}

export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export interface RafClockOptions {
  durationSec?: number;
  delaySec?: number;
  loop?: boolean;
  autoPlay?: boolean;
  reducedMotion?: boolean;
}

/**
 * 内置 rAF 时钟：progress 0→1（受控 progress 传入时调用方自己持有，不用它）。
 * reducedMotion 下直接吸附终帧（与 TextAnimate 一致）；loop 做往复循环。
 */
export function useRafProgress(options: RafClockOptions = {}): number {
  const {
    durationSec = 1.6,
    delaySec = 0,
    loop = false,
    autoPlay = true,
    reducedMotion = false,
  } = options;
  const [progress, setProgress] = useState(autoPlay && reducedMotion ? 1 : 0);
  useEffect(() => {
    if (!autoPlay) return;
    if (reducedMotion) {
      setProgress(1);
      return;
    }
    let raf = 0;
    const start = performance.now() + delaySec * 1000;
    const tick = (t: number) => {
      const elapsed = (t - start) / (Math.max(0.01, durationSec) * 1000);
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (loop) {
        setProgress(elapsed % 1);
        raf = requestAnimationFrame(tick);
        return;
      }
      setProgress(Math.min(1, elapsed));
      if (elapsed < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationSec, delaySec, loop, autoPlay, reducedMotion]);
  return progress;
}

// ---------- 悬停意图（appica TooltipProvider：delay / closeDelay / grace） ----------

export const TOOLTIP_OPEN_DELAY_MS = 200;
export const TOOLTIP_CLOSE_DELAY_MS = 0;
/** 上一个关闭后多久内悬停下一个可秒开（grace 窗口，打开时跳过进场动画）。 */
export const TOOLTIP_GRACE_MS = 400;

/** 延迟开/延迟关的悬停状态机（tooltip、preview-card、hover 卡片通用）。 */
export function useDelayedOpen(
  openDelayMs = TOOLTIP_OPEN_DELAY_MS,
  closeDelayMs = TOOLTIP_CLOSE_DELAY_MS,
): { open: boolean; onEnter: () => void; onLeave: () => void } {
  const [open, setOpen] = useState(false);
  const timers = useEffectSkipMount();
  useEffect(() => () => timers.clear(), [timers]);
  return {
    open,
    onEnter: () => {
      timers.clear();
      if (openDelayMs <= 0) {
        setOpen(true);
        return;
      }
      timers.later(() => setOpen(true), openDelayMs);
    },
    onLeave: () => {
      timers.clear();
      if (closeDelayMs <= 0) {
        setOpen(false);
        return;
      }
      timers.later(() => setOpen(false), closeDelayMs);
    },
  };
}

interface TimerBag {
  later: (fn: () => void, ms: number) => void;
  clear: () => void;
}

/** 跨 render 持有 timeout id，卸载自动清理。 */
function useEffectSkipMount(): TimerBag {
  const [bag] = useState<TimerBag>(() => {
    let id = 0;
    return {
      later: (fn, ms) => {
        window.clearTimeout(id);
        id = window.setTimeout(fn, ms);
      },
      clear: () => window.clearTimeout(id),
    };
  });
  useEffect(() => () => bag.clear(), [bag]);
  return bag;
}

// ---------- 自动消失（appica Toast timeout / CopyButton copied 超时） ----------

export const TOAST_TIMEOUT_MS = 5000;
export const COPIED_TIMEOUT_MS = 2000;

/** open 后 timeoutMs 自动 onClose；timeout<=0 表示常驻，需手动关。 */
export function useAutoDismiss(open: boolean, timeoutMs: number, onClose: () => void): void {
  useEffect(() => {
    if (!open || timeoutMs <= 0) return;
    const id = window.setTimeout(onClose, timeoutMs);
    return () => window.clearTimeout(id);
  }, [open, timeoutMs, onClose]);
}

// ---------- 复制状态（appica CopyButton：clipboard + 2s 对勾） ----------

/** 写剪贴板，Clipboard API 不可用时回退隐藏 textarea + execCommand。 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 掉到下面的 textarea 回退
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/** copied 旗标：成功后置 true，timeoutMs 后自动复位（供对勾/已复制文案用）。 */
export function useCopiedState(timeoutMs = COPIED_TIMEOUT_MS): {
  copied: boolean;
  markCopied: () => void;
} {
  const [copied, setCopied] = useState(false);
  const bag = useEffectSkipMount();
  return {
    copied,
    markCopied: () => {
      setCopied(true);
      bag.later(() => setCopied(false), timeoutMs);
    },
  };
}

// ---------- 持久状态（appica useLocalStorage / useDismissible） ----------

/**
 * useState 语义 + local/session 持久化：SSR 返回默认值 hydration 后解析；
 * 写操作 try/catch；跨 tab 经 storage 事件同步，同 tab 经自定义事件同步。
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  storage: "local" | "session" = "local",
): readonly [T, (v: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValueState] = useState<T>(defaultValue);
  useEffect(() => {
    try {
      const store = storage === "local" ? window.localStorage : window.sessionStorage;
      const raw = store.getItem(key);
      if (raw !== null) setValueState(JSON.parse(raw) as T);
    } catch {
      // 私有模式/配额失败：保持默认值，不崩
    }
    const onExternal = (e: Event) => {
      if ((e as CustomEvent).detail?.key === key) {
        setValueState((e as CustomEvent).detail.value as T);
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        setValueState(e.newValue === null ? defaultValue : (JSON.parse(e.newValue) as T));
      } catch {
        // 坏数据：忽略
      }
    };
    window.addEventListener("appica-storage", onExternal);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("appica-storage", onExternal);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, storage]);

  const setValue = (v: T | ((prev: T) => T)) => {
    setValueState((prev) => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      try {
        const store = storage === "local" ? window.localStorage : window.sessionStorage;
        store.setItem(key, JSON.stringify(next));
      } catch {
        // 写失败不崩
      }
      window.dispatchEvent(new CustomEvent("appica-storage", { detail: { key, value: next } }));
      return next;
    });
  };
  const remove = () => {
    try {
      const store = storage === "local" ? window.localStorage : window.sessionStorage;
      store.removeItem(key);
    } catch {
      // 忽略
    }
    window.dispatchEvent(new CustomEvent("appica-storage", { detail: { key, value: defaultValue } }));
    setValueState(defaultValue);
  };
  return [value, setValue, remove] as const;
}

/** 可关闭的横幅/公告：dismiss 后持久记忆，下次访问保持关闭。 */
export function useDismissible(
  key: string,
  storage: "local" | "session" = "local",
): { open: boolean; dismiss: () => void; reset: () => void } {
  const [dismissed, setDismissed, clearDismissed] = usePersistentState<boolean>(
    key,
    false,
    storage,
  );
  return {
    open: !dismissed,
    dismiss: () => setDismissed(true),
    reset: () => clearDismissed(),
  };
}

// ---------- 边缘手势（appica Drawer：side→滑动轴/吸附点） ----------

export type DrawerSide = "top" | "right" | "bottom" | "left";

/** side 决定滑动消失的手势轴：top/bottom 走 Y，left/right 走 X。 */
export function drawerSwipeAxis(side: DrawerSide): "x" | "y" {
  return side === "left" || side === "right" ? "x" : "y";
}

/**
 * snap 点解析：0-1 按视口比例，>1 按像素，字符串（'24rem'）原样透传。
 * dismiss 发生在拖过最小点之后。
 */
export function resolveSnapPoint(point: number | string, viewportPx: number): number | string {
  if (typeof point === "string") return point;
  if (point > 0 && point <= 1) return Math.round(point * viewportPx);
  return point;
}

/** 最近吸附点：velocity 大时可跳点（flick），sequential 时只许走到相邻点。 */
export function nearestSnapIndex(
  pointsPx: number[],
  currentPx: number,
  activeIndex: number,
  velocityPxPerMs: number,
  sequential = false,
  flingThreshold = 0.5,
): number {
  if (pointsPx.length === 0) return 0;
  const fling = Math.abs(velocityPxPerMs) >= flingThreshold ? Math.sign(velocityPxPerMs) : 0;
  if (sequential || fling === 0) {
    if (sequential && fling !== 0) {
      return Math.min(pointsPx.length - 1, Math.max(0, activeIndex + (fling > 0 ? 1 : -1)));
    }
    let best = 0;
    let bestDist = Infinity;
    pointsPx.forEach((p, i) => {
      const d = Math.abs(p - currentPx);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }
  return velocityPxPerMs > 0
    ? pointsPx.length - 1
    : 0;
}

// ---------- 动画时长（reduced-motion 下 JS 动画时长归零，如 Embla duration） ----------

/** reduced-motion 时返回 0（直接吸附），否则返回期望时长。 */
export function motionDuration(preferredMs: number, reducedMotion: boolean): number {
  return reducedMotion ? 0 : preferredMs;
}
