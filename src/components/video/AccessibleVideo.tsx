import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Pause,
  Play,
  Volume2,
  VolumeX,
  Captions,
  CaptionsOff,
  Settings2,
  Contrast,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { cueAt, type Cue } from "@/lib/video-captions";
import {
  CAPTION_SIZE_CLASS,
  CAPTION_SIZE_LABEL,
  useCaptionPrefs,
  type CaptionSize,
} from "@/lib/caption-prefs";

const SIZES: CaptionSize[] = ["sm", "md", "lg", "xl"];

function fmt(t: number) {
  if (!Number.isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export type AccessibleVideoProps = {
  src: string;
  poster: string;
  /** Accessible title of the video, used for control labels. */
  title: string;
  cues: Cue[];
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Fired on every playback position change (seconds). */
  onTime?: (time: number, duration: number) => void;
  onPlay?: () => void;
  className?: string;
  /** Optional darker chrome for the light-theme guide page. */
  tone?: "light" | "dark";
};

/**
 * Self-hosted narrated video with accessible captions (selectable font size +
 * high-contrast mode) and full audio controls: play/pause, mute and volume.
 */
export function AccessibleVideo({
  src,
  poster,
  title,
  cues,
  videoRef,
  onTime,
  onPlay,
  className,
  tone = "light",
}: AccessibleVideoProps) {
  const { prefs, update } = useCaptionPrefs();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [started, setStarted] = useState(false);
  const captionId = useId();
  const timeCb = useRef(onTime);
  timeCb.current = onTime;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const sync = () => {
      setTime(el.currentTime);
      setDuration(Number.isFinite(el.duration) ? el.duration : 0);
      timeCb.current?.(el.currentTime, el.duration || 0);
    };
    const onPlaying = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVol = () => {
      setMuted(el.muted);
      setVolume(el.volume);
    };
    el.addEventListener("timeupdate", sync);
    el.addEventListener("loadedmetadata", sync);
    el.addEventListener("play", onPlaying);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onPause);
    el.addEventListener("volumechange", onVol);
    return () => {
      el.removeEventListener("timeupdate", sync);
      el.removeEventListener("loadedmetadata", sync);
      el.removeEventListener("play", onPlaying);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onPause);
      el.removeEventListener("volumechange", onVol);
    };
  }, [videoRef]);

  const toggle = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    setStarted(true);
    if (el.paused) {
      el.muted = false;
      void el.play().catch(() => {});
      onPlay?.();
    } else {
      el.pause();
    }
  }, [onPlay, videoRef]);

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    if (!el.muted && el.volume === 0) el.volume = 0.7;
  };

  const setVol = (v: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.volume = v;
    el.muted = v === 0;
  };

  const scrub = (v: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = v;
    setTime(v);
  };

  const cue = prefs.enabled ? cueAt(cues, time) : null;
  const dark = tone === "dark";

  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="relative aspect-video w-full bg-slate-950">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full bg-white object-cover"
          src={src}
          poster={poster}
          preload="metadata"
          playsInline
          aria-describedby={captionId}
          onPlay={() => {
            setStarted(true);
            setPlaying(true);
            onPlay?.();
          }}
        />

        {!started && (
          <button
            type="button"
            onClick={toggle}
            aria-label={`Play ${title}`}
            className="group absolute inset-0 h-full w-full"
          >
            <span className="absolute inset-0 grid place-items-center bg-slate-950/35 transition group-hover:bg-slate-950/20">
              <Play className="h-14 w-14 text-white drop-shadow-lg" aria-hidden />
            </span>
          </button>
        )}

        {/* Caption region — announced politely so screen readers follow narration */}
        <div
          id={captionId}
          aria-live="polite"
          aria-atomic="true"
          className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center px-3"
        >
          {cue && (
            <p
              className={cn(
                "max-w-[92%] rounded-lg px-3 py-1.5 text-center font-medium",
                CAPTION_SIZE_CLASS[prefs.size],
                prefs.highContrast
                  ? "border-2 border-white bg-black text-white [text-shadow:none]"
                  : "bg-slate-950/75 text-white backdrop-blur-sm",
              )}
            >
              {cue.text}
            </p>
          )}
        </div>
      </div>

      {/* Control bar */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 border-t px-3 py-3 sm:px-4",
          dark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white",
        )}
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          {playing ? (
            <Pause className="h-4 w-4" aria-hidden />
          ) : (
            <Play className="h-4 w-4" aria-hidden />
          )}
        </button>

        <div className="flex min-w-[140px] flex-1 items-center gap-2">
          <Slider
            value={[Math.min(time, duration || time)]}
            min={0}
            max={duration || 1}
            step={0.1}
            onValueChange={([v]) => scrub(v ?? 0)}
            aria-label={`Seek ${title}`}
            className="flex-1"
          />
          <span
            className={cn(
              "shrink-0 font-mono text-[11px] tabular-nums",
              dark ? "text-white/70" : "text-slate-600",
            )}
          >
            {fmt(time)} / {fmt(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted || volume === 0 ? "Unmute narration" : "Mute narration"}
            className={cn(
              "grid h-11 w-11 place-items-center rounded-full border transition",
              dark
                ? "border-white/15 text-white hover:bg-white/10"
                : "border-slate-200 text-slate-700 hover:bg-slate-100",
            )}
          >
            {muted || volume === 0 ? (
              <VolumeX className="h-4 w-4" aria-hidden />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden />
            )}
          </button>
          <Slider
            value={[muted ? 0 : Math.round(volume * 100)]}
            min={0}
            max={100}
            step={5}
            onValueChange={([v]) => setVol((v ?? 0) / 100)}
            aria-label="Narration volume"
            className="w-20 sm:w-24"
          />

          <button
            type="button"
            onClick={() => update({ enabled: !prefs.enabled })}
            aria-pressed={prefs.enabled}
            aria-label={prefs.enabled ? "Turn captions off" : "Turn captions on"}
            className={cn(
              "inline-flex h-11 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition",
              prefs.enabled
                ? "border-blue-500 bg-blue-600 text-white hover:bg-blue-700"
                : dark
                  ? "border-white/15 text-white hover:bg-white/10"
                  : "border-slate-200 text-slate-700 hover:bg-slate-100",
            )}
          >
            {prefs.enabled ? (
              <Captions className="h-4 w-4" aria-hidden />
            ) : (
              <CaptionsOff className="h-4 w-4" aria-hidden />
            )}
            CC
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Caption settings: font size and high contrast"
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-full border transition",
                  dark
                    ? "border-white/15 text-white hover:bg-white/10"
                    : "border-slate-200 text-slate-700 hover:bg-slate-100",
                )}
              >
                <Settings2 className="h-4 w-4" aria-hidden />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Caption font size
              </p>
              <div
                className="mt-2 grid grid-cols-4 gap-1.5"
                role="group"
                aria-label="Caption font size"
              >
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update({ size: s })}
                    aria-pressed={prefs.size === s}
                    aria-label={CAPTION_SIZE_LABEL[s]}
                    className={cn(
                      "min-h-11 rounded-lg border text-xs font-semibold transition",
                      prefs.size === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => update({ highContrast: !prefs.highContrast })}
                aria-pressed={prefs.highContrast}
                className={cn(
                  "mt-3 flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 text-xs font-semibold transition",
                  prefs.highContrast
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Contrast className="h-4 w-4" aria-hidden />
                  High-contrast captions
                </span>
                <span>{prefs.highContrast ? "On" : "Off"}</span>
              </button>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Preferences apply to every narrated video on this site and are remembered in this
                browser.
              </p>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Full transcript for assistive tech and keyboard users */}
      <details
        className={cn(
          "border-t px-3 py-2 text-xs sm:px-4",
          dark
            ? "border-white/10 bg-slate-900 text-white/70"
            : "border-slate-200 bg-white text-slate-600",
        )}
      >
        <summary className="cursor-pointer font-semibold">Transcript</summary>
        <ol className="mt-2 space-y-1">
          {cues.map((c) => (
            <li key={`${c.start}-${c.text}`}>
              <button
                type="button"
                onClick={() => scrub(c.start)}
                className="text-left underline-offset-2 hover:underline"
              >
                <span className="font-mono tabular-nums opacity-70">{fmt(c.start)}</span> {c.text}
              </button>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

export default AccessibleVideo;
