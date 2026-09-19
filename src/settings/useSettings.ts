import { useEffect, useState } from "react";
import type { Lang } from "./i18n";

export type Theme = "light" | "dark" | "system";
export type FontSize = "s" | "m" | "l";

export interface SettingsState {
  theme: Theme;
  fontSize: FontSize;
  /** 字体预设 id：default | serif | round | mono */
  fontFamily: string;
  /** 背景预设 id 或 "custom"（自定义壁纸） */
  bg: string;
  lang: Lang;
}

const KEY = "planner.settings";
export const WALLPAPER_KEY = "planner.wallpaper";
export const CUSTOM_BG = "custom";

const DEFAULTS: SettingsState = {
  theme: "system",
  fontSize: "m",
  fontFamily: "default",
  bg: "default",
  lang: "zh",
};

export const FONT_SIZE_PX: Record<FontSize, string> = {
  s: "14px",
  m: "16px",
  l: "18px",
};

/** 预设 id → CSS font-family；default 为空字符串（不设置，用系统默认）。 */
export const FONT_FAMILY_CSS: Record<string, string> = {
  default: "",
  serif: '"Songti SC, SimSun, NSimSun, serif"',
  round: '"Yuanti SC, YouYuan, PingFang SC, sans-serif"',
  mono: '"ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"',
};

export const FONT_OPTIONS = ["default", "serif", "round", "mono"] as const;

export const BG_PRESETS: Array<{ id: string; css: string }> = [
  { id: "default", css: "linear-gradient(180deg, #f5f5f7 0%, #e9e9ee 100%)" },
  { id: "blue", css: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 55%, #d9e8ff 100%)" },
  { id: "purple", css: "linear-gradient(135deg, #e9e2f7 0%, #f6f1ff 55%, #ddd0f5 100%)" },
  { id: "black", css: "linear-gradient(180deg, #101014 0%, #000000 100%)" },
];

export function bgCssFor(id: string): string {
  return BG_PRESETS.find((p) => p.id === id)?.css ?? BG_PRESETS[0].css;
}

function isTheme(v: unknown): v is Theme {
  return v === "light" || v === "dark" || v === "system";
}

function sanitize(parsed: unknown): SettingsState {
  if (typeof parsed !== "object" || parsed === null) return { ...DEFAULTS };
  const o = parsed as Record<string, unknown>;
  return {
    theme: isTheme(o.theme) ? o.theme : DEFAULTS.theme,
    fontSize:
      o.fontSize === "s" || o.fontSize === "m" || o.fontSize === "l"
        ? o.fontSize
        : DEFAULTS.fontSize,
    fontFamily:
      typeof o.fontFamily === "string" && o.fontFamily in FONT_FAMILY_CSS
        ? o.fontFamily
        : DEFAULTS.fontFamily,
    bg:
      typeof o.bg === "string" &&
      (o.bg === CUSTOM_BG || BG_PRESETS.some((p) => p.id === o.bg))
        ? o.bg
        : DEFAULTS.bg,
    lang: o.lang === "zh" || o.lang === "en" ? o.lang : DEFAULTS.lang,
  };
}

function readInitial(): SettingsState {
  try {
    const raw = localStorage.getItem(KEY);
    // 兼容纯字符串旧格式："light" | "dark" | "system"
    if (isTheme(raw)) return { ...DEFAULTS, theme: raw };
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isTheme(parsed)) return { ...DEFAULTS, theme: parsed };
      return sanitize(parsed);
    }
  } catch (e) {
    console.error("[settings] read failed:", e);
  }
  return { ...DEFAULTS };
}

function readWallpaper(): string | null {
  try {
    const raw = localStorage.getItem(WALLPAPER_KEY);
    if (raw && raw.startsWith("data:")) return raw;
  } catch (e) {
    console.error("[settings] wallpaper read failed:", e);
  }
  return null;
}

export interface SettingsApi extends SettingsState {
  setTheme: (t: Theme) => void;
  setFontSize: (s: FontSize) => void;
  setFontFamily: (id: string) => void;
  setBg: (id: string) => void;
  setLang: (l: Lang) => void;
  wallpaper: string | null;
  /** 写入 localStorage；配额不足等失败时抛错，由调用方 try/catch 后 alert。 */
  setWallpaper: (dataUrl: string | null) => void;
}

export function useSettings(): SettingsApi {
  const [state, setState] = useState<SettingsState>(readInitial);
  const [wallpaper, setWallpaperState] = useState<string | null>(readWallpaper);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.error("[settings] save failed:", e);
    }
  }, [state]);

  // 字号 / 字体：挂载即应用一次，后续跟随 state。
  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_PX[state.fontSize];
  }, [state.fontSize]);

  useEffect(() => {
    document.body.style.fontFamily = FONT_FAMILY_CSS[state.fontFamily] ?? "";
  }, [state.fontFamily]);

  function setTheme(t: Theme) {
    setState((prev) => ({ ...prev, theme: t }));
  }
  function setFontSize(s: FontSize) {
    setState((prev) => ({ ...prev, fontSize: s }));
  }
  function setFontFamily(id: string) {
    if (!(id in FONT_FAMILY_CSS)) return;
    setState((prev) => ({ ...prev, fontFamily: id }));
  }
  function setBg(id: string) {
    if (id !== CUSTOM_BG && !BG_PRESETS.some((p) => p.id === id)) return;
    setState((prev) => ({ ...prev, bg: id }));
  }
  function setLang(l: Lang) {
    setState((prev) => ({ ...prev, lang: l }));
  }

  function setWallpaper(dataUrl: string | null) {
    try {
      if (dataUrl === null) {
        localStorage.removeItem(WALLPAPER_KEY);
      } else {
        localStorage.setItem(WALLPAPER_KEY, dataUrl);
      }
      setWallpaperState(dataUrl);
    } catch (e) {
      console.error("[settings] wallpaper save failed:", e);
      throw new Error("wallpaper-quota");
    }
  }

  return {
    ...state,
    setTheme,
    setFontSize,
    setFontFamily,
    setBg,
    setLang,
    wallpaper,
    setWallpaper,
  };
}
