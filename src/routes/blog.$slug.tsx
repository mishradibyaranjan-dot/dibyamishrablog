import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Share2, Linkedin, Twitter, CheckCircle2 } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { posts } from "@/lib/content";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = posts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData, params }) => {
    const post = loaderData?.post;
    const title = post ? `${post.title} — Dibya Ranjan Mishra` : "Article";
    const desc = post?.summary ?? "Article";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
    };
  },
  notFoundComponent: () => (
    <Section>
      <p className="text-muted-foreground">Article not found.</p>
      <Button asChild className="mt-4" variant="outline">
        <Link to="/blog">Back to blog</Link>
      </Button>
    </Section>
  ),
  errorComponent: ({ reset }) => (
    <Section>
      <p>Something went wrong loading this article.</p>
      <Button onClick={reset} className="mt-4">Try again</Button>
    </Section>
  ),
  component: BlogPost,
});

function BlogPost() {
  const { post } = Route.useLoaderData();
  const related = posts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);

  const sections = [
    { id: "intro", title: "Introduction" },
    { id: "key-takeaways", title: "Key takeaways" },
    { id: "related", title: "Related reading" },
  ];

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <article>
      <Section className="pb-6 pt-16 lg:pt-24">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/blog"><ArrowLeft className="mr-1 h-4 w-4" /> Back to blog</Link>
        </Button>
        <Badge variant="secondary" className="mb-4">{post.category}</Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Dibya Ranjan Mishra</span>
          <span>· {new Date(post.date).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}</span>
          <span>· {post.readingTime}</span>
        </div>
      </Section>

      <Section className="grid gap-10 pt-0 lg:grid-cols-[1fr_220px]">
        <div className="min-w-0 space-y-6">
          <p id="intro" className="text-lg leading-relaxed text-muted-foreground">{post.summary}</p>
          <div className="prose prose-neutral max-w-none dark:prose-invert">
            <p className="text-base leading-relaxed">{post.content}</p>
            <p className="text-base leading-relaxed">
              This is a working note — expect iteration as the field and our practice evolve. If you
              have feedback, counterexamples, or want to compare implementation notes, reach out.
            </p>
          </div>

          <div id="key-takeaways" className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">Key takeaways</h3>
            <ul className="mt-4 space-y-2.5">
              {post.takeaways.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-muted-foreground"><Share2 className="inline h-4 w-4" /> Share:</span>
            <Button asChild variant="outline" size="sm">
              <a target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}>
                <Linkedin className="mr-1 h-4 w-4" /> LinkedIn
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}>
                <Twitter className="mr-1 h-4 w-4" /> Share on X
              </a>
            </Button>
          </div>

          {related.length > 0 && (
            <div id="related">
              <h3 className="text-lg font-semibold">Related posts</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to="/blog/$slug"
                    params={{ slug: r.slug }}
                    className="rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
                  >
                    <Badge variant="secondary" className="mb-2">{r.category}</Badge>
                    <div className="font-semibold">{r.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{r.readingTime}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">On this page</div>
            <ul className="mt-3 space-y-2 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-muted-foreground hover:text-foreground">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </Section>
    </article>
  );
}
