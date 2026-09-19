/*
 * Persistence layer: the ONLY module that talks to storage.
 * Tauri plugin-store JSON file (planner.dat in the app-data dir).
 * Falls back to memory when running outside Tauri (plain vite preview).
 */

import { Store } from "@tauri-apps/plugin-store";
import type { PlannerHistory } from "./types";

const FILE = "planner.dat";
const K_COMPLETIONS = "planner.v1.completions";
const K_GRADES = "planner.v1.grades";
const K_REPAIRS = "planner.v1.repairs";

let store: Store | null = null;
let memory: Record<string, unknown> = {};
let useMemory = false;

async function getStore(): Promise<Store | null> {
  if (useMemory) return null;
  if (!store) {
    try {
      store = await Store.load(FILE);
    } catch (e) {
      console.warn("[store] Tauri store unavailable, using memory:", e);
      useMemory = true;
      return null;
    }
  }
  return store;
}

export async function loadHistory(): Promise<PlannerHistory> {
  const s = await getStore();
  if (!s) {
    return {
      completions: (memory[K_COMPLETIONS] as PlannerHistory["completions"]) ?? [],
      grades: (memory[K_GRADES] as PlannerHistory["grades"]) ?? [],
      repairs: (memory[K_REPAIRS] as PlannerHistory["repairs"]) ?? [],
    };
  }
  const [completions, grades, repairs] = await Promise.all([
    s.get<PlannerHistory["completions"]>(K_COMPLETIONS),
    s.get<PlannerHistory["grades"]>(K_GRADES),
    s.get<PlannerHistory["repairs"]>(K_REPAIRS),
  ]);
  return {
    completions: completions ?? [],
    grades: grades ?? [],
    repairs: repairs ?? [],
  };
}

export async function saveHistory(h: PlannerHistory): Promise<void> {
  const s = await getStore();
  if (!s) {
    memory = {
      [K_COMPLETIONS]: h.completions,
      [K_GRADES]: h.grades,
      [K_REPAIRS]: h.repairs,
    };
    return;
  }
  await Promise.all([
    s.set(K_COMPLETIONS, h.completions),
    s.set(K_GRADES, h.grades),
    s.set(K_REPAIRS, h.repairs),
  ]);
  await s.save();
}
