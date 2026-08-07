import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { caseStudies, categories } from "@/lib/content";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { pageOgImages, SITE_ORIGIN } from "@/lib/og-images";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import heroCaseStudies from "@/assets/hero-casestudies.jpg";
import collabCaseStudies from "@/assets/collab-casestudies.jpg";


export const Route = createFileRoute("/case-studies")({
  head: () => {
    const url = `${SITE_ORIGIN}/case-studies`;
    const desc = "Enterprise AI, cloud modernization, and SaaS case studies.";
    return {
      meta: [
        { title: "Case Studies — Dibya Ranjan Mishra" },
        { name: "description", content: "Detailed case studies on enterprise AI, cloud modernization, SaaS architecture, and program execution." },
        { property: "og:title", content: "Case Studies — Dibya Ranjan Mishra" },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:image", content: pageOgImages.caseStudies },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Case Studies — Dibya Ranjan Mishra" },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: pageOgImages.caseStudies },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Case Studies — Dibya Ranjan Mishra",
            description: desc,
            url,
            isPartOf: { "@type": "WebSite", name: "Dibya Ranjan Mishra", url: SITE_ORIGIN },
          }),
        },
        breadcrumbScript([{ name: "Case Studies", path: "/case-studies" }]),
      ],
    };
  },
  component: CaseStudies,
});

function CaseStudies() {
  const [active, setActive] = useState<string>("All");
  const filtered = active === "All" ? caseStudies : caseStudies.filter((c) => c.area === active);

  return (
    <div className="bg-background text-foreground">
      <Section className="pb-6 pt-16 lg:pt-24">
        <SectionHeader
          as="h1"
          eyebrow="Case Studies"
          title="From Strategy to Measurable Outcomes"
          description="Enterprise programs with the business challenge, the transformation, the architecture behind it, and the outcomes it produced."
        />

        <img
          src={heroCaseStudies}
          alt="Editorial illustration of an upward-trending performance curve and stacked architecture blocks representing enterprise case study outcomes"
          width={1600}
          height={900}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="mb-8 aspect-[16/9] w-full rounded-3xl border border-border object-cover"
        />

        <figure className="mb-8 overflow-hidden rounded-3xl border border-border bg-card">
          <img
            src={collabCaseStudies}
            alt="Business leader and friendly robot reviewing rising enterprise KPI charts together"
            width={1600}
            height={700}
            loading="lazy"
            decoding="async"
            className="aspect-[16/7] w-full object-cover"
          />
          <figcaption className="flex items-center gap-2 border-t border-border bg-card px-5 py-3 text-sm text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-gradient" />
            Outcomes shaped by humans and AI, working side by side.
          </figcaption>
        </figure>

        <div className="flex flex-wrap gap-2">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={cn(
                "min-h-11 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active === c
                  ? "border-transparent bg-brand-gradient text-white"
                  : "border-border bg-card text-foreground hover:bg-accent",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </Section>

      <Section className="space-y-6 pt-0">
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((c) => (
            <article
              key={c.slug}
              className="card-flashy flex h-full flex-col gap-4 rounded-3xl border border-border bg-card p-7 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-chip-border bg-chip text-chip-foreground hover:bg-chip">
                  {c.industry}
                </Badge>
                <Badge className="border border-chip-border bg-chip text-chip-foreground hover:bg-chip">
                  {c.area}
                </Badge>
              </div>

              <h2 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {c.title}
              </h2>

              <div>
                <Label>Business challenge</Label>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.challenge}</p>
              </div>

              <div>
                <Label>Transformation</Label>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.strategy}</p>
              </div>

              <div>
                <Label>Technology / architecture</Label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.stack.slice(0, 6).map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-chip-border bg-chip px-2.5 py-1 text-xs text-chip-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>Business outcomes</Label>
                <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                  {c.outcomeMetrics.slice(0, 3).map((m) => (
                    <li key={m} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-1" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/case-study/$slug"
                params={{ slug: c.slug }}
                className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                View Case Study
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>

        <div className="text-center">
          <Button asChild className="bg-brand-gradient text-white">
            <Link to="/contact">Discuss a Similar Transformation</Link>
          </Button>
        </div>
      </Section>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-1">{children}</div>
  );
}


