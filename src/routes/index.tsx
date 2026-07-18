import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Cpu,
  FileText,
  FlaskConical,
  Layers,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import cardNewsletter from "@/assets/card-newsletter.jpg";
import cardLearn from "@/assets/card-learn.jpg";
import cardRepository from "@/assets/card-repository.jpg";
import cardCaseStudy from "@/assets/card-case-study.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dibya Ranjan Mishra — AI, Cloud & Engineering Leadership" },
      {
        name: "description",
        content:
          "Vice President & Country Head at Crystal Tech Ventures. Shipping Agentic AI, multi-tenant SaaS and cloud-native retail supply chain systems.",
      },
      {
        property: "og:title",
        content:
          "Dibya Ranjan Mishra — Vice President & Country Head | AI, Cloud & SaaS Leader",
      },
      {
        property: "og:description",
        content:
          "20+ years. Shipping Agentic AI in retail supply chains, RAG systems and multi-tenant SaaS at enterprise scale.",
      },
      { property: "og:url", content: "https://dibyamishrablog.lovable.app/" },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/62feb90f-3c19-4765-9fa6-9b7f7701a7c6",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/62feb90f-3c19-4765-9fa6-9b7f7701a7c6",
      },
    ],
    links: [{ rel: "canonical", href: "https://dibyamishrablog.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Dibya Ranjan Mishra",
          jobTitle: "Vice President & Country Head",
          worksFor: { "@type": "Organization", name: "Crystal Tech Ventures" },
          url: "https://dibyamishrablog.lovable.app/",
          sameAs: [
            "https://www.linkedin.com/in/dibya-mishra-55b94654",
            "https://github.com/mishradibyaranjan-dot/",
          ],
        }),
      },
    ],
  }),
  component: Home,
});

// ---------- Design tokens (theme-aware, respects dark/light toggle) ----------
const INK = "var(--color-foreground)";
const MUTED = "var(--color-muted-foreground)";
const ACCENT = "var(--color-brand-1)";
const CANVAS = "var(--color-background)";
const SURFACE = "var(--color-card)";
const LINE = "var(--color-border)";

const HEADING: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };
const BODY: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };
const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

type LatestIssue = {
  slug: string;
  title: string;
  summary: string;
  hero_emoji: string | null;
  published_at: string | null;
};

function useLatestIssue() {
  const [issue, setIssue] = useState<LatestIssue | null>(null);
  useEffect(() => {
    let alive = true;
    supabase
      .from("newsletter_issues")
      .select("slug, title, summary, hero_emoji, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (alive) setIssue((data as LatestIssue | null) ?? null);
      });
    return () => {
      alive = false;
    };
  }, []);
  return issue;
}

function Home() {
  const latest = useLatestIssue();

  return (
    <div
      style={{ ...BODY, backgroundColor: CANVAS, color: INK }}
      className="w-full"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 py-16 sm:py-20 lg:py-24">
        <Hero />
        <QuickCards />
        <BentoGrid latest={latest} />
        <ProofStrip />
      </div>
    </div>
  );
}

