import { useEffect, useMemo, useState } from "react";
import { Monitor, Moon, Settings, Sun } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Titlebar } from "@/components/titlebar";
import { CheckinCard } from "@/components/CheckinCard";
import { WeeklyCard } from "@/components/WeeklyCard";
import { XpCard } from "@/components/XpCard";
import { ContributionGrid } from "@/components/ContributionGrid";
import { GradesCard } from "@/components/GradesCard";
import { FlipClock } from "@/components/FlipClock";
import { ExamSchedule } from "@/components/ExamSchedule";
import { nearestExam, upcomingExams } from "@/study/exams";
import { addDays, weekStart } from "@/study/dates";
import { usePlanner } from "@/study/usePlanner";
import { bgCssFor, CUSTOM_BG, useSettings, type Theme } from "@/settings/useSettings";
import { SettingsModal } from "@/settings/SettingsModal";
import { t } from "@/settings/i18n";

const THEMES: Array<{
  v: Theme;
  Icon: typeof Sun;
  labelKey: "theme.light" | "theme.dark" | "theme.system";
}> = [
  { v: "light", Icon: Sun, labelKey: "theme.light" },
  { v: "dark", Icon: Moon, labelKey: "theme.dark" },
  { v: "system", Icon: Monitor, labelKey: "theme.system" },
];

function App() {
  const {
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
  } = useSettings();
  const [resolvedDark, setResolvedDark] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pinnedExamId, setPinnedExamId] = useState<string | null>(null);
  const p = usePlanner();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
      setResolvedDark(dark);
    };
    apply();
    if (theme === "system") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  useEffect(() => {
    let last = 0;
    let unlisten: (() => void) | undefined;
    // 切回前台时强制重绘：Chromium 被遮挡后可能丢合成帧（整窗黑屏），
    // backdrop-filter 重的页面高发，重排一次即可恢复。
    const repaint = () => {
      const now = Date.now();
      if (now - last < 1000) return;
      last = now;
      document.body.style.display = "none";
      void document.body.offsetHeight;
      document.body.style.display = "";
    };
    const onVisible = () => {
      if (!document.hidden) repaint();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", repaint);
    getCurrentWindow()
      .onFocusChanged(({ payload }) => {
        if (payload) repaint();
      })
      .then((u) => {
        unlisten = u;
      })
      .catch((e) => console.error("[window] focus listener failed:", e));
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", repaint);
      unlisten?.();
    };
  }, []);

  const doneIds = new Set(
    p.history.completions
      .filter((r) => r.date === p.today && r.fraction >= 1)
      .map((r) => r.taskId),
  );

  const exams = useMemo(() => upcomingExams(p.today), [p.today]);
  const pinned = exams.find((e) => e.id === pinnedExamId);
  const target = pinned && pinned.date >= p.today ? pinned : nearestExam(p.today);
  // 每日/每周刷新靠 today key 派生（todayPlan/quotas/doneIds 均已按 today 计算），无需定时器。
  const weekMonday = weekStart(p.today);
  const weekLabel = `${weekMonday.slice(5)} ~ ${addDays(weekMonday, 6).slice(5)} ${t(lang, "app.thisWeek")}`;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {bg === CUSTOM_BG && wallpaper ? (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${wallpaper})` }}
        />
      ) : (
        <div
          className="fixed inset-0 -z-10"
          style={{ background: bgCssFor(bg) }}
        />
      )}
      {resolvedDark ? (
        <div className="fixed inset-0 -z-10 bg-black/45" />
      ) : null}
      <Titlebar lang={lang} />

      {!p.loaded ? (
        <p className="p-6 text-sm text-muted-foreground">{t(lang, "app.loading")}</p>
      ) : (
        <main className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-4 lg:grid-cols-[260px_minmax(0,1fr)_280px] lg:overflow-hidden min-[1400px]:grid-cols-[300px_minmax(0,1fr)_320px]">
          <section className="w-full min-w-0 space-y-4 lg:overflow-y-auto lg:pb-2">
            <p className="px-1 text-xs tabular-nums text-muted-foreground">
              {t(lang, "app.todayLine")
                .replace("{date}", p.today)
                .replace("{xp}", String(p.todayXp))}
            </p>
            <CheckinCard
              doneIds={doneIds}
              onToggle={p.toggleTask}
              todayPlan={p.todayPlan}
              today={p.today}
              streakNow={p.streakNow}
              streakBest={p.streakBest}
              repair={p.repair}
              onRepair={p.repairYesterday}
              lang={lang}
            />
            <WeeklyCard quotas={p.quotas} weekLabel={weekLabel} lang={lang} />
            <XpCard
              today={p.todayXp}
              week={p.weekXp}
              month={p.monthXp}
              total={p.totalXp}
              lang={lang}
            />
          </section>

          <section className="w-full min-w-0 flex-1 space-y-4 lg:overflow-y-auto lg:pb-2">
            <div className="flex flex-col gap-3 min-[1700px]:flex-row">
              <div className="min-w-0 flex-1">
                <FlipClock exam={target} className="h-full" lang={lang} />
              </div>
              <div className="w-full shrink-0 min-[1700px]:w-[440px]">
              <ContributionGrid
                xpOf={(d) => p.xpMap.get(d) ?? 0}
                className="h-full"
                lang={lang}
              />
              </div>
            </div>
            <GradesCard
              grades={p.history.grades}
              today={p.today}
              onAdd={p.addGrade}
              onDelete={p.deleteGrade}
              onBulkDelete={p.deleteGrades}
              lang={lang}
            />
          </section>

          <aside className="w-full min-w-0 lg:overflow-y-auto lg:pb-2">
            <ExamSchedule
              exams={exams}
              pinnedId={pinnedExamId}
              onPin={setPinnedExamId}
              lang={lang}
            />
          </aside>
        </main>
      )}

      <div className="fixed bottom-5 right-5 z-50 flex items-center rounded-full border bg-card p-1 shadow-lg">
        {THEMES.map(({ v, Icon, labelKey }) => (
          <button
            key={v}
            onClick={() => setTheme(v)}
            aria-label={t(lang, labelKey)}
            title={t(lang, labelKey)}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              theme === v
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
          </button>
        ))}
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label={t(lang, "settings.title")}
          title={t(lang, "settings.title")}
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        >
          <Settings className="size-4" />
        </button>
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        bg={bg}
        setBg={setBg}
        lang={lang}
        setLang={setLang}
        wallpaper={wallpaper}
        setWallpaper={setWallpaper}
      />
    </div>
  );
}

export default App;
