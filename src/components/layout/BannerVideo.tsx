import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import tourVideo from "@/assets/video/site-tour.mp4.asset.json";
import tourPoster from "@/assets/video/site-tour-poster.jpg.asset.json";

/**
 * Compact self-hosted video banner shown beside the announcement headline on
 * every page. Plays muted + looping as a silent preview (no third-party embeds)
 * and links through to the full narrated tour on /guide.
 */
export function BannerVideo({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Respect reduced-motion: keep the poster frame instead of looping video.
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // Defer the MP4 fetch until after first paint so this 76px preview never
    // competes for bandwidth with the hero heading (Largest Contentful Paint).
    let cancelled = false;
    const start = () => {
      if (cancelled || !ref.current) return;
      ref.current.muted = true;
      ref.current.preload = "metadata";
      ref.current.load();
      void ref.current.play().catch(() => {
        /* autoplay blocked — poster stays visible */
      });
    };
    const idle = (cb: () => void) => {
      const w = window as unknown as {
        requestIdleCallback?: (c: () => void, o?: { timeout: number }) => number;
      };
      if (typeof w.requestIdleCallback === "function") {
        w.requestIdleCallback(cb, { timeout: 3000 });
        return;
      }
      window.setTimeout(cb, 2000);
    };


    if (document.readyState === "complete") {
      idle(start);
      return () => {
        cancelled = true;
      };
    }
    const onLoad = () => idle(start);
    window.addEventListener("load", onLoad, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
    };
  }, []);


  return (
    <Link
      to="/guide"
      aria-label="Watch the guided video tour of this site"
      className={cn(
        "group relative block shrink-0 overflow-hidden rounded-lg border border-blue-300/80 bg-slate-900 shadow-[0_10px_26px_-16px_rgba(37,99,235,0.9)]",
        "h-11 w-[76px] sm:h-12 sm:w-[86px]",
        className,
      )}
    >
      <video
        ref={ref}
        src={tourVideo.url}
        poster={tourPoster.url}
        muted
        loop
        playsInline
        preload="metadata"
        tabIndex={-1}
        aria-hidden
        onCanPlay={() => setReady(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-500",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        aria-hidden
        className="absolute inset-0 grid place-items-center bg-slate-950/25 transition group-hover:bg-slate-950/10"
      >
        <PlayCircle className="h-4 w-4 text-white drop-shadow sm:h-5 sm:w-5" />
      </span>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"
      />
    </Link>
  );
}