// ---------- HERO ----------
function Hero() {
  return (
    <section className="flex max-w-5xl flex-col gap-6 animate-fade-in">
      <div
        className="text-sm font-semibold uppercase tracking-[0.2em]"
        style={{ ...MONO, color: MUTED }}
      >
        Dibya Ranjan Mishra
      </div>
      <div
        className="inline-flex w-fit items-center gap-3 rounded-full border px-3 py-1"
        style={{
          backgroundColor: "rgba(59,130,246,0.06)",
          borderColor: "rgba(59,130,246,0.15)",
        }}
      >
        <span
          className="h-2 w-2 animate-pulse rounded-full"
          style={{ backgroundColor: ACCENT }}
        />
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: ACCENT }}
        >
          VP &amp; Country Head · Crystal Tech Ventures
        </span>
      </div>

      <h1
        style={{
          ...HEADING,
          fontSize: "clamp(44px, 8vw, 88px)",
          lineHeight: 0.92,
          letterSpacing: "-0.04em",
          fontWeight: 700,
          color: INK,
        }}
      >
        Shipping <span style={{ color: ACCENT }}>Agentic AI</span> and
        <br className="hidden sm:block" /> Multi-Tenant Cloud Systems.
      </h1>

      <p
        className="max-w-3xl text-lg leading-relaxed sm:text-2xl"
        style={{ color: MUTED }}
      >
        Leading engineering teams to deploy RAG-driven GenAI in retail supply
        chains and architect the future of enterprise SaaS.
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Link
          to="/newsletter"
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-colors hover:brightness-110"
          style={{ backgroundColor: ACCENT, color: "var(--color-primary-foreground)" }}
        >
          Read the newsletter
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/learn"
          className="inline-flex items-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-white"
          style={{ borderColor: LINE, color: INK, backgroundColor: SURFACE }}
        >
          Explore Learn
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

// ---------- QUICK CARDS ----------
function QuickCards() {
  const items = [
    { to: "/learn", label: "Learn", desc: "GenAI, RAG & SaaS deep dives", Icon: BookOpen },
    { to: "/research", label: "Research", desc: "Notes on AI & cloud systems", Icon: FlaskConical },
    { to: "/projects", label: "Projects", desc: "Shipped products & platforms", Icon: Layers },
    { to: "/case-studies", label: "Case Studies", desc: "Enterprise transformations", Icon: Briefcase },
    { to: "/newsletter", label: "Newsletter", desc: "Monthly intelligence brief", Icon: Mail },
  ] as const;
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map(({ to, label, desc, Icon }) => (
        <Link
          key={to}
          to={to}
          className="group flex flex-col gap-2 rounded-2xl border p-4 transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: SURFACE, borderColor: LINE, color: INK }}
        >
          <div className="flex items-center justify-between">
            <Icon className="h-5 w-5" style={{ color: ACCENT }} />
            <ArrowUpRight
              className="h-4 w-4 opacity-40 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
              style={{ color: ACCENT }}
            />
          </div>
          <div className="mt-1 text-base font-bold" style={{ ...HEADING, color: INK }}>
            {label}
          </div>
          <div className="text-xs leading-relaxed" style={{ color: MUTED }}>
            {desc}
          </div>
        </Link>
      ))}
    </section>
  );
}



// ---------- BENTO ----------
function BentoGrid({ latest }: { latest: LatestIssue | null }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <NewsletterTile latest={latest} />
      <LearnTile />
      <RepositoryTile />
      <CaseStudyTile />
    </div>
  );
}

function TileEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[11px] font-semibold uppercase tracking-[0.18em]"
      style={{ color: ACCENT }}
    >
      {children}
    </div>
  );
}

function LightTile({
  children,
  className = "",
  span = "md:col-span-4",
}: {
  children: React.ReactNode;
  className?: string;
  span?: string;
}) {
  return (
    <div
      className={`${span} group flex flex-col rounded-[2rem] border p-5 transition-all duration-500 sm:p-6 md:p-8 ${className}`}
      style={{
        backgroundColor: SURFACE,
        borderColor: LINE,
        boxShadow: "0 1px 2px rgba(15,23,42,0.03), 0 8px 24px -16px rgba(15,23,42,0.08)",
      }}
    >
      {children}
    </div>
  );
}

