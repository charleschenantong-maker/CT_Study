import type { PlannerHistory } from "@/study/types";

/**
 * 设置页 IO 逻辑（原 SettingsModal handlers，无 UI、无弹窗）：
 * 备份文件名 / 备份形状校验 / 文件读取 / 壁纸压缩。
 * 失败一律抛错或返回 false，由调用方决定怎么提示。
 */

export const WALLPAPER_MAX_EDGE = 1600;
export const WALLPAPER_MAX_BYTES = 2_000_000;

/** 备份文件名：planner-backup-YYYYMMDD.json（原 handleExport）。 */
export function buildBackupFilename(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  return `planner-backup-${stamp}.json`;
}

/** 备份形状校验：必须含 completions/grades/repairs 三数组（原 handleFile）。 */
export function isPlannerHistoryData(data: unknown): data is PlannerHistory {
  if (!data || typeof data !== "object") return false;
  const o = data as Record<string, unknown>;
  return (
    Array.isArray(o.completions) && Array.isArray(o.grades) && Array.isArray(o.repairs)
  );
}

/** File -> dataURL（原 readFileAsDataURL）。 */
export function readFileAsDataURL(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(f);
  });
}

/**
 * 壁纸压缩：最长边压到 1600，JPEG 质量从 0.78 阶梯降到 0.4，保证 <=2MB。
 * 解码失败时由调用方回退原图（原 handleWallpaper 的 try/optimize 结构）。
 */
export async function optimizeWallpaper(f: File): Promise<string> {
  const source = await readFileAsDataURL(f);
  const image = new Image();
  image.src = source;
  await image.decode();
  const scale = Math.min(1, WALLPAPER_MAX_EDGE / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  let quality = 0.78;
  let result = canvas.toDataURL("image/jpeg", quality);
  while (result.length > WALLPAPER_MAX_BYTES && quality > 0.4) {
    quality -= 0.08;
    result = canvas.toDataURL("image/jpeg", quality);
  }
  return result;
}
