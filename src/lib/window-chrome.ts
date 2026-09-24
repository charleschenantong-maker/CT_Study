import { getCurrentWindow } from "@tauri-apps/api/window";
import closePng from "../assets/traffic-gmn/close.png";
import closeHoverPng from "../assets/traffic-gmn/close-hover.png";
import fullscreenPng from "../assets/traffic-gmn/fullscreen.png";
import fullscreenHoverPng from "../assets/traffic-gmn/fullscreen-hover.png";
import minimizePng from "../assets/traffic-gmn/minimize.png";
import minimizeHoverPng from "../assets/traffic-gmn/minimize-hover.png";
import unfocusedSvg from "../assets/traffic-gmn/unfocused.svg";
import { closeWindow, minimizeWindow, toggleMaximizeWindow } from "./window";

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

async function syncMaximizedClass(): Promise<void> {
  try {
    const maximized = await getCurrentWindow().isMaximized();
    document.body.classList.toggle("is-maximized", maximized);
  } catch {
    document.body.classList.remove("is-maximized");
  }
}

export function mountWindowChrome(): void {
  if (document.getElementById("tauri-chrome")) return;
  const style = document.createElement("style");
  style.textContent = CHROME_CSS;
  document.head.appendChild(style);

  const bar = document.createElement("div");
  bar.id = "tauri-chrome";
  bar.setAttribute("data-tauri-drag-region", "");

  const controls = document.createElement("div");
  controls.className = "window-controls";
  controls.setAttribute("data-tauri-drag-region", "");
  controls.setAttribute("aria-label", "窗口控制");
  const layers: Array<{ img: HTMLImageElement; lamp: Lamp; isHover: boolean }> = [];
  for (const lamp of LAMPS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `traffic ${lamp.name}`;
    button.setAttribute("aria-label", lamp.label);
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
    button.append(base, hover);
    button.addEventListener("click", () => void lamp.fn());
    controls.append(button);
  }

  const label = document.createElement("div");
  label.id = "tauri-chrome-label";
  label.setAttribute("data-tauri-drag-region", "");
  label.textContent = "CHARLES \u00B7 WAR PLAN // FIELD FILE";
  label.addEventListener("dblclick", () => void toggleMaximizeWindow());

  const spacer = document.createElement("div");
  spacer.id = "tauri-chrome-spacer";
  spacer.setAttribute("data-tauri-drag-region", "");

  bar.append(controls, label, spacer);
  document.body.prepend(bar);

  void syncMaximizedClass();

  try {
    const win = getCurrentWindow();
    void win
      .onFocusChanged(({ payload }) => {
        for (const { img, lamp, isHover } of layers) {
          img.src = payload ? (isHover ? lamp.hover : lamp.base) : unfocusedSvg;
        }
        void syncMaximizedClass();
      })
      .catch(() => {});
    void win
      .onResized(() => {
        void syncMaximizedClass();
      })
      .catch(() => {});
  } catch {
    // Browser preview: keep the focused traffic-light assets.
  }
}
