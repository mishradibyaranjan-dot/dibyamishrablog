import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ClipboardCheck,
  Compass,
  Gauge,
  Layers,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadMagnet } from "@/components/marketing/LeadMagnet";
import { posts, caseStudies } from "@/lib/content";
import { pageOgImages, SITE_ORIGIN } from "@/lib/og-images";
import { breadcrumbScript } from "@/lib/breadcrumbs";

const CANONICAL = `${SITE_ORIGIN}/playbook`;
const DESC =
  "The Enterprise AI Adoption Playbook: a five-stage operating model for taking GenAI from pilot to production with governance, funding and measurable outcomes.";

export const Route = createFileRoute("/playbook")({
  head: () => ({
    meta: [
      { title: "Enterprise AI Adoption Playbook" },
      { name: "description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:title", content: "Enterprise AI Adoption Playbook" },
      { property: "og:description", content: DESC },
      { property: "og:url", content: CANONICAL },
      { property: "og:image", content: pageOgImages.research },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Enterprise AI Adoption Playbook" },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: pageOgImages.research },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Enterprise AI Adoption Playbook",
          description: DESC,
          author: { "@type": "Person", name: "Dibya Ranjan Mishra", url: `${SITE_ORIGIN}/about` },
          publisher: { "@type": "Person", name: "Dibya Ranjan Mishra" },
          mainEntityOfPage: { "@type": "WebPage", "@id": CANONICAL },
          url: CANONICAL,
        }),
      },
      breadcrumbScript([{ name: "Playbook", path: "/playbook" }]),
    ],
  }),
  component: PlaybookPage,
});

const STAGES = [
  {
    icon: Compass,
    stage: "Stage 1",
    title: "Value framing",
    body: "Start from a P&L line, not a model. Pick two or three workflows where cost, cycle time or revenue leakage is measurable, and write the target metric before any build starts.",
    outputs: ["Opportunity map", "Baseline metrics", "Funding thesis"],
  },
  {
    icon: Layers,
    stage: "Stage 2",
    title: "Platform foundations",
    body: "One shared landing zone: identity, gateway, evaluation harness, vector store, observability. Teams ship on rails instead of re-buying the same plumbing per pilot.",
    outputs: ["Reference architecture", "Model gateway", "Cost guardrails"],
  },
  {
    icon: ShieldCheck,
    stage: "Stage 3",
    title: "Governance by design",
    body: "Risk tiering, human-in-the-loop thresholds, data residency and audit trails defined up front. Governance that arrives after go-live becomes a launch blocker.",
    outputs: ["Risk tiering model", "Review gates", "Audit evidence pack"],
  },
  {
    icon: Rocket,
    stage: "Stage 4",
    title: "Delivery at pace",
    body: "Small product-aligned pods, weekly evaluation runs, and a hard rule: nothing goes to production without regression evals and rollback. Agentic patterns only where the workflow tolerates autonomy.",
    outputs: ["Eval suite", "Release checklist", "Pod operating rhythm"],
  },
  {
    icon: Gauge,
    stage: "Stage 5",
    title: "Scale and prove",
    body: "Instrument adoption, deflection, unit economics and quality drift. Reinvest savings into the next wave so the programme funds itself instead of competing for budget.",
    outputs: ["Outcome dashboard", "Unit-cost model", "Wave-2 roadmap"],
  },
] as const;

const CHECKLIST = [
  "Every use case has a named business owner and a baseline number.",
  "Model access is brokered through one gateway with per-team budgets.",
  "Prompts, tools and datasets are versioned like application code.",
  "Evaluation runs on every change — quality, safety, cost and latency.",
  "Sensitive data paths are documented, tiered and access-reviewed.",
  "Human review thresholds are explicit for each autonomy level.",
  "Adoption and deflection are reported monthly to the steering group.",
  "A decommissioning path exists for pilots that do not clear the bar.",
] as const;

function PlaybookPage() {
  const relatedPosts = posts.slice(0, 3);
  const relatedCase = caseStudies.slice(0, 2);

  return (
    <div>
      <Section className="pb-6 pt-16 lg:pt-24">
        <Badge variant="secondary" className="mb-4">Playbook</Badge>
        <h1 className="max-w-4xl font-display text-[clamp(34px,5.5vw,60px)] font-bold leading-[1.02] tracking-[-0.03em] text-foreground">
          The Enterprise AI Adoption Playbook
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          A five-stage operating model for moving GenAI from isolated pilots to funded,
          governed production capability — drawn from enterprise programmes across retail,
          supply chain, and global capability centres.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href="#download">
              Get the playbook <ArrowRight className="ml-1.5 h-4 w-4" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/advisory">Work with me</Link>
          </Button>
        </div>
      </Section>

      <Section className="pt-4">
        <SectionHeader
          eyebrow="The model"
          title="Five stages, in order"
          description="Most stalled AI programmes skipped a stage. The sequence matters more than the tooling."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {STAGES.map(({ icon: Icon, ...s }) => (
            <article
              key={s.title}
              className="card-flashy flex flex-col rounded-2xl glass-strong p-6 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {s.stage}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {s.outputs.map((o) => (
                  <li
                    key={o}
                    className="rounded-full border border-chip-border bg-chip px-2.5 py-1 text-[11px] font-medium text-chip-foreground"
                  >
                    {o}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section className="pt-4">
        <div className="card-flashy rounded-3xl glass-strong p-7 sm:p-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Readiness checklist
            </h2>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            If more than two of these are unclear, the next pilot will not scale.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gradient" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="download" className="pt-4">
        <LeadMagnet
          source="playbook-enterprise-ai"
          title="Download the full playbook"
          description="The complete stage-by-stage guide with the readiness checklist, governance gates, and the outcome metrics I use with enterprise steering groups."
          includes={[
            "Five-stage adoption model with expected outputs per stage",
            "Governance and risk-tiering gates you can adopt as-is",
            "Outcome metric set for steering-group reporting",
          ]}
          downloadHref="/api/download/pdf?doc=enterprise-brief"
        />
      </Section>

      <Section className="pt-4">
        <SectionHeader
          eyebrow="Go deeper"
          title="Related reading and proof"
          description="The thinking behind the playbook, and where it has been applied."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {relatedPosts.map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="card-flashy rounded-2xl glass-strong p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <Badge variant="secondary" className="mb-2">{p.category}</Badge>
              <div className="font-semibold text-foreground">{p.title}</div>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.summary}</p>
            </Link>
          ))}
          {relatedCase.map((cs) => (
            <Link
              key={cs.slug}
              to="/case-study/$slug"
              params={{ slug: cs.slug }}
              className="card-flashy rounded-2xl glass-strong p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <Badge variant="secondary" className="mb-2">Case study</Badge>
              <div className="font-semibold text-foreground">{cs.title}</div>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{cs.summary}</p>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
