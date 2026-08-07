import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, FileText } from "lucide-react";
import { LEARN_MODULES, LEARN_TOPICS, REPO_DOCS, type LearnTopic } from "@/lib/learn-catalog";
import { posts } from "@/lib/content";
import { readingStats, tagsFor } from "@/lib/post-meta";
import type { Category } from "@/lib/content";

/** Maps a Learn topic to the research categories that pair with it. */
const TOPIC_TO_CATEGORIES: Record<LearnTopic, Category[]> = {
  AI: ["AI & Agentic AI"],
  Cloud: ["Cloud & DevSecOps"],
  SaaS: ["SaaS Platforms"],
  Architecture: ["SaaS Platforms", "Cloud & DevSecOps"],
  ITSM: ["Engineering Leadership"],
  Retail: ["Data & Analytics", "AI & Agentic AI"],
  Executive: ["Engineering Leadership", "BFSI & Payments"],
};

function relatedPosts(topic: LearnTopic) {
  const cats = TOPIC_TO_CATEGORIES[topic] ?? [];
  return posts.filter((p) => cats.includes(p.category)).slice(0, 3);
}

/**
 * Topic-organised hub for the Learn library: playbooks (modules), frameworks
 * (white papers in the repository) and related-article recommendations.
 */
export function LearnHub({ onOpenModule }: { onOpenModule: (key: string) => void }) {
  return (
    <section aria-labelledby="learn-hub" className="space-y-6">
      <div>
        <h2 id="learn-hub" className="font-display text-2xl font-bold">
          Hub — playbooks & frameworks by topic
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every module, white paper and related essay grouped by the topic it belongs to.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {LEARN_TOPICS.map((topic) => {
          const modules = LEARN_MODULES.filter((m) => m.topics.includes(topic));
          const docs = REPO_DOCS.filter((d) => d.topics.includes(topic));
          const reads = relatedPosts(topic);
          if (modules.length === 0 && docs.length === 0) return null;
          return (
            <article
              key={topic}
              className="rounded-3xl border border-border bg-card/90 p-6 shadow-[0_20px_60px_-50px_rgba(37,99,235,0.5)]"
            >
              <header className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-foreground">{topic}</h3>
                <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {modules.length} playbook{modules.length === 1 ? "" : "s"}
                </span>
              </header>

              {modules.length > 0 && (
                <ul className="mt-4 space-y-1.5">
                  {modules.map((m) => (
                    <li key={m.key}>
                      <button
                        type="button"
                        onClick={() => onOpenModule(m.key)}
                        className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="min-w-0 flex-1 truncate">{m.title}</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {docs.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Frameworks & white papers
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {docs.map((d) => (
                      <li key={d.key} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <Link to="/repository" className="hover:text-foreground">
                          {d.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {reads.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Related reading
                  </p>
                  <ul className="mt-2 space-y-2">
                    {reads.map((p) => (
                      <li key={p.slug}>
                        <Link
                          to="/blog/$slug"
                          params={{ slug: p.slug }}
                          className="block rounded-xl px-2 py-1.5 transition-colors hover:bg-accent"
                        >
                          <span className="block text-sm font-medium text-foreground">{p.title}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {tagsFor(p).slice(0, 3).join(" · ")} — {readingStats(p).label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default LearnHub;
