import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { X, PlayCircle, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BannerVideo } from "@/components/layout/BannerVideo";
import { BannerInfoLinks } from "@/components/layout/BannerInfoLinks";


const DISMISS_KEY = "drm-site-banner:v1";

const HEADLINES = [
  "New: a guided video tour of this site",
  "Explore Agentic AI, Cloud & Multi-Agent Systems",
  "Ask the Learning Assistant anything, anytime",
];

/** Animated graphic: orbiting nodes over a soft grid — pure SVG, no images. */
function BannerGraphic({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 64"
      className={cn("pointer-events-none h-full w-full", className)}
    >
      <defs>
        <linearGradient id="drm-banner-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0" />
          <stop offset="50%" stopColor="#2563eb" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
        <pattern id="drm-banner-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0V16" fill="none" stroke="#2563eb" strokeOpacity="0.12" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="320" height="64" fill="url(#drm-banner-grid)" />

      <motion.path
        d="M0 46 C 60 10, 110 58, 168 30 S 260 8, 320 34"
        fill="none"
        stroke="url(#drm-banner-line)"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />

      {[
        { cx: 48, cy: 22, r: 3.5, d: 0 },
        { cx: 132, cy: 44, r: 2.5, d: 0.4 },
        { cx: 214, cy: 18, r: 3, d: 0.8 },
        { cx: 286, cy: 40, r: 2.5, d: 1.2 },
      ].map((n) => (
        <motion.circle
          key={`${n.cx}-${n.cy}`}
          cx={n.cx}
          cy={n.cy}
          r={n.r}
          fill="#2563eb"
          animate={{ opacity: [0.25, 1, 0.25], scale: [0.9, 1.35, 0.9] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: n.d, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

export function SiteBanner() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  /** Clip while the open/close height animation runs, then let popovers escape. */
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) !== "1") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % HEADLINES.length), 4200);
    return () => window.clearInterval(t);
  }, [visible]);

  const dismiss = () => {
    setSettled(false);
    setVisible(false);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.aside
          key="site-banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={() => setSettled(true)}
          aria-label="Site announcement"
          className={cn(
            "relative z-[55] border-b border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50",
            settled ? "overflow-visible" : "overflow-hidden",
          )}
        >
          {/* animated graphics layer (clipped independently of popovers) */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 opacity-70">
              <BannerGraphic />
            </div>
            <motion.div
              className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent"
              animate={{ x: ["0%", "400%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
          </div>


          <div className="relative mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Guided tour
            </span>

            {/* Highlighted headline with the silent video preview beside it */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <BannerVideo />
              <div className="min-w-0 flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={index}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="truncate text-sm font-medium text-slate-800"
                  >
                    {HEADLINES[index]}
                  </motion.p>
                </AnimatePresence>
                <p className="hidden truncate text-[11px] text-slate-600 sm:block">
                  30-second narrated preview — or open{" "}
                  <span className="font-semibold text-blue-700">What&apos;s here?</span> for every
                  option explained.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/guide"
                className="group inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_10px_24px_-12px_rgba(37,99,235,0.9)] transition hover:bg-blue-700"
              >
                <PlayCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Watch the tour</span>
                <span className="sm:hidden">Tour</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <BannerInfoLinks />
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("drm:open-assistant"))
                }
                className="hidden rounded-full border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 lg:inline-flex"
              >
                Ask the assistant
              </button>

              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss announcement"
                className="rounded-full p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
