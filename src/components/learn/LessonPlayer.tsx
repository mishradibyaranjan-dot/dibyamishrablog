import { useEffect, useRef, useState } from "react";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLearnProgress } from "@/lib/learn-progress";

export type LessonChapter = {
  id: string;
  /** Start time in seconds inside the self-hosted MP4. */
  start: number;
  title: string;
  note: string;
};

/**
 * Self-hosted lesson player with chapter seeking and progress tracking.
 * Uses a native <video> element only — no third-party embeds.
 */
export function LessonPlayer({
  videoId,
  src,
  poster,
  title,
  chapters,
}: {
  videoId: string;
  src: string;
  poster: string;
  title: string;
  chapters: LessonChapter[];
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [started, setStarted] = useState(false);
  const [activeId, setActiveId] = useState(chapters[0]!.id);
  const { progress, toggleVideo } = useLearnProgress();
  const watched = !!progress.videos[videoId];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onTime = () => {
      const c = [...chapters].reverse().find((x) => el.currentTime + 0.25 >= x.start);
      if (c) setActiveId((id) => (id === c.id ? id : c.id));
    };
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, [chapters]);

  const seek = (start: number) => {
    const el = ref.current;
    if (!el) return;
    el.currentTime = start;
    void el.play();
    setStarted(true);
    toggleVideo(videoId, true);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="relative aspect-video w-full">
          <video
            ref={ref}
            className="absolute inset-0 h-full w-full bg-white object-cover"
            src={src}
            poster={poster}
            preload="metadata"
            playsInline
            controls={started}
            onPlay={() => {
              setStarted(true);
              toggleVideo(videoId, true);
            }}
          />
          {!started && (
            <button
              type="button"
              onClick={() => seek(0)}
              aria-label={`Play the lesson video: ${title}`}
              className="absolute inset-0 h-full w-full"
            >
              <span className="absolute inset-0 grid place-items-center bg-black/25 transition group-hover:bg-black/10">
                <PlayCircle className="h-14 w-14 text-white drop-shadow-lg" />
              </span>
            </button>
          )}
          {watched && (
            <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">
              <CheckCircle2 className="h-3 w-3" /> Watched
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-neon-cyan">
              Original lesson · self-hosted
            </div>
            <h4 className="mt-1 font-display text-sm font-bold text-white sm:text-base">{title}</h4>
          </div>
          <button
            type="button"
            onClick={() => toggleVideo(videoId)}
            className="text-xs font-semibold text-neon-cyan underline-offset-2 hover:underline"
          >
            {watched ? "Mark as unwatched" : "Mark as watched"}
          </button>
        </div>
      </div>

      <ol className="flex flex-col gap-2">
        {chapters.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => seek(c.start)}
              aria-current={activeId === c.id}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition",
                activeId === c.id
                  ? "border-neon-cyan/60 bg-white/10"
                  : "border-white/10 bg-white/[0.04] hover:border-neon-cyan/40 hover:bg-white/[0.07]",
              )}
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-neon-cyan">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>{c.title}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-white/70">{c.note}</p>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default LessonPlayer;
