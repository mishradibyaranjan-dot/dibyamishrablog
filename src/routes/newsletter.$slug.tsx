import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SITE_ORIGIN, pageOgImages } from "@/lib/og-images";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import collabNewsletter from "@/assets/collab-newsletter.jpg";
import { Badge } from "@/components/ui/badge";
import { issueExtras, readingMinutes, extractHeadings, slugifyHeading } from "@/lib/newsletter-format";

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
    const rawTitle = issue?.title ?? "Newsletter";
    const title = `${rawTitle} — Newsletter`.length > 60 ? rawTitle.slice(0, 60) : `${rawTitle} — Newsletter`;
    const rawDesc = issue?.summary?.trim() ?? "";
    const desc = (
      rawDesc.length >= 50
        ? rawDesc
        : `${rawTitle} — an issue of the monthly newsletter by Dibya Ranjan Mishra on AI, cloud and enterprise SaaS.`
    ).slice(0, 158);
    const image = pageOgImages.newsletter;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: rawTitle },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: rawTitle,
            description: desc,
            datePublished: issue?.published_at ?? undefined,
            dateModified: issue?.published_at ?? undefined,
            author: { "@type": "Person", name: "Dibya Ranjan Mishra", url: `${SITE_ORIGIN}/about` },
            publisher: { "@type": "Person", name: "Dibya Ranjan Mishra", url: `${SITE_ORIGIN}/about` },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            url,
          }),
        },
        breadcrumbScript([
          { name: "Newsletter", path: "/newsletter" },
          { name: rawTitle, path: `/newsletter/${issue?.slug ?? ""}` },
        ]),
      ],
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

function IssueError({ error }: import("@tanstack/react-router").ErrorComponentProps) {
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
          {(error as Error)?.message || "Something went wrong while fetching this newsletter."}
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
  const extras = issueExtras[issue.slug] ?? {};
  const minutes = readingMinutes(issue.body_markdown);
  const headings = extractHeadings(issue.body_markdown);
  const paragraphs: string[] = issue.body_markdown
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p: string) => p.trim())
    .filter(Boolean);

  return (
    <Section>
      <div className="mx-auto max-w-5xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to="/newsletter" className="hover:text-foreground">Newsletter</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="truncate text-foreground">{issue.title}</li>
          </ol>
        </nav>
        <figure className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
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

        <header className="max-w-3xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {issue.title}
          </h1>
          {extras.subtitle && (
            <p className="mt-3 text-xl font-medium text-muted-foreground">{extras.subtitle}</p>
          )}
          <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{extras.author ?? "Dibya Ranjan Mishra"}</span>
            {issue.published_at && (
              <time dateTime={issue.published_at}>
                · {new Date(issue.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" })}
              </time>
            )}
            <span>· {minutes} min read</span>
          </p>
          {extras.categories && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Categories">
              {extras.categories.map((c) => (
                <li key={c}><Badge variant="secondary">{c}</Badge></li>
              ))}
            </ul>
          )}
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
          <article className="min-w-0 max-w-3xl text-base leading-relaxed text-foreground">
            {paragraphs.map((p, i) => {
              if (p.startsWith("## ")) {
                const title = p.replace(/^##\s+/, "");
                return (
                  <h2 key={i} id={slugifyHeading(title)} className="mt-10 scroll-mt-24 font-display text-2xl font-bold text-foreground">
                    {title}
                  </h2>
                );
              }
              if (p.startsWith("- ")) {
                const items = p.split(/\n- /).map((s) => s.replace(/^-\s+/, ""));
                return (
                  <ul key={i} className="my-4 list-disc space-y-1 pl-6">
                    {items.map((it, j) => <li key={j}>{it}</li>)}
                  </ul>
                );
              }
              if (/^\d+\.\s/.test(p)) {
                const items = p.split("\n").map((s) => s.replace(/^\d+\.\s+/, ""));
                return (
                  <ol key={i} className="my-4 list-decimal space-y-1 pl-6">
                    {items.map((it, j) => <li key={j}>{it}</li>)}
                  </ol>
                );
              }
              if (/^https?:\/\/\S+$/.test(p)) {
                return (
                  <p key={i} className="my-4">
                    <a href={p} className="font-medium text-primary underline-offset-4 hover:underline">{p}</a>
                  </p>
                );
              }
              return <p key={i} className="my-4 text-muted-foreground">{p}</p>;
            })}
          </article>
          {headings.length > 0 && (
            <aside className="order-first lg:order-none">
              <nav aria-label="Table of contents" className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In this issue</div>
                <ul className="mt-3 space-y-2 text-sm">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="text-muted-foreground hover:text-foreground">{h.title}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>
      </div>
    </Section>
  );
}
