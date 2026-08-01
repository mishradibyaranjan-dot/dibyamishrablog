import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  PlayCircle,
  Compass,
  BookOpen,
  FlaskConical,
  Briefcase,
  Mail,
  GraduationCap,
  FolderOpen,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { SITE_ORIGIN } from "@/lib/og-images";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import { cn } from "@/lib/utils";

const DESC =
  "A guided video walkthrough of this site — where to find research, the Learn modules, projects, case studies, the document repository, and the AI Learning Assistant.";
const TITLE = "Site Guide — Video Walkthrough | Dibya Ranjan Mishra";

export const Route = createFileRoute("/guide")({
  head: () => {
    const url = `${SITE_ORIGIN}/guide`;
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESC },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESC },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: TITLE },
        { name: "twitter:description", content: DESC },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [breadcrumbScript([{ name: "Site Guide", path: "/guide" }])],
    };
  },
  component: GuidePage,
});

type Chapter = {
  id: string;
  /** start time in the self-hosted tour video, seconds */
  start: number;
  label: string;
  title: string;
  blurb: string;
  to: string;
  cta: string;
  icon: typeof Compass;
};

const CHAPTERS: Chapter[] = [
  {
    id: "start",
    start: 0,
    label: "01 · Start here",
    title: "What this site is",
    blurb:
      "A working portfolio and research library: applied AI, cloud-native platforms, SaaS architecture, and engineering leadership. Begin on the home page, then follow whichever thread matches your goal.",
    to: "/",
    cta: "Open the home page",
    icon: Compass,
  },
  {
    id: "learn",
    start: 5,
    label: "02 · Learn",
    title: "Structured learning modules",
    blurb:
      "Deep-dive modules with architecture diagrams, comparison charts, embedded PDFs, and video examples. Progress checkmarks remember where you stopped.",
    to: "/learn",
    cta: "Go to Learn",
    icon: GraduationCap,
  },
  {
    id: "research",
    start: 10,
    label: "03 · Research",
    title: "Essays, notes and white papers",
    blurb:
      "Long-form research on Agentic AI, RAG at enterprise scale, delivery predictability, and platform modernization — searchable and categorized.",
    to: "/research",
    cta: "Browse Research",
    icon: FlaskConical,
  },
  {
    id: "work",
    start: 15,
    label: "04 · Work",
    title: "Projects and case studies",
    blurb:
      "Delivery stories with the constraints, the architecture, and the measured outcome — written so an engineer can evaluate the decisions, not just the results.",
    to: "/case-studies",
    cta: "See Case Studies",
    icon: Briefcase,
  },
  {
    id: "repository",
    start: 20,
    label: "05 · Repository",
    title: "Documents and downloads",
    blurb:
      "White papers, reference PDFs, and supporting material. Read them inline with the built-in viewer or download for later.",
    to: "/repository",
    cta: "Open Repository",
    icon: FolderOpen,
  },
  {
    id: "assistant",
    start: 25,
    label: "06 · Assistant",
    title: "Ask the Learning Assistant",
    blurb:
      "The floating assistant knows this site's content. Ask it to summarise a module, compare approaches, or point you to the right page.",
    to: "/contact",
    cta: "Get in touch",
    icon: MessageCircle,
  },
];

const QUICK_LINKS = [
  { to: "/about", label: "About", note: "Background, role, credentials", icon: BookOpen },
  { to: "/learn", label: "Learn", note: "Modules, diagrams, videos", icon: GraduationCap },
  { to: "/research", label: "Research", note: "Essays and white papers", icon: FlaskConical },
  { to: "/projects", label: "Projects", note: "Build log and outcomes", icon: Briefcase },
  { to: "/repository", label: "Repository", note: "PDFs and downloads", icon: FolderOpen },
  { to: "/newsletter", label: "Newsletter", note: "Monthly research notes", icon: Mail },
] as const;

