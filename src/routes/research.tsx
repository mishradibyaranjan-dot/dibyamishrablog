import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { posts, categories } from "@/lib/content";
import { cn } from "@/lib/utils";
import { pageOgImages, SITE_ORIGIN } from "@/lib/og-images";

export const Route = createFileRoute("/research")({
  head: () => {
    const url = `${SITE_ORIGIN}/research`;
    const desc = "Research articles on AI, Cloud, SaaS, and Engineering Leadership.";
    return {
      meta: [
        { title: "Research — Dibya Ranjan Mishra" },
        { name: "description", content: "Research articles on Generative AI, Agentic AI, Cloud Architecture, SaaS, Data Science, and Engineering Leadership." },
        { property: "og:title", content: "Research — Dibya Ranjan Mishra" },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:image", content: pageOgImages.research },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Research — Dibya Ranjan Mishra" },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: pageOgImages.research },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: Research,
});

function Research() {
  const [active, setActive] = useState<string>("All");
  const filtered = active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <>
      <Section className="pb-6 pt-16 lg:pt-24">
        <SectionHeader
          eyebrow="Research"
          title="Notes, deep dives, and applied research"
          description="A working library of research across AI, Cloud, SaaS, and Engineering Leadership — written from the field."
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

      <Section className="pt-4">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="card-flashy group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-glow"
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
            <p className="text-muted-foreground">No research in this category yet.</p>
          )}
        </div>
      </Section>
    </>
  );
}
