import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SITE_ORIGIN } from "@/lib/og-images";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import collabNewsletter from "@/assets/collab-newsletter.jpg";

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
  pendingMs: 200,
  pendingComponent: PendingIssue,
  errorComponent: IssueError,
  notFoundComponent: IssueNotFound,
  component: IssuePage,
});

function PendingIssue() {
  return (
    <Section>
      <div
        role="status"
        aria-live="polite"
        className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 py-24 text-center"
      >
        <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" aria-hidden="true" />
        <p className="text-sm text-white/70">Loading issue…</p>
      </div>
    </Section>
  );
}

function IssueError({ error }: { error: Error }) {
  const router = useRouter();
  return (
    <Section>
      <div
        role="alert"
        className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center"
      >
        <AlertTriangle className="h-8 w-8 text-red-400" aria-hidden="true" />
        <h1 className="font-display text-xl font-bold text-white">
          Couldn't load this issue
        </h1>
        <p className="text-sm text-white/70">
          {error?.message || "Something went wrong while fetching this newsletter."}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => router.invalidate()} className="bg-brand-gradient text-white">
            Try again
          </Button>
          <Link
            to="/newsletter"
            className="inline-flex items-center gap-1 rounded-md border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" /> Back to archive
          </Link>
        </div>
      </div>
    </Section>
  );
}

function IssueNotFound() {
  const { slug } = Route.useParams();
  return (
    <Section>
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="font-display text-2xl font-bold text-white">Issue not found</h1>
        <p className="mt-2 text-sm text-white/70">
          No published newsletter matches <span className="font-mono">/{slug}</span>.
        </p>
        <Link
          to="/newsletter"
          className="mt-6 inline-flex items-center gap-1 text-sm text-neon-cyan hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Browse all issues
        </Link>
      </div>
    </Section>
  );
}


function IssuePage() {
  const issue = Route.useLoaderData() as Issue;
  const paragraphs: string[] = issue.body_markdown
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p: string) => p.trim())
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
        <figure className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-amber-50">
          <img
            src={collabNewsletter}
            alt="Human reader and friendly robot mailman delivering the monthly newsletter"
            width={1600}
            height={700}
            loading="eager"
            decoding="async"
            className="aspect-[16/6] w-full object-cover"
          />
        </figure>
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
