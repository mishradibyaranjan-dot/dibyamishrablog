import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  BookOpen,
  Building2,
  Cloud,
  Cpu,
  FlaskConical,
  Gauge,
  Layers,
  LineChart,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { caseStudies, posts, projects } from "@/lib/content";
import { Reveal } from "@/components/cinematic/Reveal";
import { MetricStat } from "@/components/marketing/MetricStat";
import { NewsletterCta } from "@/components/marketing/NewsletterCta";
import cardNewsletter from "@/assets/card-newsletter.jpg";
import cardLearn from "@/assets/card-learn.jpg";
import cardCaseStudy from "@/assets/card-case-study.jpg";
import cardResearch from "@/assets/collab-research.jpg";
import cardProjects from "@/assets/collab-projects.jpg";

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
      { property: "og:url", content: "https://www.dibyamishra.co.in/" },
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
    links: [{ rel: "canonical", href: "https://www.dibyamishra.co.in/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Dibya Ranjan Mishra",
          jobTitle: "Vice President & Country Head",
          worksFor: { "@type": "Organization", name: "Crystal Tech Ventures" },
          url: "https://www.dibyamishra.co.in/",
          knowsAbout: [
            "Agentic AI",
            "Generative AI",
            "Retrieval Augmented Generation",
            "Cloud Architecture",
            "Multi-tenant SaaS",
            "Engineering Leadership",
          ],
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
    <div className="w-full bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-14 sm:px-6 sm:py-20 lg:gap-24 lg:py-24">
        <Hero />
        <MetricsBar />
        <Capabilities />
        <Outcomes />
        <FeaturedCaseStudies />
        <QuickCards />
        <FeaturedProjects />
        <LatestResearch />
        <NewsletterSection latest={latest} />
        <FinalCta />
      </div>
    </div>
  );
}

/* ------------------------------- HERO ------------------------------- */

