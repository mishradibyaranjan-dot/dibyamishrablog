import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Clock, Search, Sparkles, Tag } from "lucide-react";
import { allTags, readingStats, tagsFor } from "@/lib/post-meta";

import { Section, SectionHeader } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { posts, categories } from "@/lib/content";
import { cn } from "@/lib/utils";
import { pageOgImages, SITE_ORIGIN } from "@/lib/og-images";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import heroResearch from "@/assets/hero-research.jpg";
import collabResearch from "@/assets/collab-research.jpg";


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
        { property: "og:type", content: "website" },
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
      }, breadcrumbScript([{ name: "Research", path: "/research" }])],
    };
  },
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    category: typeof search.category === "string" ? search.category : "All",
    tag: typeof search.tag === "string" ? search.tag : "",
    page: Number(search.page) > 1 ? Math.floor(Number(search.page)) : 1,
  }),
  component: Research,
});


const PAGE_SIZE = 6;

type ResearchSearch = { q: string; category: string; tag: string; page: number };

function Research() {
  const { q, category, tag, page } = Route.useSearch();
  const navigate = useNavigate({ from: "/research" });

  const setSearch = (patch: Partial<ResearchSearch>) =>
    navigate({ search: (prev: ResearchSearch) => ({ ...prev, page: 1, ...patch }) });


  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return posts.filter((p) => {
      const tags = tagsFor(p);
      const matchesQ =
        needle === "" ||
        p.title.toLowerCase().includes(needle) ||
        p.summary.toLowerCase().includes(needle) ||
        tags.some((t) => t.toLowerCase().includes(needle));
      const matchesCat = category === "All" || p.category === category;
      const matchesTag = tag === "" || tags.includes(tag);
      return matchesQ && matchesCat && matchesTag;
    });
  }, [q, category, tag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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

        <img
          src={heroResearch}
          alt="Editorial illustration of white papers, essays, and a knowledge graph representing research on Generative AI, Agentic AI, Cloud, SaaS, and Engineering Leadership"
          width={1600}
          height={900}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="mb-10 aspect-[16/9] w-full rounded-3xl border border-border/60 object-cover"
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
              <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {readingStats(featured).label}
                </span>
                <span>{readingStats(featured).words.toLocaleString()} words</span>
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
              onChange={(e) => setSearch({ q: e.target.value })}
              placeholder="Search articles..."
              className="w-full rounded-full border border-input bg-background py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-80"
            />
          </div>
          <p className="self-center whitespace-nowrap text-xs text-muted-foreground">
            {filtered.length} article{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        <h2 className="sr-only">Filter by category</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setSearch({ category: c })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                category === c
                  ? "border-transparent bg-brand-gradient text-white"
                  : "border-border bg-card hover:bg-accent",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <h2 className="sr-only">Filter by tag</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Tag className="h-3.5 w-3.5" /> Tags
          </span>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setSearch({ tag: tag === t ? "" : t })}
              aria-pressed={tag === t}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                tag === t
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
          {(tag !== "" || category !== "All" || q !== "") && (
            <button
              onClick={() => setSearch({ tag: "", category: "All", q: "" })}
              className="rounded-full px-2.5 py-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </Section>

      <Section className="pt-4">
        <h2 className="sr-only">All articles</h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((p) => {
            const stats = readingStats(p);
            return (
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
                <div className="relative z-[3] mt-4 flex flex-wrap gap-1.5">
                  {tagsFor(p).slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="relative z-[3] mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {stats.label}
                  </span>
                  <span>{stats.words.toLocaleString()} words</span>
                </div>
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-muted-foreground">No articles match your filter.</p>
          )}
        </div>

        {totalPages > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => navigate({ search: (prev: ResearchSearch) => ({ ...prev, page: safePage - 1 }) })}
              disabled={safePage === 1}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                aria-current={n === safePage ? "page" : undefined}
                onClick={() => navigate({ search: (prev: ResearchSearch) => ({ ...prev, page: n }) })}
                className={cn(
                  "min-w-9 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  n === safePage
                    ? "border-transparent bg-brand-gradient text-white"
                    : "border-border bg-card hover:bg-accent",
                )}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => navigate({ search: (prev: ResearchSearch) => ({ ...prev, page: safePage + 1 }) })}
              disabled={safePage === totalPages}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        )}
      </Section>
    </>
  );
}