function NewsletterTile({ latest }: { latest: LatestIssue | null }) {
  return (
    <LightTile
      span="md:col-span-8"
      className="justify-between gap-10 hover:-translate-y-0.5 overflow-hidden !p-0"
    >
      <div className="grid grid-cols-1 md:grid-cols-5">
        <div className="md:col-span-3 flex flex-col gap-6 p-6 sm:p-8 md:p-10">
          <div className="flex flex-col gap-4">
            <TileEyebrow>Monthly Newsletter</TileEyebrow>
            <h2
              style={{ ...HEADING, color: INK, letterSpacing: "-0.02em" }}
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            >
              {latest?.title ?? "Human-in-the-Loop"}
            </h2>
            <p className="max-w-xl text-base leading-relaxed sm:text-lg" style={{ color: MUTED }}>
              {latest?.summary ??
                "Deep dives into AI approval workflows and automated LinkedIn distribution — signed off by me before anything ships."}
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              to={latest ? "/newsletter/$slug" : "/newsletter"}
              params={latest ? { slug: latest.slug } : undefined}
              className="inline-flex flex-1 items-center justify-between rounded-xl border px-6 py-4 text-sm font-medium transition-colors"
              style={{ backgroundColor: CANVAS, borderColor: LINE, color: INK }}
            >
              <span className="truncate">
                {latest ? "Read the latest issue" : "Browse the archive"}
              </span>
              <ArrowUpRight className="ml-4 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/newsletter"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold transition-colors hover:brightness-110"
              style={{ backgroundColor: ACCENT, color: "var(--color-primary-foreground)" }}
            >
              <Mail className="h-4 w-4" />
              Subscribe
            </Link>
          </div>
        </div>
        <div className="md:col-span-2 relative min-h-[200px] border-t md:border-t-0 md:border-l" style={{ backgroundColor: CANVAS, borderColor: LINE }}>
          <img
            src={cardNewsletter}
            alt="A human hand and a robot hand collaborating on a newsletter document"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width={1280}
            height={960}
            className="h-full w-full object-cover"
          />

        </div>
      </div>
    </LightTile>
  );
}

function LearnTile() {
  const modules: { label: string; num: string }[] = [
    { label: "Agentic RAG", num: "01" },
    { label: "Multi-tenant SaaS", num: "02" },
    { label: "Cloud Architecture", num: "03" },
  ];
  return (
    <LightTile span="md:col-span-4" className="hover:-translate-y-0.5">
      <div className="mb-auto">
        <div
          className="mb-4 overflow-hidden rounded-2xl border"
          style={{ borderColor: LINE, backgroundColor: CANVAS }}
        >
          <img
            src={cardLearn}
            alt="A human learner and a robot studying together with books"
            loading="lazy"
            width={1280}
            height={960}
            className="h-32 w-full object-cover"
          />
        </div>
        <h3
          style={{ ...HEADING, color: INK, letterSpacing: "-0.02em" }}
          className="text-2xl font-bold"
        >
          Learn Module
        </h3>
        <p className="mt-3 text-base" style={{ color: MUTED }}>
          Deep dives into Cloud &amp; SaaS infrastructure for the modern era.
        </p>
      </div>
      <div className="mt-8 flex flex-col">
        {modules.map((m, i) => (
          <div
            key={m.label}
            className="flex items-center justify-between py-3"
            style={{
              borderBottom: i < modules.length - 1 ? `1px solid ${LINE}` : "none",
            }}
          >
            <span className="text-sm font-medium" style={{ color: INK }}>
              {m.label}
            </span>
            <span style={{ ...MONO, color: ACCENT, fontSize: 12 }}>{m.num}</span>
          </div>
        ))}
      </div>
      <Link
        to="/learn"
        className="mt-6 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
        style={{ color: INK }}
      >
        Open Learn
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </LightTile>
  );
}

