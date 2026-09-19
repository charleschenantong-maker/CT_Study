import { useEffect, useRef, type ChangeEvent } from "react";
import { Download, Monitor, Moon, Sun, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadHistory, saveHistory } from "@/study/store";
import type { PlannerHistory } from "@/study/types";
import type { Theme } from "./useSettings";

interface Props {
  open: boolean;
  onClose: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const THEME_OPTIONS: Array<{ v: Theme; Icon: typeof Sun; label: string }> = [
  { v: "light", Icon: Sun, label: "浅色" },
  { v: "dark", Icon: Moon, label: "深色" },
  { v: "system", Icon: Monitor, label: "跟随系统" },
];

export function SettingsModal({ open, onClose, theme, setTheme }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

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
      alert("导出备份失败");
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
        alert("备份文件格式不正确，需包含 completions/grades/repairs 三个数组");
        return;
      }
      if (!window.confirm("确定用该备份覆盖当前全部数据？此操作不可恢复。")) return;
      const h = data as PlannerHistory;
      await saveHistory({ completions: h.completions, grades: h.grades, repairs: h.repairs });
      location.reload();
    } catch (err) {
      console.error("[settings] import failed:", err);
      alert("导入恢复失败");
    } finally {
      e.target.value = "";
    }
  }

  async function handleClear() {
    if (!window.confirm("确定清空全部学习数据？此操作不可恢复。")) return;
    if (!window.confirm("再次确认：真的要清空 completions/grades/repairs 全部记录吗？")) return;
    try {
      await saveHistory({ completions: [], grades: [], repairs: [] });
      location.reload();
    } catch (e) {
      console.error("[settings] clear failed:", e);
      alert("清空数据失败");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-4">
          <p className="text-[15px] font-semibold">设置</p>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground"
            onClick={onClose}
            aria-label="关闭"
          >
            <X />
          </Button>
        </div>
        <div className="min-h-0 space-y-6 overflow-y-auto p-5">
          <section className="space-y-2">
            <p className="text-sm font-medium">外观</p>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map(({ v, Icon, label }) => (
                <Button
                  key={v}
                  variant={theme === v ? "default" : "outline"}
                  className="h-auto flex-col gap-1 py-3 text-xs"
                  onClick={() => setTheme(v)}
                >
                  <Icon />
                  {label}
                </Button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <p className="text-sm font-medium">数据管理</p>
            <div className="grid gap-2">
              <Button variant="outline" className="w-full" onClick={handleExport}>
                <Download /> 导出备份
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileRef.current?.click()}
              >
                <Upload /> 导入恢复
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
                <Trash2 /> 清空数据
              </Button>
            </div>
          </section>

          <section className="space-y-1.5">
            <p className="text-sm font-medium">关于</p>
            <p className="text-[13px] text-muted-foreground">Planner v0.1.0</p>
            <p className="text-[13px] text-muted-foreground">
              数据存在本地应用目录 planner.dat
            </p>
            <p className="text-[13px] text-muted-foreground">
              XP 按任务模板快照累计，条纹按核心任务完成判定，补签消耗 XP。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
