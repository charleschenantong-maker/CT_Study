import { getCurrentWindow } from "@tauri-apps/api/window";
import { Store } from "@tauri-apps/plugin-store";
import { closeWindow, minimizeWindow, toggleMaximizeWindow } from "./lib/window";
import closePng from "./assets/traffic-gmn/close.png";
import closeHoverPng from "./assets/traffic-gmn/close-hover.png";
import minimizePng from "./assets/traffic-gmn/minimize.png";
import minimizeHoverPng from "./assets/traffic-gmn/minimize-hover.png";
import fullscreenPng from "./assets/traffic-gmn/fullscreen.png";
import fullscreenHoverPng from "./assets/traffic-gmn/fullscreen-hover.png";
import unfocusedSvg from "./assets/traffic-gmn/unfocused.svg";

/**
 * Tauri 外框：index.html（WAR_PLAN 上游页）保持不动，
 * 窗口红绿灯照抄 GMN（D:/GMN/Gemini/src/renderer）：14px 灯 + base/hover 双层 +
 * 组悬停显字 + 按压缩放 + 失焦全切 unfocused。
 * 布局：左红绿灯 / 标题相对整窗居中 / 右空位（grid 1fr auto 1fr）。
 * 第三灯沿用 GMN fullscreen 图，接到 toggleMaximize（本项目无全屏概念）。
 */

const CHROME_CSS = [
  "#tauri-chrome{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;",
  "height:34px;background:#0d0f0c;border-bottom:1px solid #34392f;",
  "user-select:none;position:sticky;top:0;z-index:50}",
  "#tauri-chrome .window-controls{display:flex;gap:8px;align-items:center;",
  "height:100%;padding-left:12px;justify-self:start}",
  "#tauri-chrome .traffic{width:14px;height:14px;border-radius:50%;display:grid;",
  "place-items:center;border:0;padding:0;background:transparent;position:relative;",
  "filter:drop-shadow(0 1px 1px #00000040);cursor:pointer}",
  "#tauri-chrome .traffic .tl{position:absolute;inset:0;width:100%;height:100%;",
  "pointer-events:none;transition:opacity .15s ease-out,transform .12s ease-out,filter .12s ease-out}",
  "#tauri-chrome .traffic .tl-hover{opacity:0}",
  "#tauri-chrome .window-controls:hover .tl-hover{opacity:1}",
  "#tauri-chrome .traffic:active .tl-hover{opacity:1;transform:scale(.8);filter:brightness(.85)}",
  "#tauri-chrome-label{display:flex;align-items:center;justify-content:center;",
  "justify-self:stretch;height:100%;color:#b99043;white-space:nowrap;text-align:center;",
  'font:900 9px/1 "Courier New",monospace;letter-spacing:.14em}',
  "#tauri-chrome-spacer{justify-self:stretch;height:100%}",
].join("");

interface Lamp {
  name: string;
  label: string;
  base: string;
  hover: string;
  fn: () => Promise<void>;
}

const LAMPS: Lamp[] = [
  { name: "close", label: "关闭", base: closePng, hover: closeHoverPng, fn: closeWindow },
  { name: "minimize", label: "最小化", base: minimizePng, hover: minimizeHoverPng, fn: minimizeWindow },
  { name: "fullscreen", label: "最大化", base: fullscreenPng, hover: fullscreenHoverPng, fn: toggleMaximizeWindow },
];

function mountChrome(): void {
  if (document.getElementById("tauri-chrome")) return;
  const style = document.createElement("style");
  style.textContent = CHROME_CSS;
  document.head.appendChild(style);

  const bar = document.createElement("div");
  bar.id = "tauri-chrome";

  const controls = document.createElement("div");
  controls.className = "window-controls";
  controls.setAttribute("aria-label", "窗口控制");
  const layers: Array<{ img: HTMLImageElement; lamp: Lamp; isHover: boolean }> = [];
  for (const lamp of LAMPS) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `traffic ${lamp.name}`;
    b.setAttribute("aria-label", lamp.label);
    const base = document.createElement("img");
    base.className = "tl tl-base";
    base.src = lamp.base;
    base.alt = "";
    base.draggable = false;
    const hover = document.createElement("img");
    hover.className = "tl tl-hover";
    hover.src = lamp.hover;
    hover.alt = "";
    hover.draggable = false;
    layers.push({ img: base, lamp, isHover: false }, { img: hover, lamp, isHover: true });
    b.append(base, hover);
    b.addEventListener("click", () => {
      void lamp.fn();
    });
    controls.append(b);
  }

  const label = document.createElement("div");
  label.id = "tauri-chrome-label";
  label.setAttribute("data-tauri-drag-region", "");
  label.textContent = "CHARLES \u00B7 WAR PLAN // FIELD FILE";
  label.addEventListener("dblclick", () => {
    void toggleMaximizeWindow();
  });

  const spacer = document.createElement("div");
  spacer.id = "tauri-chrome-spacer";
  spacer.setAttribute("data-tauri-drag-region", "");

  bar.append(controls, label, spacer);
  document.body.prepend(bar);

  // GMN syncTrafficLights：失焦时两层全切 unfocused，聚焦时恢复。
  void getCurrentWindow()
    .onFocusChanged(({ payload }) => {
      for (const { img, lamp, isHover } of layers) {
        img.src = payload ? (isHover ? lamp.hover : lamp.base) : unfocusedSvg;
      }
    })
    .catch(() => {
      // 纯 vite 预览无 Tauri：保持聚焦态灯
    });
}

mountChrome();

/* ============ KV 文件桥 ============
   Tauri 下：用户数据落在应用数据目录的 war-plan.json（人类可读的文件夹文件），
   页面启动前由 bridge 预加载整表快照；首次运行自动把 WebView localStorage 整体迁入文件并清空，
   此后 localStorage 不再作为数据源。纯浏览器下 bridge 为 null，页面沿用 localStorage。 */

interface KvBridge {
  snapshot: Record<string, string>;
  save: (k: string, v: string) => void;
  remove: (k: string) => void;
  flush: () => Promise<void>;
}

declare global {
  interface Window {
    __kvBridgeReady: Promise<KvBridge | null>;
  }
}

const STORE_FILE = "war-plan.json";

function isTauri(): boolean {
  return (
    typeof (window as unknown as { __TAURI_INTERNALS__?: unknown })
      .__TAURI_INTERNALS__ !== "undefined"
  );
}

async function initKvBridge(): Promise<KvBridge | null> {
  if (!isTauri()) return null;
  const store = await Store.load(STORE_FILE, { autoSave: 100 });
  if ((await store.length()) === 0) {
    const stash: Array<[string, string]> = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k === null) continue;
      const v = window.localStorage.getItem(k);
      if (v !== null) stash.push([k, v]);
    }
    for (const [k, v] of stash) {
      await store.set(k, v);
      window.localStorage.removeItem(k);
    }
    if (stash.length > 0) await store.save();
  }
  const snapshot: Record<string, string> = {};
  for (const [k, v] of await store.entries<string>()) {
    if (typeof v === "string") snapshot[k] = v;
  }
  return {
    snapshot,
    save: (k, v) => {
      void store.set(k, v);
    },
    remove: (k) => {
      void store.delete(k);
    },
    flush: () => store.save(),
  };
}

window.__kvBridgeReady = initKvBridge().catch(() => null);
