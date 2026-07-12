import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { posts, categories } from "@/lib/content";
import { cn } from "@/lib/utils";
import { pageOgImages, SITE_ORIGIN } from "@/lib/og-images";
import { RequireAuth } from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/research")({
  head: () => {
    const url = `${SITE_ORIGIN}/research`;
    const desc =
      "Research, blog essays, and white papers on Generative AI, Agentic AI, Cloud Architecture, SaaS, Data, and Engineering Leadership.";
    return {
      meta: [
        { title: "Research & Blog — Dibya Ranjan Mishra" },
        { name: "description", content: desc },
        { property: "og:title", content: "Research & Blog — Dibya Ranjan Mishra" },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:image", content: pageOgImages.research },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Research & Blog — Dibya Ranjan Mishra" },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: pageOgImages.research },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Research & Blog — Dibya Ranjan Mishra",
          url,
          description: desc,
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            datePublished: p.date,
            url: `${SITE_ORIGIN}/blog/${p.slug}`,
          })),
        }),
      }],
    };
  },
  component: () => (
    <RequireAuth>
      <Research />
    </RequireAuth>
  ),
});

function Research() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string>("All");

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesQ =
        q.trim() === "" ||
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.summary.toLowerCase().includes(q.toLowerCase());
      const matchesCat = active === "All" || p.category === active;
      return matchesQ && matchesCat;
    });
  }, [q, active]);

  const featured = posts.find((p) => p.featured);

  return (
    <>
      <Section className="pb-6 pt-16 lg:pt-24">
        <SectionHeader
          as="h1"
          eyebrow="Research & Blog"
          title="Notes, deep dives, essays & white papers"
          description="A unified library of research, blog writing, and long-form white papers across AI, Cloud, SaaS, and Engineering Leadership — written from the field."
        />


        <h2 className="sr-only">Featured white paper</h2>
        {/* WHITE PAPER FEATURE */}
        <Link
          to="/white-paper/agentic-ai-enterprise-automation"
          className="card-flashy group mb-10 block rounded-3xl glass-strong p-8 shadow-glow sm:p-10"
        >
          <div className="relative z-[3] flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <Badge className="w-fit bg-white/10 text-white hover:bg-white/15">
                White Paper · Agentic AI
              </Badge>
              <h3 className="mt-3 font-display text-2xl font-bold text-white group-hover:text-gradient sm:text-3xl">
                How Agentic AI Is Changing Enterprise Automation
              </h3>
              <p className="mt-2 text-sm text-white/70 sm:text-base">
                Autonomous agents are moving from research to production. A look at how Agentic AI
                patterns are reshaping enterprise workflows, governance, and ROI.
              </p>
            </div>
            <ArrowRight className="hidden h-6 w-6 shrink-0 text-white/70 sm:block" />
          </div>
        </Link>

        {/* FEATURED POST */}
        {featured && (
          <>
          <h2 className="sr-only">Featured article</h2>
          <Link
            to="/blog/$slug"
            params={{ slug: featured.slug }}
            className="group mb-10 grid items-stretch overflow-hidden rounded-3xl glass-strong lg:grid-cols-2"
          >
            <div className="grid place-items-center p-8 sm:p-10">
              <div className="grid-pattern h-full w-full rounded-2xl border border-border bg-accent/30 p-8" />
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-10">
              <Badge variant="secondary" className="w-fit">
                Featured · {featured.category}
              </Badge>
              <h3 className="mt-4 font-display text-2xl font-bold sm:text-3xl group-hover:text-gradient">
                {featured.title}
              </h3>
              <p className="mt-3 text-muted-foreground">{featured.summary}</p>
              <div className="mt-5 text-xs text-muted-foreground">
                {featured.readingTime}
              </div>
            </div>
          </Link>
          </>
        )}

        {/* SEARCH + FILTERS */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 sm:flex sm:items-center sm:justify-between">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <label htmlFor="research-search" className="sr-only">Search articles</label>
            <input
              id="research-search"
              aria-label="Search articles"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search articles..."
              className="w-full rounded-full border border-input bg-background py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-80"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
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

      <Section className="pt-4">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="card-flashy group flex flex-col rounded-2xl glass-strong p-6 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <Badge variant="secondary" className="relative z-[3] w-fit">
                {p.category}
              </Badge>
              <h3 className="relative z-[3] mt-4 text-lg font-semibold group-hover:text-gradient">
                {p.title}
              </h3>
              <p className="relative z-[3] mt-2 line-clamp-3 text-sm text-muted-foreground">
                {p.summary}
              </p>
              <div className="relative z-[3] mt-auto flex items-center justify-end pt-4 text-xs text-muted-foreground">
                <span>{p.readingTime}</span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground">No articles match your filter.</p>
          )}
        </div>
      </Section>
    </>
  );
}
