import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projects, caseStudies, categories } from "@/lib/content";
import { cn } from "@/lib/utils";
import { pageOgImages, SITE_ORIGIN } from "@/lib/og-images";

export const Route = createFileRoute("/projects")({
  head: () => {
    const url = `${SITE_ORIGIN}/projects`;
    const desc = "AI platforms, cloud modernization, SaaS architecture, DevSecOps, and analytics work.";
    return {
      meta: [
        { title: "Projects — Dibya Ranjan Mishra" },
        { name: "description", content: "Portfolio of technical and leadership work — AI platforms, cloud modernization, SaaS architecture, DevSecOps, and analytics." },
        { property: "og:title", content: "Projects — Dibya Ranjan Mishra" },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:image", content: pageOgImages.projects },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Projects — Dibya Ranjan Mishra" },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: pageOgImages.projects },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: Projects,
});

function Projects() {
  const [active, setActive] = useState<string>("All");
  const filtered = active === "All" ? projects : projects.filter((p) => p.area === active);

  return (
    <>
      <Section className="pb-6 pt-16 lg:pt-24">
        <SectionHeader
          eyebrow="Projects"
          title="Selected technical & leadership work"
          description="A portfolio of platforms, programs, and transformations spanning AI, Cloud, SaaS, Data, BFSI, and Engineering Leadership."
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

      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          {filtered.map((p) => {
            const cs = caseStudies.find((c) => c.area === p.area);
            return (
              <div key={p.slug} className="card-flashy flex flex-col rounded-3xl glass-strong p-7 transition-all hover:-translate-y-0.5 hover:shadow-glow">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="secondary">{p.area}</Badge>
                  <div className="text-xs font-medium text-muted-foreground">Case study</div>
                </div>
                <h3 className="mt-3 text-xl font-bold">{p.name}</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gradient">Problem</div>
                    <p className="mt-1 text-muted-foreground">{p.problem}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gradient">Solution</div>
                    <p className="mt-1 text-muted-foreground">{p.solution}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gradient">Impact</div>
                    <p className="mt-1 text-muted-foreground">{p.impact}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span key={t} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs">{t}</span>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.metrics.map((m) => (
                    <span key={m} className="rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white">{m}</span>
                  ))}
                </div>
                <div className="mt-6">
                  <Button asChild variant="outline">
                    <Link to="/case-studies">
                      Read related case study <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                {cs && (
                  <div className="sr-only">Related: {cs.title}</div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-muted-foreground">No projects in this category yet.</p>
          )}
        </div>
      </Section>
    </>
  );
}
