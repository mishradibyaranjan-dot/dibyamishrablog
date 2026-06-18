import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, Square, Loader2, Play, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

const VOLUME_KEY = "drm-tts-volume:v1";

function chunkText(text: string, maxWords = 220): string[] {
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text];
  const out: string[] = [];
  let cur = "";
  const wc = (s: string) => (s.match(/\S+/g) ?? []).length;
  const flush = () => {
    if (cur.trim()) out.push(cur.trim());
    cur = "";
  };
  for (const s of sentences) {
    if (wc(s) > maxWords) {
      flush();
      const words = s.match(/\S+/g) ?? [];
      for (let i = 0; i < words.length; i += maxWords) {
        out.push(words.slice(i, i + maxWords).join(" "));
      }
      continue;
    }
    if (cur && wc(cur) + wc(s) > maxWords) flush();
    cur += s;
  }
  flush();
  return out.length > 0 ? out : [text];
}

function collectPageText(): string {
  if (typeof document === "undefined") return "";
  const main = document.querySelector("main");
  const root = main ?? document.body;
  if (!root) return "";
  const clone = root.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll("button, nav, form, [aria-hidden='true'], script, style, [data-no-read]")
    .forEach((n) => n.remove());
  const text = clone.innerText.replace(/\s+\n/g, "\n").replace(/\n{2,}/g, "\n\n").trim();
  return text.slice(0, 4500);
}

export function ReadAloudButton() {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  // Initialize with a stable default so SSR and first client render match.
  // The persisted value is loaded from localStorage after mount.
  const [volume, setVolume] = useState<number>(0.9);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stoppedRef = useRef(false);

  // Load persisted volume after mount to avoid SSR/client hydration mismatch.
  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(VOLUME_KEY));
      if (Number.isFinite(stored) && stored >= 0 && stored <= 1) {
        setVolume(stored);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Keep current audio volume in sync with slider; persist after hydration.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    if (!hydrated) return;
    try {
      window.localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {
      // ignore
    }
  }, [volume, hydrated]);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    abortRef.current?.abort();
    abortRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setState("idle");
  }, []);

  useEffect(() => () => stop(), [stop]);

  const start = useCallback(async () => {
    if (state !== "idle") {
      stop();
      return;
    }
    const text = collectPageText();
    if (!text) {
      setError("Nothing to read on this page.");
      return;
    }
    setError(null);
    const chunks = chunkText(text);
    stoppedRef.current = false;
    setState("loading");
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      for (let i = 0; i < chunks.length; i++) {
        if (stoppedRef.current) return;
        const res = await fetch("/api/public/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: chunks[i], voice: "alloy" }),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`TTS failed (${res.status})`);
        const blob = await res.blob();
        if (stoppedRef.current) return;
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.volume = volume;
        audioRef.current = audio;
        setState("playing");
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(url);
            resolve();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Playback failed"));
          };
          audio.play().catch(reject);
        });
      }
      setState("idle");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error("Read aloud failed", err);
      setError("Couldn't play audio. Try again.");
      setState("idle");
    } finally {
      abortRef.current = null;
    }
  }, [state, stop, volume]);

  const VolumeIcon = volume === 0 ? VolumeX : Volume2;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Read this page aloud"
          className="text-foreground/80 hover:bg-foreground/10"
        >
          {state === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : state === "playing" ? (
            <Square className="h-5 w-5 fill-current text-primary" />
          ) : (
            <VolumeIcon className="h-5 w-5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-4" data-no-read>
        <div>
          <p className="text-sm font-semibold text-foreground">Read aloud</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Listen to this page. Audio is generated by AI.
          </p>
        </div>

        <Button
          type="button"
          onClick={start}
          className="w-full bg-brand-gradient text-white"
          disabled={state === "loading"}
        >
          {state === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing…
            </>
          ) : state === "playing" ? (
            <>
              <Square className="mr-2 h-4 w-4 fill-current" />
              Stop
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4 fill-current" />
              Play page
            </>
          )}
        </Button>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <VolumeIcon className="h-3.5 w-3.5" />
              Volume
            </span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <Slider
            value={[Math.round(volume * 100)]}
            min={0}
            max={100}
            step={1}
            onValueChange={(v) => setVolume((v[0] ?? 0) / 100)}
            aria-label="Volume"
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}
      </PopoverContent>
    </Popover>
  );
}
