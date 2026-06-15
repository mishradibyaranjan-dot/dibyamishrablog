import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { posts, categories } from "@/lib/content";
import { cn } from "@/lib/utils";
import { pageOgImages, SITE_ORIGIN } from "@/lib/og-images";

export const Route = createFileRoute("/blog")({
  head: () => {
    const url = `${SITE_ORIGIN}/blog`;
    const desc = "Articles on AI, Cloud, SaaS, and Engineering Leadership.";
    return {
      meta: [
        { title: "Blog — Dibya Ranjan Mishra" },
        { name: "description", content: "Articles on AI Strategy, LLMs and RAG, Cloud Modernization, Microservices, Engineering Management, and more." },
        { property: "og:title", content: "Blog — Dibya Ranjan Mishra" },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:image", content: pageOgImages.blog },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Blog — Dibya Ranjan Mishra" },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: pageOgImages.blog },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: Blog,
});

function Blog() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesQ =
        q.trim() === "" ||
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.summary.toLowerCase().includes(q.toLowerCase());
      const matchesCat = cat === "All" || p.category === cat;
      return matchesQ && matchesCat;
    });
  }, [q, cat]);

  const featured = posts.find((p) => p.featured);

  return (
    <>
      <Section className="pb-6 pt-16 lg:pt-24">
        <SectionHeader
          eyebrow="Blog"
          title="Writing on AI, Cloud & Leadership"
          description="Practitioner essays from a 19+ year engineering career — clear, opinionated, and rooted in production reality."
        />

        {featured && (
          <Link
            to="/blog/$slug"
            params={{ slug: featured.slug }}
            className="group mb-10 grid items-stretch overflow-hidden rounded-3xl border border-border bg-hero shadow-glow lg:grid-cols-2"
          >
            <div className="grid place-items-center p-8 sm:p-10">
              <div className="grid-pattern h-full w-full rounded-2xl border border-white/10 bg-white/5 p-8" />
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-10">
              <Badge className="w-fit bg-white/10 text-white hover:bg-white/15">Featured · {featured.category}</Badge>
              <h3 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl group-hover:text-gradient">
                {featured.title}
              </h3>
              <p className="mt-3 text-white/70">{featured.summary}</p>
              <div className="mt-5 text-xs text-white/60">
                {new Date(featured.date).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })} · {featured.readingTime}
              </div>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 sm:flex sm:items-center sm:justify-between">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search articles..."
              className="w-full rounded-full border border-input bg-background py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-80"
            />
          </div>
          <div className="hidden flex-wrap gap-2 sm:flex">
            {["All", ...categories].slice(0, 6).map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  cat === c
                    ? "border-transparent bg-brand-gradient text-white"
                    : "border-border bg-card hover:bg-accent",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                cat === c
                  ? "border-transparent bg-brand-gradient text-white"
                  : "border-border bg-card",
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
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <Badge variant="secondary" className="w-fit">{p.category}</Badge>
              <h3 className="mt-4 text-lg font-semibold group-hover:text-gradient">{p.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.summary}</p>
              <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
                <span>{new Date(p.date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
                <span>{p.readingTime}</span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground">No posts match your filter.</p>
          )}
        </div>
      </Section>
    </>
  );
}
