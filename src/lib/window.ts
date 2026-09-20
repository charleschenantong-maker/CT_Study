import { getCurrentWindow } from "@tauri-apps/api/window";

/**
 * Tauri 窗口逻辑（原 titlebar.tsx，无 UI、无灯图）：
 * 调用兜底 / 关闭 / 最小化 / 最大化切换 / 聚焦订阅。
 */

/** 纯 vite 预览（非 Tauri）下窗口 API 不可用：只打日志，不崩。 */
export async function safeWindowCall(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch (e) {
    console.error("[window]", e);
  }
}

export function closeWindow(): Promise<void> {
  return safeWindowCall(() => getCurrentWindow().close());
}

export function minimizeWindow(): Promise<void> {
  return safeWindowCall(() => getCurrentWindow().minimize());
}

export function toggleMaximizeWindow(): Promise<void> {
  return safeWindowCall(() => getCurrentWindow().toggleMaximize());
}
