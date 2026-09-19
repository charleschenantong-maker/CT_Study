import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Download, Monitor, Moon, Sun, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiquidGlass } from "@/components/LiquidGlass";
import { loadHistory, saveHistory } from "@/study/store";
import type { PlannerHistory } from "@/study/types";
import {
  BG_PRESETS,
  CUSTOM_BG,
  FONT_FAMILY_CSS,
  FONT_OPTIONS,
  type FontSize,
  type Theme,
} from "./useSettings";
import { t, type Lang, type StrKey } from "./i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  fontFamily: string;
  setFontFamily: (id: string) => void;
  bg: string;
  setBg: (id: string) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  wallpaper: string | null;
  setWallpaper: (dataUrl: string | null) => void;
}

const THEME_OPTIONS: Array<{ v: Theme; Icon: typeof Sun; labelKey: StrKey }> = [
  { v: "light", Icon: Sun, labelKey: "theme.light" },
  { v: "dark", Icon: Moon, labelKey: "theme.dark" },
  { v: "system", Icon: Monitor, labelKey: "theme.system" },
];

const SIZE_OPTIONS: Array<{ v: FontSize; labelKey: StrKey }> = [
  { v: "s", labelKey: "settings.sizeS" },
  { v: "m", labelKey: "settings.sizeM" },
  { v: "l", labelKey: "settings.sizeL" },
];

const FONT_LABEL_KEYS: Record<string, StrKey> = {
  default: "settings.fontDefault",
  serif: "settings.fontSerif",
  round: "settings.fontRound",
  mono: "settings.fontMono",
};

const BG_LABEL_KEYS: Record<string, StrKey> = {
  default: "settings.bgDefault",
  blue: "settings.bgBlue",
  purple: "settings.bgPurple",
  black: "settings.bgBlack",
};

const NAV_ITEMS = [
  ["appearance", "外观"], ["fontSize", "字号"], ["fontFamily", "字体"],
  ["background", "背景"], ["language", "语言"], ["data", "数据管理"], ["about", "关于"],
] as const;

