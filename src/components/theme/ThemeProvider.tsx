import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export const THEMES = [
  { id: "cinematic", label: "Cinematic", swatches: ["#5b8cff", "#a96cff", "#6fe0ff"] },
  { id: "midnight", label: "Midnight", swatches: ["#3d5cd1", "#6d59d1", "#76a6c8"] },
  { id: "aurora", label: "Aurora", swatches: ["#27d6c4", "#3ad389", "#6ee7d6"] },
  { id: "sunset", label: "Sunset", swatches: ["#ff7a2d", "#ff3d77", "#ffc46b"] },
  { id: "light", label: "Daylight", swatches: ["#3b6cff", "#9b4cff", "#36b0d0"] },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

const STORAGE_KEY = "drm-theme:v1";
const DEFAULT: ThemeId = "light";

type Ctx = { theme: ThemeId; setTheme: (t: ThemeId) => void };
const ThemeContext = createContext<Ctx>({ theme: DEFAULT, setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
      if (stored && THEMES.some((t) => t.id === stored)) {
        setThemeState(stored);
        applyTheme(stored);
      } else {
        applyTheme(DEFAULT);
      }
    } catch {
      applyTheme(DEFAULT);
    }
  }, []);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

function applyTheme(theme: ThemeId) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  if (theme === "light") {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  } else {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  }
}

export function useTheme() {
  return useContext(ThemeContext);
}
