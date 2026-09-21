import { Store } from "@tauri-apps/plugin-store";

export interface KvBridge {
  snapshot: Record<string, string>;
  save: (key: string, value: string) => void;
  flush: () => Promise<void>;
}

declare global {
  interface Window {
    __kvBridgeReady: Promise<KvBridge | null>;
  }
}

const STORE_FILE = "war-plan.json";

function isTauri(): boolean {
  return typeof (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ !== "undefined";
}

async function initKvBridge(): Promise<KvBridge | null> {
  if (!isTauri()) return null;
  const store = await Store.load(STORE_FILE, { autoSave: 100 });
  if ((await store.length()) === 0) {
    const stash: Array<[string, string]> = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key === null) continue;
      const value = window.localStorage.getItem(key);
      if (value !== null) stash.push([key, value]);
    }
    for (const [key, value] of stash) {
      await store.set(key, value);
      window.localStorage.removeItem(key);
    }
    if (stash.length > 0) await store.save();
  }
  const snapshot: Record<string, string> = {};
  for (const [key, value] of await store.entries<string>()) {
    if (typeof value === "string") snapshot[key] = value;
  }
  return {
    snapshot,
    save: (key, value) => {
      void store.set(key, value);
    },
    flush: () => store.save(),
  };
}

export function installKvBridge(): void {
  window.__kvBridgeReady = initKvBridge().catch(() => null);
}
