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

let wasMaximizedBeforeFullscreen = false;

export async function setFullscreen(fullscreen: boolean): Promise<void> {
  let nativeSuccess = false;
  if (typeof (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ !== "undefined") {
    try {
      const win = getCurrentWindow();
      if (fullscreen) {
        wasMaximizedBeforeFullscreen = await win.isMaximized().catch(() => false);
        await win.setFullscreen(true);
        await win.setAlwaysOnTop(true).catch(() => {});
        await win.setFocus().catch(() => {});
      } else {
        await win.setAlwaysOnTop(false).catch(() => {});
        await win.setFullscreen(false);
        if (wasMaximizedBeforeFullscreen) {
          setTimeout(async () => {
            try {
              const isMax = await win.isMaximized();
              if (!isMax) {
                await win.maximize();
              }
            } catch {}
          }, 60);
        }
      }
      nativeSuccess = true;
    } catch (e) {
      console.warn("[window] native setFullscreen failed, falling back to browser API", e);
    }
  }
  if (!nativeSuccess) {
    try {
      if (fullscreen) {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (e) {
      console.warn("[window] browser fullscreen fallback error", e);
    }
  }
}

export async function isFullscreen(): Promise<boolean> {
  if (typeof (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ !== "undefined") {
    try {
      return await getCurrentWindow().isFullscreen();
    } catch {
      return false;
    }
  }
  return !!document.fullscreenElement;
}
