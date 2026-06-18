import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  if (!main) return document.body?.innerText ?? "";
  const clone = main.cloneNode(true) as HTMLElement;
  // Strip noisy controls
  clone.querySelectorAll("button, nav, form, [aria-hidden='true'], script, style").forEach((n) => n.remove());
  const text = clone.innerText.replace(/\s+\n/g, "\n").replace(/\n{2,}/g, "\n\n").trim();
  // Cap total length so we don't run minutes of audio
  return text.slice(0, 4500);
}

export function ReadAloudButton() {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stoppedRef = useRef(false);

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
    if (!text) return;
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
      console.error(err);
      setState("idle");
    } finally {
      abortRef.current = null;
    }
  }, [state, stop]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={start}
      aria-label={state === "idle" ? "Read this page aloud" : "Stop reading"}
      className="text-foreground/80 hover:bg-foreground/10"
    >
      {state === "loading" ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : state === "playing" ? (
        <Square className="h-5 w-5 fill-current" />
      ) : (
        <Volume2 className="h-5 w-5" />
      )}
    </Button>
  );
}
