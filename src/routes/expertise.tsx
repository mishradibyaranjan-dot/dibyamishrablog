import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Cloud,
  FileText,
  Layers,
  LineChart,
  Sparkles,
  Users,
} from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Reveal } from "@/components/cinematic/Reveal";
import { techTags } from "@/lib/content";
import { breadcrumbScript } from "@/lib/breadcrumbs";

const TITLE = "Expertise — AI, Cloud, SaaS & Engineering Leadership | Dibya Ranjan Mishra";
const DESCRIPTION =
  "Agentic AI and GenAI in production, cloud-native modernization, multi-tenant SaaS architecture, data platforms, and global engineering leadership — how I work and what it delivers.";

export const Route = createFileRoute("/expertise")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "https://www.dibyamishra.co.in/expertise" },
    ],
    links: [{ rel: "canonical", href: "https://www.dibyamishra.co.in/expertise" }],
    scripts: [breadcrumbScript([{ name: "Expertise", path: "/expertise" }])],
  }),
  component: Expertise,
});

const PILLARS = [
  {
    icon: Bot,
    title: "Agentic AI & GenAI in production",
    summary:
      "Moving agents and RAG systems out of the demo stage and into audited, observable production workloads.",
    work: [
      "Planner–executor agent architecture with a bounded, typed tool surface",
      "Hybrid retrieval RAG: semantic chunking, reranking, per-tenant guardrails",
      "Model Context Protocol servers as a single integration surface for tools",
      "Evaluation harnesses scoring task success and tool-call correctness before rollout",
    ],
    tags: techTags.ai,
    proofTo: "/research" as const,
    proofLabel: "Read the research",
  },
  {
    icon: Cloud,
    title: "Cloud-native modernization & DevSecOps",
    summary:
      "Decomposing legacy estates onto cloud-native platforms without stalling the product roadmap.",
    work: [
      "Strangler-fig decomposition into bounded contexts with versioned contracts",
      "Cell-based, region-aware deployment for residency and blast-radius control",
      "Infrastructure as code, progressive delivery and automated rollback",
      "Security and cost guardrails wired into the pipeline, not bolted on later",
    ],
    tags: techTags.cloud,
    proofTo: "/case-studies" as const,
    proofLabel: "See the case studies",
  },
  {
    icon: Layers,
    title: "Multi-tenant SaaS architecture",
    summary:
      "Product platforms that hold up under enterprise SLAs, tenant isolation and global scale.",
    work: [
      "Tenant isolation models and data-plane design for regulated customers",
      "Internal developer platform so product teams ship without platform tickets",
      "Integration architecture across finance, operations and partner systems",
      "FinOps guardrails so unit economics improve as volume grows",
    ],
    tags: techTags.stack,
    proofTo: "/projects" as const,
    proofLabel: "Browse the platforms",
  },
  {
    icon: LineChart,
    title: "Data platforms & analytics at scale",
    summary:
      "Decision-grade data: pipelines leaders trust and metrics teams actually act on.",
    work: [
      "Streaming and batch pipelines with contract testing and lineage",
      "Warehouse modeling and semantic layers shared across products",
      "Executive reporting that ties engineering signals to business outcomes",
      "Data quality and governance embedded in delivery, not a separate program",
    ],
    tags: techTags.data,
    proofTo: "/research" as const,
    proofLabel: "Read the research",
  },
  {
    icon: Users,
    title: "Engineering leadership & delivery",
    summary:
      "Global organizations that deliver predictably — and keep delivering after the program ends.",
    work: [
      "Org design across time zones with clear ownership and on-call maturity",
      "SAFe and Lean operating models tuned to the portfolio, not the textbook",
      "Delivery instrumentation: throughput, predictability, incident and rollback rates",
      "Hiring, mentoring and succession so capability outlives any single leader",
    ],
    tags: techTags.delivery,
    proofTo: "/about" as const,
    proofLabel: "See the track record",
  },
] as const;

const ENGAGEMENTS = [
  {
    title: "Architecture & AI readiness review",
    body: "A focused assessment of your platform, data and AI ambitions, ending in a prioritized, costed roadmap.",
  },
  {
    title: "Advisory retainer",
    body: "Ongoing counsel for CTOs and delivery leaders — design reviews, hiring calibration and escalation support.",
  },
  {
    title: "Program leadership",
    body: "Hands-on leadership of a modernization, GenAI or platform program from mandate through to measured outcome.",
  },
] as const;

function Expertise() {
  return (
    <>
      <Section className="pb-4 pt-16 lg:pt-24">
        <SectionHeader
          as="h1"
          eyebrow="Expertise"
          title="Where I take accountability"
          description="Five connected disciplines. Every engagement ends with a measurable outcome, an architecture your team can own, and documentation that outlives the program."
        />
        <div className="flex flex-wrap gap-3">
          <Link
            to="/contact"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Discuss an engagement
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/case-studies"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            See delivered outcomes
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <Section className="pt-6">
        <div className="flex flex-col gap-5">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05}>
              <article className="card-flashy rounded-3xl border border-border bg-card p-6 sm:p-8">
                <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
                  <div className="min-w-0">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
                      <p.icon className="h-5 w-5" />
                    </span>
                    <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground">
                      {p.title}
                    </h2>
                    <p className="mt-3 text-base text-muted-foreground">{p.summary}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {p.tags.map((t) => (
                        <li
                          key={t}
                          className="rounded-full border border-chip-border bg-chip px-2.5 py-0.5 text-[11px] font-semibold text-chip-foreground"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={p.proofTo}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-1"
                    >
                      {p.proofLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-5 sm:p-6">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      How the work is done
                    </h3>
                    <ul className="mt-4 space-y-3">
                      {p.work.map((w) => (
                        <li key={w} className="flex gap-3 text-sm leading-relaxed text-foreground">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gradient" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="pt-6">
        <SectionHeader
          eyebrow="Engagement models"
          title="How we can work together"
          description="Scoped to the decision you need to make, not to a fixed number of hours."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {ENGAGEMENTS.map((e, i) => (
            <Reveal key={e.title} delay={i * 0.05}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6">
                <Sparkles className="h-5 w-5 text-brand-1" />
                <h3 className="font-display text-lg font-semibold text-foreground">{e.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{e.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="pt-6">
        <div className="card-flashy flex flex-col items-start gap-5 rounded-3xl glass-strong p-8 sm:p-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-chip-border bg-chip px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-chip-foreground">
            <FileText className="h-3.5 w-3.5" />
            Executive playbooks
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Take the reference material with you
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            White papers and technical briefs on agentic automation, RAG, vector
            search, cloud-native SaaS and delivery operating models — the same
            material I use in executive reviews.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/repository"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Open the repository
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/white-paper/agentic-ai-enterprise-automation"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              Read the agentic AI white paper
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