function Hero() {
  return (
    <section className="flex max-w-5xl flex-col gap-6">
      <div className="inline-flex w-fit items-center gap-3 rounded-full border border-chip-border bg-chip px-3 py-1">
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand-gradient" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-chip-foreground">
          VP &amp; Country Head · Crystal Tech Ventures
        </span>
      </div>

      <h1 className="font-display text-[clamp(40px,7.5vw,80px)] font-bold leading-[0.95] tracking-[-0.035em] text-foreground">
        AI, Cloud &amp; Engineering Leadership that ships{" "}
        <span className="text-brand-1">measurable outcomes</span>.
      </h1>

      <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
        I help enterprises move Agentic AI and GenAI from pilot to production,
        modernize onto cloud-native multi-tenant platforms, and build engineering
        organizations that deliver predictably at global scale.
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Link
          to="/contact"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          Start a conversation
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/case-studies"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          See the outcomes
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
        {[
          { icon: Bot, label: "Agentic AI · RAG · MCP" },
          { icon: Cloud, label: "Cloud-native & DevSecOps" },
          { icon: Users, label: "500+ engineers led" },
        ].map((t) => (
          <span key={t.label} className="inline-flex items-center gap-2 font-medium">
            <t.icon className="h-4 w-4 text-brand-1" />
            {t.label}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- METRICS ------------------------------ */

function MetricsBar() {
  return (
    <section aria-labelledby="metrics-heading" className="rounded-3xl border border-border bg-card p-4 sm:p-6">
      <h2 id="metrics-heading" className="sr-only">
        Leadership track record in numbers
      </h2>
      <div className="grid grid-cols-2 divide-border sm:grid-cols-3 lg:grid-cols-6">
        <MetricStat to={20} suffix="+" label="Years experience" />
        <MetricStat to={500} suffix="+" label="Engineers led" />
        <MetricStat to={5} label="Time zones" />
        <MetricStat to={28} prefix="$" suffix="M+" label="Budgets owned" />
        <MetricStat value="$1M → $20M" label="Portfolio growth" />
        <MetricStat to={72} suffix="%" label="Faster delivery cycles" />
      </div>
    </section>
  );
}

/* --------------------------- CAPABILITIES --------------------------- */

const CAPABILITIES = [
  {
    icon: Bot,
    title: "Agentic AI & GenAI in production",
    body: "Planner-executor agents, hybrid RAG, evaluation harnesses, and guardrails that pass audit — not demos.",
    to: "/research" as const,
  },
  {
    icon: Cloud,
    title: "Cloud-native modernization",
    body: "Strangler-fig decomposition, cell-based deployment, IaC and DevSecOps pipelines across AWS, Azure and GCP.",
    to: "/case-studies" as const,
  },
  {
    icon: Layers,
    title: "Multi-tenant SaaS architecture",
    body: "Tenant isolation, region-aware data planes, progressive delivery, and FinOps guardrails built in from day one.",
    to: "/projects" as const,
  },
  {
    icon: LineChart,
    title: "Data platforms & BI at scale",
    body: "Streaming and batch pipelines, warehouse modeling, and decision-grade analytics leaders actually use.",
    to: "/research" as const,
  },
  {
    icon: Users,
    title: "Engineering leadership & delivery",
    body: "Global org design, SAFe and Lean operating models, and predictable delivery with measurable throughput gains.",
    to: "/about" as const,
  },
] as const;

function Capabilities() {
  return (
    <section aria-labelledby="capabilities-heading" className="flex flex-col gap-8">
      <div className="max-w-3xl">
        <SectionEyebrow icon={Sparkles}>Capabilities</SectionEyebrow>
        <h2
          id="capabilities-heading"
          className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          What I help organizations achieve
        </h2>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          Five areas where I take accountability end to end — from architecture
          decisions through to the delivery org that sustains them.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAPABILITIES.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.05}>
            <Link
              to={c.to}
              className="card-flashy group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-lg font-semibold text-foreground">{c.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-brand-1">
                Explore
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- OUTCOMES ----------------------------- */

const OUTCOMES = [
  { icon: Gauge, stat: "72%", label: "faster delivery cycles", detail: "Agentic automation of 40+ back-office workflows under audit constraints." },
  { icon: ShieldCheck, stat: "76%", label: "fewer recurring incidents", detail: "Platform hardening and progressive delivery on a cloud-native vessel platform." },
  { icon: Cpu, stat: "96%", label: "less time to answer", detail: "Hybrid-retrieval RAG assistant unifying 14 knowledge systems for 9,000+ users." },
  { icon: Building2, stat: "38%", label: "lower infra cost", detail: "Region-aware SaaS modernization with FinOps guardrails and 99.99% availability." },
] as const;

function Outcomes() {
  return (
    <section aria-labelledby="outcomes-heading" className="flex flex-col gap-8">
      <div className="max-w-3xl">
        <SectionEyebrow icon={LineChart}>Business outcomes</SectionEyebrow>
        <h2
          id="outcomes-heading"
          className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          Results, not roadmaps
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {OUTCOMES.map((o, i) => (
          <Reveal key={o.label} delay={i * 0.05}>
            <div className="flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-6">
              <o.icon className="h-5 w-5 text-brand-1" />
              <div className="font-display text-4xl font-bold tracking-tight text-foreground">
                {o.stat}
              </div>
              <div className="text-sm font-semibold text-foreground">{o.label}</div>
              <p className="text-sm leading-relaxed text-muted-foreground">{o.detail}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------- FEATURED CASE STUDIES -------------------- */

function FeaturedCaseStudies() {
  const featured = caseStudies.slice(0, 3);
  return (
    <section aria-labelledby="case-studies-heading" className="flex flex-col gap-8">
      <SectionHead
        id="case-studies-heading"
        eyebrow="Case studies"
        icon={Briefcase()}
        title="Programs delivered end to end"
        description="Challenge, architecture, execution and outcome — written the way an executive review would read."
        linkTo="/case-studies"
        linkLabel="All case studies"
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {featured.map((cs, i) => (
          <Reveal key={cs.slug} delay={i * 0.05}>
            <Link
              to="/case-studies"
              className="card-flashy group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <span className="inline-flex w-fit items-center rounded-full border border-chip-border bg-chip px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-chip-foreground">
                {cs.area}
              </span>
              <h3 className="font-display text-lg font-semibold text-foreground">{cs.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{cs.challenge}</p>
              <p className="mt-auto pt-3 text-sm font-medium text-foreground">{cs.outcome}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-1">
                Read the breakdown
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- QUICK CARDS -------------------------- */

function QuickCards() {
  const items = [
    {
      to: "/learn",
      label: "Learn",
      body: "Guided modules on Agentic AI, RAG and vector search with narrated video lessons.",
      img: cardLearn,
      alt: "Illustration of a guided learning module with charts and lesson video",
    },
    {
      to: "/research",
      label: "Research",
      body: "Long-form notes on enterprise AI architecture, platforms and delivery.",
      img: cardResearch,
      alt: "Illustration of collaborative research work on enterprise AI architecture",
    },
    {
      to: "/projects",
      label: "Projects",
      body: "Platforms and products shipped, with the problem, stack and measured impact.",
      img: cardProjects,
      alt: "Illustration of engineers collaborating on delivered software projects",
    },
    {
      to: "/case-studies",
      label: "Case Studies",
      body: "Deep dives into transformation programs and the architecture behind them.",
      img: cardCaseStudy,
      alt: "Illustration of a warehouse worker and robot collaborating in a retail supply chain",
    },
    {
      to: "/newsletter",
      label: "Newsletter",
      body: "Monthly executive briefing on AI, cloud and engineering leadership.",
      img: cardNewsletter,
      alt: "Illustration of a monthly newsletter issue about AI and cloud leadership",
    },
  ] as const;

  return (
    <section aria-labelledby="explore-heading" className="flex flex-col gap-8">
      <SectionHead
        id="explore-heading"
        eyebrow="Explore"
        title="Where to go next"
        description="Everything on this site is organized around one question: does it help you ship?"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.to} delay={i * 0.05}>
            <Link
              to={it.to}
              className="card-flashy group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className="aspect-[16/9] overflow-hidden border-b border-border">
                <img
                  src={it.img}
                  alt={it.alt}
                  width={1280}
                  height={720}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-6">
                <h3 className="font-display text-lg font-semibold text-foreground">{it.label}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{it.body}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-brand-1">
                  Open
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* --------------------------- FEATURED PROJECTS ---------------------- */

function FeaturedProjects() {
  const featured = projects.slice(0, 3);
  return (
    <section aria-labelledby="projects-heading" className="flex flex-col gap-8">
      <SectionHead
        id="projects-heading"
        eyebrow="Projects"
        title="Platforms shipped at enterprise scale"
        linkTo="/projects"
        linkLabel="All projects"
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {featured.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.05}>
            <Link
              to="/projects"
              className="card-flashy group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <h3 className="font-display text-lg font-semibold text-foreground">{p.name}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.problem}</p>
              <ul className="mt-auto flex flex-wrap gap-2 pt-3">
                {p.metrics.map((m) => (
                  <li
                    key={m}
                    className="rounded-full border border-chip-border bg-chip px-2.5 py-0.5 text-[11px] font-semibold text-chip-foreground"
                  >
                    {m}
                  </li>
                ))}
              </ul>
              <span className="inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-brand-1">
                View project
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------- LATEST RESEARCH ---------------------- */

function LatestResearch() {
  const featured = posts.filter((p) => p.featured).slice(0, 3);
  return (
    <section aria-labelledby="research-heading" className="flex flex-col gap-8">
      <SectionHead
        id="research-heading"
        eyebrow="Research & writing"
        title="Ideas worth an executive's time"
        linkTo="/research"
        linkLabel="All research"
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {featured.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.05}>
            <Link
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="card-flashy group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <span className="inline-flex w-fit items-center rounded-full border border-chip-border bg-chip px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-chip-foreground">
                {p.category}
              </span>
              <h3 className="font-display text-lg font-semibold text-foreground">{p.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-brand-1">
                Read · {p.readingTime}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------- NEWSLETTER --------------------------- */

function NewsletterSection({ latest }: { latest: LatestIssue | null }) {
  return (
    <section aria-labelledby="newsletter-heading" className="flex flex-col gap-6">
      <h2 id="newsletter-heading" className="sr-only">
        Newsletter
      </h2>
      <NewsletterCta />
      {latest && (
        <Link
          to="/newsletter/$slug"
          params={{ slug: latest.slug }}
          className="group inline-flex items-center gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white">
            <Mail className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Latest issue
            </span>
            <span className="block truncate text-sm font-semibold text-foreground">
              {latest.hero_emoji ? `${latest.hero_emoji} ` : ""}
              {latest.title}
            </span>
          </span>
          <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-brand-1 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </section>
  );
}

/* ----------------------------- FINAL CTA --------------------------- */

function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="card-flashy flex flex-col items-start gap-5 rounded-3xl glass-strong p-8 sm:p-12"
    >
      <SectionEyebrow icon={Sparkles}>Let&apos;s work together</SectionEyebrow>
      <h2
        id="final-cta-heading"
        className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
      >
        Planning an AI, cloud or platform program?
      </h2>
      <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
        Advisory engagements, architecture reviews, delivery turnarounds, and
        engineering leadership conversations — start with a short note about the
        outcome you need.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/contact"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          Contact me
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/about"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          About my background
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------ SHARED ----------------------------- */

// Small indirection so the eyebrow icon type stays uniform.
function Briefcase() {
  return FlaskConical;
}

function SectionEyebrow({
  icon: Icon,
  children,
}: {
  icon: typeof Sparkles;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-chip-border bg-chip px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-chip-foreground">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

function SectionHead({
  id,
  eyebrow,
  title,
  description,
  linkTo,
  linkLabel,
  icon,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  linkTo?: "/case-studies" | "/projects" | "/research";
  linkLabel?: string;
  icon?: typeof Sparkles;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
      <div className="min-w-0 max-w-3xl">
        <SectionEyebrow icon={icon ?? BookOpen}>{eyebrow}</SectionEyebrow>
        <h2
          id={id}
          className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">{description}</p>
        )}
      </div>
      {linkTo && linkLabel && (
        <Link
          to={linkTo}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-1"
        >
          {linkLabel}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