function RepositoryTile() {
  return (
    <div
      className="group flex flex-col rounded-[2rem] border border-t-[3px] p-5 shadow-lg transition-transform duration-500 hover:-translate-y-1 sm:p-6 md:p-8 md:col-span-4"
      style={{
        backgroundColor: SURFACE,
        borderColor: LINE,
        borderTopColor: ACCENT,
        color: INK,
      }}
    >
      <div
        className="mb-4 overflow-hidden rounded-2xl border"
        style={{ borderColor: LINE, backgroundColor: CANVAS }}
      >
        <img
          src={cardRepository}
          alt="A human and a robot organizing a vault of PDF documents"
          loading="lazy"
          width={1280}
          height={960}
          className="h-32 w-full object-cover"
        />
      </div>
      <div
        className="text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: ACCENT }}
      >
        Resource Vault
      </div>
      <h3
        style={{ ...HEADING, color: INK, letterSpacing: "-0.02em" }}
        className="mt-4 text-2xl font-bold sm:text-3xl"
      >
        The Repository
      </h3>
      <p className="mt-3 text-sm sm:text-base" style={{ color: MUTED }}>
        Exclusive PDFs, architecture diagrams, and whitepapers on GenAI, RAG,
        cloud & multi-tenant SaaS.
      </p>

      <div
        className="mt-auto pt-6 text-xs sm:pt-8"
        style={{ color: MUTED }}
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded border px-2 py-0.5"
            style={{ backgroundColor: "rgba(59,130,246,0.08)", borderColor: "rgba(59,130,246,0.18)", color: ACCENT }}
          >
            <ShieldCheck className="h-3 w-3" /> Auth gated
          </span>
          <span>9 downloads available</span>
        </div>
        <Link
          to="/repository"
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all hover:brightness-110 sm:py-4"
          style={{ backgroundColor: ACCENT, color: "var(--color-primary-foreground)" }}
        >
          <FileText className="h-4 w-4" />
          Enter Vault
        </Link>
      </div>
    </div>
  );
}

function CaseStudyTile() {
  return (
    <LightTile span="md:col-span-8" className="!p-0 overflow-hidden">
      <div className="grid h-full grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col justify-center p-5 sm:p-8 md:p-12">
          <TileEyebrow>Featured Case Study</TileEyebrow>
          <h3
            style={{ ...HEADING, color: INK, letterSpacing: "-0.02em" }}
            className="mt-4 text-2xl font-bold sm:text-3xl"
          >
            Retail Supply Chain Transformation
          </h3>
          <p className="mt-3 max-w-md text-sm sm:text-base md:text-lg" style={{ color: MUTED }}>
            Implementing multi-tenant SaaS for real-time inventory optimization
            using GenAI and agentic workflows.
          </p>
          <Link
            to="/case-studies"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold transition-colors"
            style={{ color: INK }}
          >
            Read the technical doc
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div
          className="relative min-h-[200px] overflow-hidden border-t md:border-t-0 md:border-l"
          style={{ backgroundColor: CANVAS, borderColor: LINE }}
        >
          <img
            src={cardCaseStudy}
            alt="A human warehouse worker and a robot collaborating in a retail supply chain"
            loading="lazy"
            width={1280}
            height={960}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </LightTile>
  );
}

// ---------- PROOF / FOOTER STRIP ----------
function ProofStrip() {
  const stack = [
    { icon: Cpu, label: "Agentic AI · RAG · MCP" },
    { icon: Sparkles, label: "GenAI in Retail Supply Chain" },
    { icon: ShieldCheck, label: "Multi-tenant SaaS & Cloud" },
  ];
  return (
    <section
      className="mt-6 flex flex-col gap-8 border-t pt-12 md:flex-row md:items-center md:justify-between"
      style={{ borderColor: LINE }}
    >
      <div
        className="text-2xl font-bold"
        style={{ ...HEADING, color: INK, letterSpacing: "-0.02em" }}
      >
        Dibya R. Mishra
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        {stack.map((s) => (
          <div
            key={s.label}
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: MUTED }}
          >
            <s.icon className="h-4 w-4" style={{ color: ACCENT }} />
            {s.label}
          </div>
        ))}
      </div>
      <Link
        to="/contact"
        className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold transition-all hover:bg-white hover:shadow-md"
        style={{ borderColor: LINE, color: INK, backgroundColor: CANVAS }}
      >
        <Mail className="h-4 w-4" />
        Contact
      </Link>
    </section>
  );
}