function VideoStage({
  chapter,
  videoRef,
  onPlayChapter,
}: {
  chapter: Chapter;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onPlayChapter: () => void;
}) {
  const [started, setStarted] = useState(false);

  const play = () => {
    setStarted(true);
    onPlayChapter();
  };

  return (
    <div className="relative self-start overflow-hidden rounded-3xl border border-blue-200 bg-slate-900 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.55)]">
      <div className="relative aspect-video w-full">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full bg-white object-cover"
          src={tourVideo.url}
          poster={tourPoster.url}
          preload="metadata"
          playsInline
          controls={started}
          onPlay={() => setStarted(true)}
        />
        {!started && (
          <button
            type="button"
            onClick={play}
            aria-label={`Play the site tour: ${chapter.title}`}
            className="group absolute inset-0 h-full w-full"
          >
            <span className="absolute inset-0 grid place-items-center bg-slate-950/35 transition group-hover:bg-slate-950/20">
              <motion.span
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex"
              >
                <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" />
              </motion.span>
            </span>
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
            {chapter.label}
          </p>
          <p className="text-sm font-semibold text-white">{chapter.title}</p>
          <p className="mt-0.5 text-[11px] text-white/60">
            Self-hosted walkthrough — no third-party video embeds.
          </p>
        </div>
        <Link
          to={chapter.to}
          className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
        >
          {chapter.cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function GuidePage() {
  const [activeId, setActiveId] = useState(CHAPTERS[0]!.id);
  const [seen, setSeen] = useState<Record<string, boolean>>({ [CHAPTERS[0]!.id]: true });
  const active = CHAPTERS.find((c) => c.id === activeId) ?? CHAPTERS[0]!;
  const progress = Math.round((Object.keys(seen).length / CHAPTERS.length) * 100);

  const select = (id: string) => {
    setActiveId(id);
    setSeen((s) => ({ ...s, [id]: true }));
  };

  return (
    <>
      <Section className="pb-8">
        <SectionHeader
          as="h1"
          eyebrow="Navigation guide"
          title="A guided video tour of this site"
          description={DESC}
        />

        {/* interactive progress rail */}
        <div className="mb-8 rounded-2xl border border-blue-200 bg-white/70 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Tour progress</span>
            <span className="text-blue-700">{progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
          <VideoStage chapter={active} />

          <ol className="flex flex-col gap-3">
            {CHAPTERS.map((c) => {
              const Icon = c.icon;
              const isActive = c.id === activeId;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => select(c.id)}
                    aria-current={isActive}
                    className={cn(
                      "group w-full rounded-2xl border p-4 text-left transition",
                      isActive
                        ? "border-blue-400 bg-blue-50/80 shadow-[0_16px_40px_-24px_rgba(37,99,235,0.7)]"
                        : "border-slate-200 bg-white/70 hover:border-blue-300 hover:bg-blue-50/50",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition",
                          isActive
                            ? "border-blue-400 bg-white text-blue-600"
                            : "border-slate-200 bg-white text-slate-500 group-hover:text-blue-600",
                        )}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                            {c.label}
                          </p>
                          {seen[c.id] && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-label="Viewed" />
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900">{c.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">{c.blurb}</p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </Section>

      <Section className="pt-4">
        <SectionHeader
          eyebrow="Site map"
          title="Jump straight to a section"
          description="Every part of the site in one place — hover to preview, click to open."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((q, i) => {
            const Icon = q.icon;
            return (
              <motion.div
                key={q.to}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  to={q.to}
                  className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_24px_50px_-30px_rgba(37,99,235,0.6)]"
                >
                  <span className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-100 opacity-0 blur-2xl transition group-hover:opacity-100" />
                  <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="relative mt-4 text-base font-semibold text-slate-900">{q.label}</h3>
                  <p className="relative mt-1 text-sm text-slate-600">{q.note}</p>
                  <span className="relative mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                    Open
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Still not sure where to start?</h3>
            <p className="mt-1 text-sm text-slate-600">
              Ask the Learning Assistant — it can summarise any module or point you to the right page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("drm:open-assistant"))}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <MessageCircle className="h-4 w-4" />
            Open the assistant
          </button>
        </div>
      </Section>
    </>
  );
}
