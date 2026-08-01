import { useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLearnProgress } from "@/lib/learn-progress";
import { AccessibleVideo } from "@/components/video/AccessibleVideo";
import type { Cue } from "@/lib/video-captions";

export type LessonChapter = {
  id: string;
  /** Start time in seconds inside the self-hosted MP4. */
  start: number;
  title: string;
  note: string;
};

/**
 * Self-hosted lesson player with chapter seeking, captions, audio controls and
 * progress tracking. Uses a native <video> element only — no third-party embeds.
 */
export function LessonPlayer({
  videoId,
  src,
  poster,
  title,
  chapters,
  cues = [],
}: {
  videoId: string;
  src: string;
  poster: string;
  title: string;
  chapters: LessonChapter[];
  cues?: Cue[];
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [activeId, setActiveId] = useState(chapters[0]!.id);
  const { progress, toggleVideo } = useLearnProgress();
  const watched = !!progress.videos[videoId];

  const handleTime = (t: number) => {
    const c = [...chapters].reverse().find((x) => t + 0.25 >= x.start);
    if (c) setActiveId((id) => (id === c.id ? id : c.id));
  };

  const seek = (start: number) => {
    const el = ref.current;
    if (!el) return;
    el.currentTime = start;
    el.muted = false;
    void el.play().catch(() => {});
    toggleVideo(videoId, true);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <div className="relative self-start overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
        <AccessibleVideo
          src={src}
          poster={poster}
          title={title}
          cues={cues}
          videoRef={ref}
          tone="dark"
          onTime={handleTime}
          onPlay={() => toggleVideo(videoId, true)}
        />
        {watched && (
          <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            <CheckCircle2 className="h-3 w-3" aria-hidden /> Watched
          </span>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-neon-cyan">
              Original lesson · self-hosted
            </div>
            <h4 className="mt-1 font-display text-sm font-bold text-white sm:text-base">{title}</h4>
          </div>
          <button
            type="button"
            onClick={() => toggleVideo(videoId)}
            className="min-h-11 text-xs font-semibold text-neon-cyan underline-offset-2 hover:underline"
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
