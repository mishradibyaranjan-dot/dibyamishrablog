import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ContentCopyright } from "@/components/legal/ContentCopyright";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { caseStudies, posts, type Post } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/og-images";
import { breadcrumbScript } from "@/lib/breadcrumbs";

export const Route = createFileRoute("/case-study/$slug")({
  loader: ({ params }) => {
    const study = caseStudies.find((c) => c.slug === params.slug);
    if (!study) throw notFound();
    return { study };
  },
  head: ({ params, loaderData }) => {
    const url = `${SITE_ORIGIN}/case-study/${params.slug}`;
    if (!loaderData) {
      return { meta: [{ title: "Case study unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const { study } = loaderData;
    const title = `${study.title} — Case Study | Dibya Ranjan Mishra`;
    return {
      meta: [
        { title },
        { name: "description", content: study.executiveSummary.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: study.executiveSummary.slice(0, 158) },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        breadcrumbScript([
          { name: "Case Studies", path: "/case-studies" },
          { name: study.title, path: `/case-study/${study.slug}` },
        ]),
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: study.title,
            description: study.executiveSummary,
            url,
            author: { "@type": "Person", name: "Dibya Ranjan Mishra" },
          }),
        },
      ],
    };
  },
  notFoundComponent: CaseStudyMissing,
  component: CaseStudyDetail,
});

function CaseStudyMissing() {
  return (
    <Section className="pt-16 lg:pt-24">
      <h1 className="font-display text-3xl font-bold text-foreground">Case study not found</h1>
      <p className="mt-3 text-muted-foreground">
        This case study may have moved. Browse all published case studies instead.
      </p>
      <Link
        to="/case-studies"
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-white"
      >
        All case studies
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Section>
  );
}

function CaseStudyDetail() {
  const { slug } = Route.useParams();
  const study = caseStudies.find((c) => c.slug === slug);
  if (!study) return <CaseStudyMissing />;
  const related = study.relatedPosts
    .map((s) => posts.find((p) => p.slug === s))
    .filter((p): p is Post => Boolean(p));

  return (
    <>
      <Section className="pb-6 pt-16 lg:pt-24">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground">
          <Link to="/case-studies" className="font-medium text-brand-1">
            Case Studies
          </Link>
          <span className="px-2">/</span>
          <span>{study.title}</span>
        </nav>
        <div className="flex flex-wrap gap-2">
          <Chip>{study.industry}</Chip>
          <Chip>{study.area}</Chip>
        </div>
        <h1 className="mt-4 max-w-4xl font-display text-[clamp(30px,5vw,52px)] font-bold leading-tight tracking-tight text-foreground">
          {study.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {study.executiveSummary}
        </p>
        <ul className="mt-7 grid gap-3 sm:grid-cols-3">
          {study.outcomeMetrics.slice(0, 3).map((m) => (
            <li
              key={m}
              className="rounded-2xl border border-border bg-card p-5 font-display text-base font-semibold text-foreground"
            >
              {m}
            </li>
          ))}
        </ul>
      </Section>

      <Section className="space-y-8 pt-0">
        <Block title="Business problem" body={study.challenge} />
        <Block title="Business context" body={study.businessContext} />
        <ListBlock title="Constraints" items={study.constraints} />
        <Block title="Strategy" body={study.strategy} />
        <Block title="Architecture" body={study.architecture} />
        <Block title="Implementation" body={study.execution} />

        <div>
          <Label>Technology</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {study.stack.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
          <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {study.components.map((c) => (
              <li key={c} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-1" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        <Block title="Governance" body={study.governance} />

        <div className="rounded-2xl border border-border bg-card p-6">
          <Label>Outcomes</Label>
          <p className="mt-2 text-sm text-foreground">{study.outcome}</p>
        </div>

        <ListBlock title="Lessons learned" items={study.lessons} />

        {related.length > 0 && (
          <div>
            <Label>Related research</Label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
                >
                  <span className="font-display text-base font-semibold text-foreground">{p.title}</span>
                  <span className="text-sm text-muted-foreground">{p.summary}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-brand-1">
                    Read · {p.readingTime}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-6">
          <Label>Relevant advisory service</Label>
          <p className="mt-2 text-sm text-foreground">{study.advisoryArea}</p>
          <Link
            to="/advisory"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-1"
          >
            See how this engagement works
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="card-flashy flex flex-col items-start gap-5 rounded-3xl glass-strong p-8 sm:p-12">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Discuss a Similar Transformation
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground">
            Start with the outcome you need — strategy, architecture and delivery follow from there.
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
              More case studies
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>
      <Section className="pt-0"><ContentCopyright /></Section>
    </>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-chip-border bg-chip px-2.5 py-1 text-xs font-semibold text-chip-foreground">
      {children}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-1">{children}</div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <Label>{title}</Label>
      <p className="mt-2 max-w-3xl text-base leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <Label>{title}</Label>
      <ul className="mt-2 grid gap-2 sm:grid-cols-3">
        {items.map((i) => (
          <li key={i} className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
