import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  A11Y_STORAGE_KEY,
  DEFAULT_A11Y_PREFS,
  applyA11yPrefs,
  normalizePrefs,
  readStoredPrefs,
  writeStoredPrefs,
  type A11yPreferences,
} from "@/lib/a11y-prefs";

type Ctx = {
  prefs: A11yPreferences;
  setPref: <K extends keyof A11yPreferences>(key: K, value: A11yPreferences[K]) => void;
  reset: () => void;
  reduceMotion: boolean;
};

const AccessibilityContext = createContext<Ctx>({
  prefs: DEFAULT_A11Y_PREFS,
  setPref: () => {},
  reset: () => {},
  reduceMotion: false,
});

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<A11yPreferences>(DEFAULT_A11Y_PREFS);
  const [systemReduce, setSystemReduce] = useState(false);
  const hydrated = useRef(false);

  // Restore after mount (the inline bootstrap already applied the visual bits).
  useEffect(() => {
    const stored = readStoredPrefs();
    setPrefs(stored);
    applyA11yPrefs(stored);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSystemReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Cross-tab sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== A11Y_STORAGE_KEY || !e.newValue) return;
      try {
        const next = normalizePrefs(JSON.parse(e.newValue));
        setPrefs(next);
        applyA11yPrefs(next);
      } catch {
        /* ignore malformed payloads from other tabs */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const commit = useCallback((next: A11yPreferences) => {
    setPrefs(next);
    applyA11yPrefs(next);
    writeStoredPrefs(next);
  }, []);

  const setPref = useCallback<Ctx["setPref"]>(
    (key, value) => {
      setPrefs((current) => {
        const next = { ...current, [key]: value };
        applyA11yPrefs(next);
        writeStoredPrefs(next);
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => commit({ ...DEFAULT_A11Y_PREFS }), [commit]);

  const value = useMemo<Ctx>(
    () => ({
      prefs,
      setPref,
      reset,
      reduceMotion: prefs.reduceMotion ?? systemReduce,
    }),
    [prefs, setPref, reset, systemReduce],
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
