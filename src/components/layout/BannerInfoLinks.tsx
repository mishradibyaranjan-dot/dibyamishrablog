import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Bot,
  BriefcaseBusiness,
  FileText,
  FolderOpen,
  Info,
  Mail,
  Newspaper,
  PlayCircle,
  Search,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  to?: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  action?: "assistant";
  note?: string;
};

/** Every navigable option on the site, each with a one-line explanation. */
export const SITE_OPTIONS: Option[] = [
  {
    to: "/guide",
    label: "Guided tour",
    desc: "A narrated video walkthrough of every section, with chapter jumps.",
    icon: PlayCircle,
  },
  {
    to: "/learn",
    label: "Learn",
    desc: "Ten mini-courses — AI, Cloud, SaaS, ITIL, RAG, Multi-Agent, Vector Search.",
    icon: BookOpen,
  },
  {
    to: "/research",
    label: "Research",
    desc: "Long-form notes and white papers on applied enterprise AI.",
    icon: Search,
  },
  {
    to: "/projects",
    label: "Projects",
    desc: "Platforms and products delivered, with the architecture behind them.",
    icon: FolderOpen,
  },
  {
    to: "/case-studies",
    label: "Case studies",
    desc: "Outcome-first stories: the problem, the approach, the measured result.",
    icon: BriefcaseBusiness,
  },
  {
    to: "/repository",
    label: "Repository",
    desc: "Downloadable PDFs and reports.",
    note: "Sign in",
    icon: FileText,
  },
  {
    to: "/newsletter",
    label: "Newsletter",
    desc: "Periodic briefings on Gen AI in retail and supply chain.",
    icon: Newspaper,
  },
  {
    to: "/contact",
    label: "Contact",
    desc: "Start a conversation about advisory, speaking or delivery work.",
    icon: Mail,
  },
  {
    action: "assistant",
    label: "Learning assistant",
    desc: "Ask any question about this site — it answers with voice or text.",
    icon: Bot,
  },
];

/**
 * "What's here?" affordance in the site banner: a compact info button that
 * reveals every option with a short description so first-time readers know
 * where to go next.
 */
export function BannerInfoLinks() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
          open
            ? "border-blue-500 bg-blue-600 text-white"
            : "border-blue-300 bg-white text-blue-700 hover:bg-blue-50",
        )}
      >
        <Info className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">What&apos;s here?</span>
        <span className="sm:hidden">Options</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            role="menu"
            aria-label="Site options"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-[70] w-[min(92vw,26rem)] overflow-hidden rounded-xl border border-blue-200 bg-white shadow-[0_30px_60px_-24px_rgba(15,23,42,0.35)]"
          >
            <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Where to go next
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                Nine ways to explore — pick one and the tour will follow along.
              </p>
            </div>

            <ul className="max-h-[60vh] divide-y divide-blue-50 overflow-y-auto">
              {SITE_OPTIONS.map((o) => {
                const Icon = o.icon;
                const body = (
                  <>
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{o.label}</span>
                        {o.note && (
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                            {o.note}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">
                        {o.desc}
                      </span>
                    </span>
                  </>
                );

                return (
                  <li key={o.label} role="none">
                    {o.to ? (
                      <Link
                        to={o.to}
                        role="menuitem"
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 transition hover:bg-blue-50/70"
                      >
                        {body}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpen(false);
                          window.dispatchEvent(new CustomEvent("drm:open-assistant"));
                        }}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-blue-50/70"
                      >
                        {body}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
