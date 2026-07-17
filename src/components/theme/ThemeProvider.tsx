import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export const THEMES = [
  { id: "cinematic", label: "Cinematic", swatches: ["#5b8cff", "#a96cff", "#6fe0ff"] },
  { id: "midnight", label: "Midnight", swatches: ["#3d5cd1", "#6d59d1", "#76a6c8"] },
  { id: "aurora", label: "Aurora", swatches: ["#27d6c4", "#3ad389", "#6ee7d6"] },
  { id: "sunset", label: "Sunset", swatches: ["#ff7a2d", "#ff3d77", "#ffc46b"] },
  { id: "light", label: "Daylight", swatches: ["#3b6cff", "#9b4cff", "#36b0d0"] },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

const STORAGE_KEY = "drm-theme";
const DEFAULT_THEME: ThemeId = "light";

type Ctx = { theme: ThemeId; setTheme: (t: ThemeId) => void };
const ThemeContext = createContext<Ctx>({ theme: DEFAULT_THEME, setTheme: () => {} });

function isThemeId(v: string | null): v is ThemeId {
  return !!v && THEMES.some((t) => t.id === v);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    const initial = isThemeId(stored) ? stored : DEFAULT_THEME;
    setThemeState(initial);
    applyTheme(initial, false);
  }, []);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    applyTheme(next, true);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

function applyTheme(theme: ThemeId, enableTransition: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (enableTransition && !prefersReducedMotion) {
    root.classList.add("theme-transition");
  }

  root.dataset.theme = theme;
  root.classList.toggle("dark", theme !== "light");
  root.style.colorScheme = theme === "light" ? "light" : "dark";

  if (enableTransition && !prefersReducedMotion) {
    window.setTimeout(() => root.classList.remove("theme-transition"), 350);
  }
}

export function useTheme() {
  return useContext(ThemeContext);
}
