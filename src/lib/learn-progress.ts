import { useCallback, useEffect, useState } from "react";

/**
 * Client-side Learn progress: completed modules, watched videos and the last
 * module the reader was on (used to resume). Stored in localStorage so it
 * works for signed-out visitors too.
 */

const STORAGE_KEY = "learn-progress-v1";
const EVENT = "learn-progress-change";

export type LearnProgress = {
  modules: Record<string, boolean>;
  videos: Record<string, boolean>;
  lastModule: string | null;
};

const EMPTY: LearnProgress = { modules: {}, videos: {}, lastModule: null };

function read(): LearnProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<LearnProgress>;
    return {
      modules: parsed.modules ?? {},
      videos: parsed.videos ?? {},
      lastModule: parsed.lastModule ?? null,
    };
  } catch {
    return EMPTY;
  }
}

function write(next: LearnProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage disabled — progress is best-effort */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useLearnProgress() {
  // Start empty so SSR and the first client render match, then hydrate.
  const [progress, setProgress] = useState<LearnProgress>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(read());
    setHydrated(true);
    const sync = () => setProgress(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggleModule = useCallback((key: string, value?: boolean) => {
    const current = read();
    const next = value ?? !current.modules[key];
    write({ ...current, modules: { ...current.modules, [key]: next } });
  }, []);

  const toggleVideo = useCallback((id: string, value?: boolean) => {
    const current = read();
    const next = value ?? !current.videos[id];
    write({ ...current, videos: { ...current.videos, [id]: next } });
  }, []);

  const setLastModule = useCallback((key: string) => {
    const current = read();
    if (current.lastModule === key) return;
    write({ ...current, lastModule: key });
  }, []);

  const reset = useCallback(() => write(EMPTY), []);

  return { progress, hydrated, toggleModule, toggleVideo, setLastModule, reset };
}
