import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Bot, Building2, Layers, Users } from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Reveal } from "@/components/cinematic/Reveal";
import { breadcrumbScript } from "@/lib/breadcrumbs";

const TITLE = "Advisory — Enterprise AI, Cloud, GCC & Engineering | Dibya Ranjan Mishra";
const DESCRIPTION =
  "Advisory engagements for enterprise AI strategy, architecture and platform reviews, GCC and engineering transformation, and executive technology guidance.";

export const Route = createFileRoute("/advisory")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "https://www.dibyamishra.co.in/advisory" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.dibyamishra.co.in/advisory" }],
    scripts: [breadcrumbScript([{ name: "Advisory", path: "/advisory" }])],
  }),
  component: Advisory,
});

const ENGAGEMENTS = [
  {
    icon: Bot,
    title: "Enterprise AI Strategy",
    audience: ["CIOs", "CTOs", "Heads of AI"],
    services: [
      "AI opportunity assessment",
      "Agentic AI roadmap",
      "Enterprise RAG architecture",
      "AI governance",
      "AI platform strategy",
      "Production readiness",
    ],
    cta: "Discuss AI Strategy",
  },
  {
    icon: Layers,
    title: "Architecture & Platform Review",
    audience: ["CTOs", "Architecture leaders", "Engineering leaders"],
    services: [
      "Cloud architecture assessment",
      "Platform modernization strategy",
      "Multi-tenant SaaS architecture",
      "Scalability assessment",
      "Security architecture review",
      "Technical debt review",
    ],
    cta: "Request Architecture Discussion",
  },
  {
    icon: Building2,
    title: "GCC & Engineering Transformation",
    audience: ["CEOs", "CIOs", "GCC leaders"],
    services: [
      "GCC technology strategy",
      "Engineering organization design",
      "Operating model",
      "Delivery governance",
      "Capability development",
      "AI-enabled engineering",
    ],
    cta: "Discuss GCC Strategy",
  },
  {
    icon: Users,
    title: "Executive Technology Advisory",
    audience: ["Founders", "Executives", "Technology leadership teams"],
    services: [
      "Technology strategy",
      "Architecture decisions",
      "AI strategy",
      "Engineering organization",
      "Transformation planning",
      "Technology roadmap",
    ],
    cta: "Start a Conversation",
  },
] as const;

function Advisory() {
  return (
    <>
      <Section className="pt-16 lg:pt-24">
        <SectionHeader
          as="h1"
          eyebrow="Advisory"
          title="Ways to work with me"
          description="Focused engagements that move AI, cloud, platform and engineering decisions forward — from executive strategy through architecture and delivery governance."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {ENGAGEMENTS.map((e, i) => (
            <Reveal key={e.title} delay={i * 0.05}>
              <article className="card-flashy flex h-full flex-col gap-4 rounded-3xl border border-border bg-card p-7">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
                  <e.icon className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-semibold text-foreground">{e.title}</h2>
                <div className="flex flex-wrap gap-2">
                  {e.audience.map((a) => (
                    <span
                      key={a}
                      className="rounded-full border border-chip-border bg-chip px-2.5 py-0.5 text-[11px] font-semibold text-chip-foreground"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                <ul className="grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                  {e.services.map((s) => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-1" />
                      {s}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  {e.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card-flashy flex flex-col items-start gap-5 rounded-3xl glass-strong p-8 sm:p-12">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Complex technology. Clear direction. Measurable outcomes.
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Every engagement starts with a focused conversation about the outcome you need — then
            the strategy, architecture and delivery model to reach it.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Start a Conversation
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/case-studies"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              Explore Case Studies
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
