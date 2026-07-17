import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { caseStudies, categories } from "@/lib/content";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { pageOgImages, SITE_ORIGIN } from "@/lib/og-images";
import { RequireAuth } from "@/components/auth/RequireAuth";
import heroCaseStudies from "@/assets/hero-casestudies.jpg";


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
        { property: "og:image", content: pageOgImages.caseStudies },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Case Studies — Dibya Ranjan Mishra" },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: pageOgImages.caseStudies },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: () => (
    <RequireAuth>
      <CaseStudies />
    </RequireAuth>
  ),
});

function CaseStudies() {
  const [active, setActive] = useState<string>("All");
  const filtered = active === "All" ? caseStudies : caseStudies.filter((c) => c.area === active);

  return (
    <>
      <Section className="pb-6 pt-16 lg:pt-24">
        <SectionHeader
          as="h1"
          eyebrow="Case Studies"
          title="Programs that moved the needle"
          description="Selected case studies with the architecture choices, execution strategy, and business outcomes that defined them."
        />

        <img
          src={heroCaseStudies}
          alt="Editorial illustration of an upward-trending performance curve and stacked architecture blocks representing enterprise case study outcomes"
          width={1600}
          height={900}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="mb-8 aspect-[16/9] w-full rounded-3xl border border-border/60 object-cover"
        />


        <div className="flex flex-wrap gap-2">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active === c
                  ? "border-transparent bg-brand-gradient text-white"
                  : "border-border bg-card hover:bg-accent",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </Section>

      <Section className="space-y-10 pt-0">
        {filtered.map((c) => (
          <article key={c.slug} className="card-flashy overflow-hidden rounded-3xl glass-strong">
            <div className="bg-hero p-8 sm:p-10">
              <Badge className="bg-white/10 text-white hover:bg-white/15">{c.area}</Badge>
              <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">{c.title}</h2>

              <p className="mt-3 max-w-3xl text-white/70">{c.challenge}</p>
            </div>
            <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-2">
              <Block title="Architecture Approach" body={c.architecture} />
              <Block title="Execution Strategy" body={c.execution} />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gradient">Technology Stack</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.stack.map((s) => (
                    <span key={s} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gradient">AI / Cloud / Data Components</div>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {c.components.map((cmp) => (
                    <li key={cmp} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{cmp}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:col-span-2 rounded-2xl border border-border bg-accent/40 p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-gradient">Outcome & Business Impact</div>
                <p className="mt-2 text-sm">{c.outcome}</p>
              </div>
              <div className="lg:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-gradient">Lessons Learned</div>
                <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
                  {c.lessons.map((l) => (
                    <li key={l} className="rounded-xl border border-border bg-background p-3">{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}

        <div className="text-center">
          <Button asChild className="bg-brand-gradient text-white">
            <Link to="/contact">Discuss a similar program</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-gradient">{title}</div>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
