import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export const THEMES = [
  {
    id: "glacier",
    label: "Light Blue Glassmorphic Future",
    mode: "light",
    swatches: ["#2684FF", "#8CC8FF", "#EAF4FF"],
  },
  { id: "cinematic", label: "Cinematic", mode: "dark", swatches: ["#5b8cff", "#a96cff", "#6fe0ff"] },
  { id: "midnight", label: "Midnight", mode: "dark", swatches: ["#3d5cd1", "#6d59d1", "#76a6c8"] },
  { id: "aurora", label: "Aurora", mode: "dark", swatches: ["#27d6c4", "#3ad389", "#6ee7d6"] },
  { id: "sunset", label: "Sunset", mode: "dark", swatches: ["#ff7a2d", "#ff3d77", "#ffc46b"] },
  { id: "noir", label: "Noir & Gold", mode: "dark", swatches: ["#1a1a1a", "#c9a84c", "#f0d78c"] },
  { id: "emerald", label: "Emerald", mode: "dark", swatches: ["#0d7a5f", "#31c39a", "#d8b45c"] },
  { id: "light", label: "Daylight", mode: "light", swatches: ["#1e3a8a", "#0f8a8a", "#f0a72e"] },
  { id: "paper", label: "Paper & Ink", mode: "light", swatches: ["#2d2d2d", "#8a5a44", "#c98b52"] },
  { id: "sand", label: "Warm Sand", mode: "light", swatches: ["#8b7355", "#c17c4a", "#87a878"] },
  { id: "arctic", label: "Arctic Frost", mode: "light", swatches: ["#2e6b8a", "#4a9cc0", "#8fd3e8"] },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
export type ThemeMode = (typeof THEMES)[number]["mode"];

const STORAGE_KEY = "drm-theme";
const DEFAULT_THEME: ThemeId = "glacier";

export function themeMode(theme: ThemeId): ThemeMode {
  return THEMES.find((t) => t.id === theme)?.mode ?? "light";
}

type Ctx = { theme: ThemeId; setTheme: (t: ThemeId) => void };
const ThemeContext = createContext<Ctx>({ theme: DEFAULT_THEME, setTheme: () => {} });

function isThemeId(v: string | null | undefined): v is ThemeId {
  return !!v && THEMES.some((t) => t.id === v);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const userIdRef = useRef<string | null>(null);

  // Local (per-browser) restore — instant, no network.
  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    const initial = isThemeId(stored) ? stored : DEFAULT_THEME;
    setThemeState(initial);
    applyTheme(initial, false);
  }, []);

  // Cross-device restore + sync: signed-in users carry their theme in their profile.
  useEffect(() => {
    let active = true;

    const load = async (userId: string | null) => {
      userIdRef.current = userId;
      if (!userId) return;
      const { data } = await supabase
        .from("profiles")
        .select("theme_preference")
        .eq("id", userId)
        .maybeSingle();
      if (!active) return;
      const remote = data?.theme_preference;
      if (isThemeId(remote)) {
        setThemeState(remote);
        applyTheme(remote, true);
        try {
          window.localStorage.setItem(STORAGE_KEY, remote);
        } catch {
          /* ignore */
        }
      }
    };

    supabase.auth.getSession().then(({ data }) => load(data.session?.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      load(s?.user?.id ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Cross-tab sync in the same browser.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !isThemeId(e.newValue)) return;
      setThemeState(e.newValue);
      applyTheme(e.newValue, true);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    applyTheme(next, true);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    const userId = userIdRef.current;
    if (userId) {
      void supabase.from("profiles").update({ theme_preference: next }).eq("id", userId);
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

  const mode = themeMode(theme);
  root.dataset.theme = theme;
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;

  if (enableTransition && !prefersReducedMotion) {
    window.setTimeout(() => root.classList.remove("theme-transition"), 350);
  }
}

export function useTheme() {
  return useContext(ThemeContext);
}