function SectionTitle({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold tracking-wide">{children}</p>;
}

export function SettingsModal({
  open,
  onClose,
  theme,
  setTheme,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  bg,
  setBg,
  lang,
  setLang,
  wallpaper,
  setWallpaper,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState<(typeof NAV_ITEMS)[number][0]>("appearance");

  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, onClose]);

  if (!open) return null;

  async function handleExport() {
    try {
      const h = await loadHistory();
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
      const blob = new Blob([JSON.stringify(h, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `planner-backup-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("[settings] export failed:", e);
      alert(t(lang, "settings.errExport"));
    }
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const data: unknown = JSON.parse(text);
      if (
        !data ||
        typeof data !== "object" ||
        !Array.isArray((data as { completions?: unknown }).completions) ||
        !Array.isArray((data as { grades?: unknown }).grades) ||
        !Array.isArray((data as { repairs?: unknown }).repairs)
      ) {
        alert(t(lang, "settings.errBadFile"));
        return;
      }
      if (!window.confirm(t(lang, "settings.confirmOverwrite"))) return;
      const h = data as PlannerHistory;
      await saveHistory({ completions: h.completions, grades: h.grades, repairs: h.repairs });
      location.reload();
    } catch (err) {
      console.error("[settings] import failed:", err);
      alert(t(lang, "settings.errImport"));
    } finally {
      e.target.value = "";
    }
  }

  async function handleClear() {
    if (!window.confirm(t(lang, "settings.confirmClear"))) return;
    if (!window.confirm(t(lang, "settings.confirmClear2"))) return;
    try {
      await saveHistory({ completions: [], grades: [], repairs: [] });
      location.reload();
    } catch (e) {
      console.error("[settings] clear failed:", e);
      alert(t(lang, "settings.errClear"));
    }
  }

  function readFileAsDataURL(f: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(f);
    });
  }

  async function optimizeWallpaper(f: File): Promise<string> {
    const source = await readFileAsDataURL(f);
    const image = new Image();
    image.src = source;
    await image.decode();
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    let quality = 0.78;
    let result = canvas.toDataURL("image/jpeg", quality);
    while (result.length > 2_000_000 && quality > 0.4) {
      quality -= 0.08;
      result = canvas.toDataURL("image/jpeg", quality);
    }
    return result;
  }

  async function handleWallpaper(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const dataUrl = await optimizeWallpaper(f);
      try {
        setWallpaper(dataUrl);
      } catch {
        alert(t(lang, "settings.bgQuotaFail"));
        return;
      }
      setBg(CUSTOM_BG);
    } finally {
      e.target.value = "";
    }
  }

  function handleRemoveWallpaper() {
    try {
      setWallpaper(null);
    } catch {
      alert(t(lang, "settings.bgQuotaFail"));
      return;
    }
    if (bg === CUSTOM_BG) setBg("default");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="flex max-h-[78vh] min-h-[520px] w-full max-w-3xl flex-col rounded-[24px] border border-white/50 bg-white/75 shadow-[0_30px_90px_rgba(15,23,42,0.28)] backdrop-blur-3xl dark:border-white/15 dark:bg-slate-950/75"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-4">
          <p className="text-[15px] font-semibold">{t(lang, "settings.title")}</p>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground"
            onClick={onClose}
            aria-label={t(lang, "common.close")}
          >
            <X />
          </Button>
        </div>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <nav className="w-44 shrink-0 space-y-1 border-r border-border/60 bg-black/[0.03] p-3 dark:bg-white/[0.03]">
            {NAV_ITEMS.map(([id, label]) => <button key={id} type="button" onClick={() => setActive(id)} className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${active === id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>{label}</button>)}
          </nav>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-white/20 to-white/5 p-5 sm:p-6 dark:from-white/5 dark:to-transparent">
          <LiquidGlass className={`p-4 ${active === "appearance" ? "" : "hidden"}`}><section className="space-y-3">
            <SectionTitle>{t(lang, "settings.appearance")}</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map(({ v, Icon, labelKey }) => (
                <Button
                  key={v}
                  variant={theme === v ? "default" : "outline"}
                  className="h-auto flex-col gap-1 py-3 text-xs"
                  onClick={() => setTheme(v)}
                >
                  <Icon />
                  {t(lang, labelKey)}
                </Button>
              ))}
            </div>
          </section></LiquidGlass>

          <LiquidGlass className={`p-4 ${active === "fontSize" ? "" : "hidden"}`}><section className="space-y-3">
            <SectionTitle>{t(lang, "settings.fontSize")}</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              {SIZE_OPTIONS.map(({ v, labelKey }) => (
                <Button
                  key={v}
                  variant={fontSize === v ? "default" : "outline"}
                  className="h-auto py-3 text-xs"
                  onClick={() => setFontSize(v)}
                >
                  {t(lang, labelKey)}
                </Button>
              ))}
            </div>
          </section></LiquidGlass>

          <LiquidGlass className={`p-4 ${active === "fontFamily" ? "" : "hidden"}`}><section className="space-y-3">
            <SectionTitle>{t(lang, "settings.fontFamily")}</SectionTitle>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FONT_OPTIONS.map((id) => (
                <Button
                  key={id}
                  variant={fontFamily === id ? "default" : "outline"}
                  className="h-auto py-3 text-xs"
                  style={{ fontFamily: FONT_FAMILY_CSS[id] || undefined }}
                  onClick={() => setFontFamily(id)}
                >
                  {t(lang, FONT_LABEL_KEYS[id])}
                </Button>
              ))}
            </div>
          </section></LiquidGlass>

          <LiquidGlass className={`p-4 ${active === "background" ? "" : "hidden"}`}><section className="space-y-3">
            <SectionTitle>{t(lang, "settings.background")}</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {BG_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setBg(p.id)}
                  className={`group rounded-xl border p-1.5 text-left transition-colors ${
                    bg === p.id ? "border-primary ring-2 ring-primary/40" : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className="block h-12 w-full rounded-lg border"
                    style={{ background: p.css }}
                  />
                  <span className="mt-1.5 block px-0.5 text-xs">
                    {t(lang, BG_LABEL_KEYS[p.id])}
                  </span>
                </button>
              ))}
              {wallpaper ? (
                <button
                  key={CUSTOM_BG}
                  type="button"
                  onClick={() => setBg(CUSTOM_BG)}
                  className={`group rounded-xl border p-1.5 text-left transition-colors ${
                    bg === CUSTOM_BG ? "border-primary ring-2 ring-primary/40" : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className="block h-12 w-full rounded-lg border bg-cover bg-center"
                    style={{ backgroundImage: `url(${wallpaper})` }}
                  />
                  <span className="mt-1.5 block px-0.5 text-xs">
                    {t(lang, "settings.bgUpload")}
                  </span>
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => bgFileRef.current?.click()}>
                <Upload /> {t(lang, "settings.bgUpload")}
              </Button>
              <input
                ref={bgFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleWallpaper}
              />
              {wallpaper ? (
                <Button variant="outline" onClick={handleRemoveWallpaper}>
                  <Trash2 /> {t(lang, "settings.bgRemove")}
                </Button>
              ) : null}
            </div>
          </section></LiquidGlass>

          <LiquidGlass className={`p-4 ${active === "language" ? "" : "hidden"}`}><section className="space-y-3">
            <SectionTitle>{t(lang, "settings.language")}</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={lang === "zh" ? "default" : "outline"}
                className="h-auto py-3 text-xs"
                onClick={() => setLang("zh")}
              >
                中文
              </Button>
              <Button
                variant={lang === "en" ? "default" : "outline"}
                className="h-auto py-3 text-xs"
                onClick={() => setLang("en")}
              >
                English
              </Button>
            </div>
          </section></LiquidGlass>

          <LiquidGlass className={`p-4 ${active === "data" ? "" : "hidden"}`}><section className="space-y-3">
            <SectionTitle>{t(lang, "settings.data")}</SectionTitle>
            <div className="grid gap-2">
              <Button variant="outline" className="w-full" onClick={handleExport}>
                <Download /> {t(lang, "settings.export")}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileRef.current?.click()}
              >
                <Upload /> {t(lang, "settings.import")}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={handleFile}
              />
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
                onClick={handleClear}
              >
                <Trash2 /> {t(lang, "settings.clear")}
              </Button>
            </div>
          </section></LiquidGlass>

          <LiquidGlass className={`p-4 ${active === "about" ? "" : "hidden"}`}><section className="space-y-1.5">
            <SectionTitle>{t(lang, "settings.about")}</SectionTitle>
            <p className="text-[13px] text-muted-foreground">Planner v0.1.0</p>
            <p className="text-[13px] text-muted-foreground">
              {t(lang, "settings.aboutData")}
            </p>
            <p className="text-[13px] text-muted-foreground">
              {t(lang, "settings.aboutXp")}
            </p>
          </section></LiquidGlass>
          </div>
        </div>
      </div>
    </div>
  );
}
