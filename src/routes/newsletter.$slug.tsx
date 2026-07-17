import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { supabase } from "@/integrations/supabase/client";
import { SITE_ORIGIN } from "@/lib/og-images";

type Issue = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body_markdown: string;
  hero_emoji: string;
  published_at: string | null;
};

export const Route = createFileRoute("/newsletter/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("newsletter_issues")
      .select("id, slug, title, summary, body_markdown, hero_emoji, published_at")
      .eq("slug", params.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return data as Issue;
  },
  head: ({ loaderData }) => {
    const issue = loaderData as Issue | undefined;
    const url = `${SITE_ORIGIN}/newsletter/${issue?.slug ?? ""}`;
    const title = issue?.title ?? "Newsletter";
    const desc = issue?.summary ?? "Monthly newsletter by Dibya R. Mishra.";
    return {
      meta: [
        { title: `${title} — Newsletter` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  errorComponent: () => (
    <Section>
      <p className="text-white/70">Couldn't load this issue.</p>
    </Section>
  ),
  notFoundComponent: () => (
    <Section>
      <p className="text-white/70">Issue not found.</p>
    </Section>
  ),
  component: IssuePage,
});

function IssuePage() {
  const issue = Route.useLoaderData();
  const paragraphs = issue.body_markdown
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <Link
          to="/newsletter"
          className="mb-6 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> All issues
        </Link>
        <div className="text-4xl">{issue.hero_emoji || "📰"}</div>
        <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
          {issue.title}
        </h1>
        {issue.published_at && (
          <p className="mt-2 text-sm text-white/50">
            {new Date(issue.published_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
        {issue.summary && (
          <p className="mt-4 text-lg leading-relaxed text-white/80">{issue.summary}</p>
        )}
        <article className="prose prose-invert mt-8 max-w-none text-white/85">
          {paragraphs.map((p, i) => {
            if (p.startsWith("## ")) {
              return (
                <h2 key={i} className="mt-8 font-display text-2xl font-bold text-white">
                  {p.replace(/^##\s+/, "")}
                </h2>
              );
            }
            if (p.startsWith("- ")) {
              const items = p.split(/\n- /).map((s) => s.replace(/^-\s+/, ""));
              return (
                <ul key={i} className="my-4 list-disc space-y-1 pl-6">
                  {items.map((it, j) => (
                    <li key={j}>{it}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="my-4 leading-relaxed">
                {p}
              </p>
            );
          })}
        </article>
      </div>
    </Section>
  );
}
