import { useState } from "react";

export type Theme = "light" | "dark" | "system";

const KEY = "planner.settings";

function readInitial(): Theme {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed === "light" || parsed === "dark" || parsed === "system") return parsed;
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "theme" in parsed &&
        ((parsed as { theme: unknown }).theme === "light" ||
          (parsed as { theme: unknown }).theme === "dark" ||
          (parsed as { theme: unknown }).theme === "system")
      ) {
        return (parsed as { theme: Theme }).theme;
      }
    }
  } catch (e) {
    console.error("[settings] read failed:", e);
  }
  return "system";
}

export function useSettings(): { theme: Theme; setTheme: (t: Theme) => void } {
  const [theme, setThemeState] = useState<Theme>(readInitial);

  function setTheme(t: Theme) {
    setThemeState(t);
    try {
      localStorage.setItem(KEY, t);
    } catch (e) {
      console.error("[settings] save failed:", e);
    }
  }

  return { theme, setTheme };
}
