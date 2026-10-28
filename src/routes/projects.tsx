import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projects, caseStudies, categories } from "@/lib/content";
import { cn } from "@/lib/utils";
import { pageOgImages, SITE_ORIGIN } from "@/lib/og-images";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import heroProjects from "@/assets/hero-projects.jpg";
import collabProjects from "@/assets/collab-projects.jpg";
import { useTheme } from '@/components/theme/ThemeProvider';
import { isFutureTheme } from '@/components/theme/experience';
import enterpriseImage from '@/assets/future-enterprise.jpg';


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
        { property: "og:type", content: "website" },
        { property: "og:image", content: pageOgImages.projects },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Projects — Dibya Ranjan Mishra" },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: pageOgImages.projects },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Projects — Dibya Ranjan Mishra",
          url,
          description: desc,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: projects.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.name,
            })),
          },
        }),
      }, breadcrumbScript([{ name: "Projects", path: "/projects" }])],
    };
  },
  component: Projects,
});

function Projects() {
  const [active, setActive] = useState<string>("All");
  const { theme } = useTheme();
  const modern = isFutureTheme(theme);
  const filtered = active === "All" ? projects : projects.filter((p) => p.area === active);

  return (
    <>
      {modern && <section className="projects-hero future-home-hero"><img src={enterpriseImage} alt="Connected cloud and intelligent enterprise architecture" width={1920} height={1024} fetchPriority="high" className="future-hero-image"/><div className="future-hero-copy"><p className="future-kicker">SELECTED WORK / ENTERPRISE TECHNOLOGY</p><h1>Engineering<br/>what’s next.</h1><p className="future-hero-description">Platforms, programs and transformations across AI, cloud, SaaS, data and engineering leadership.</p><a href="#project-directory" className="inline-flex items-center gap-2 font-semibold">Explore the portfolio<ArrowRight className="h-4 w-4"/></a></div><div className="future-hero-caption"><span>ARCHITECTURE WITH PURPOSE</span><span>MEASURABLE OUTCOMES</span></div></section>}
      <Section id="project-directory" className="pb-6 pt-16 lg:pt-24">
        {!modern && <>
        <SectionHeader
          as="h1"
          eyebrow="Projects"
          title="Selected technical & leadership work"
          description="A portfolio of platforms, programs, and transformations spanning AI, Cloud, SaaS, Data, BFSI, and Engineering Leadership."
        />

        <img
          src={heroProjects}
          alt="Isometric illustration of cloud infrastructure, AI models, microservices, and analytics dashboards representing a portfolio of AI, Cloud, SaaS, Data and DevSecOps projects"
          width={1600}
          height={900}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="mb-8 aspect-[16/9] w-full rounded-3xl border border-border/60 object-cover"
        />

        <figure className="mb-8 overflow-hidden rounded-lg border border-border bg-muted shadow-card-soft">
          <img
            src={collabProjects}
            alt="Human engineer and friendly robot building cloud, AI and SaaS components together"
            width={1600}
            height={700}
            loading="lazy"
            decoding="async"
            className="aspect-[16/7] w-full object-cover"
          />
          <figcaption className="flex items-center gap-2 border-t border-border bg-card px-5 py-3 text-sm text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            Engineering with AI — humans + robots, shipping enterprise-grade platforms.
          </figcaption>
        </figure>
        </>}
        {modern && <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-primary">THE PORTFOLIO</p><h2 className="mt-2 text-3xl font-semibold">Selected platforms &amp; programs</h2></div><span className="text-sm text-muted-foreground">{filtered.length} projects</span></div>}

        <div className="flex flex-wrap gap-2">
          {["All", ...categories].map((c) => (
            <Button variant="outline" size="sm"
              key={c}
              onClick={() => setActive(c)}
              aria-pressed={active === c}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active === c
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-accent",
              )}
            >
              {c}
            </Button>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="project-records grid gap-6 lg:grid-cols-2">
          {filtered.map((p) => {
            const cs = caseStudies.find((c) => c.area === p.area);
            return (
              <article key={p.slug} className="project-record card-flashy flex flex-col rounded-lg bg-card p-7 transition-all hover:-translate-y-0.5 hover:shadow-glow">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="secondary">{p.area}</Badge>
                  <div className="text-xs font-medium text-muted-foreground">Case study</div>
                </div>
                <h2 className="mt-3 text-xl font-bold">{p.name}</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <div className="text-xs font-semibold uppercase text-primary">Problem</div>
                    <p className="mt-1 text-muted-foreground">{p.problem}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase text-primary">Solution</div>
                    <p className="mt-1 text-muted-foreground">{p.solution}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase text-primary">Impact</div>
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
                    <span key={m} className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{m}</span>
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
              </article>
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
