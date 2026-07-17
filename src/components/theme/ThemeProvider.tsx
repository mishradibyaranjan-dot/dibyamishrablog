import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export const THEMES = [
  { id: "cinematic", label: "Cinematic", swatches: ["#5b8cff", "#a96cff", "#6fe0ff"] },
  { id: "midnight", label: "Midnight", swatches: ["#3d5cd1", "#6d59d1", "#76a6c8"] },
  { id: "aurora", label: "Aurora", swatches: ["#27d6c4", "#3ad389", "#6ee7d6"] },
  { id: "sunset", label: "Sunset", swatches: ["#ff7a2d", "#ff3d77", "#ffc46b"] },
  { id: "light", label: "Daylight", swatches: ["#3b6cff", "#9b4cff", "#36b0d0"] },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

// Force white/light theme site-wide. Toggle is a no-op.
const FORCED: ThemeId = "light";

type Ctx = { theme: ThemeId; setTheme: (t: ThemeId) => void };
const ThemeContext = createContext<Ctx>({ theme: FORCED, setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyTheme(FORCED);
  }, []);

  const setTheme = useCallback((_next: ThemeId) => {
    applyTheme(FORCED);
  }, []);

  return <ThemeContext.Provider value={{ theme: FORCED, setTheme }}>{children}</ThemeContext.Provider>;
}

function applyTheme(_theme: ThemeId) {
  const root = document.documentElement;
  root.dataset.theme = "light";
  root.classList.remove("dark");
  root.style.colorScheme = "light";
}

export function useTheme() {
  return useContext(ThemeContext);
}
