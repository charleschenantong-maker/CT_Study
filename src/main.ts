import { installKvBridge } from "./lib/kv-bridge";
import { mountWindowChrome } from "./lib/window-chrome";
import { setFullscreen, isFullscreen } from "./lib/window";

declare global {
  interface Window {
    __setFullscreen?: (fullscreen: boolean) => Promise<void>;
    __isFullscreen?: () => Promise<boolean>;
  }
}

window.__setFullscreen = setFullscreen;
window.__isFullscreen = isFullscreen;

mountWindowChrome();
installKvBridge();
