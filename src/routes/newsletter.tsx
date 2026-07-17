import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SITE_ORIGIN } from "@/lib/og-images";

type IssueRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  hero_emoji: string;
  published_at: string | null;
};

export const Route = createFileRoute("/newsletter")({
  head: () => {
    const url = `${SITE_ORIGIN}/newsletter`;
    const desc =
      "Monthly newsletter on Agentic AI, GenAI in retail supply chains, multi-tenant SaaS, and cloud architecture — by Dibya R. Mishra.";
    return {
      meta: [
        { title: "Newsletter — Dibya R. Mishra" },
        { name: "description", content: desc },
        { property: "og:title", content: "Newsletter — Dibya R. Mishra" },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: NewsletterArchive,
});

function NewsletterArchive() {
  const [issues, setIssues] = useState<IssueRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("newsletter_issues")
      .select("id, slug, title, summary, hero_emoji, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setIssues((data ?? []) as IssueRow[]);
        setLoading(false);
      });
  }, []);

  return (
    <Section>
      <SectionHeader
        eyebrow="Newsletter"
        title="Monthly notes on AI, cloud & scale"
        description="A short, technical read on what I'm building, breaking, and learning — delivered on the 1st of each month."
      />

      <SubscribeCard />

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loading && <p className="text-white/60">Loading…</p>}
        {!loading && issues.length === 0 && (
          <p className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
            The first issue is on its way. Subscribe above to get it.
          </p>
        )}
        {issues.map((it) => (
          <Link
            key={it.id}
            to="/newsletter/$slug"
            params={{ slug: it.slug }}
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-neon-cyan/50 hover:bg-white/10"
          >
            <div className="mb-3 text-3xl">{it.hero_emoji || "📰"}</div>
            <h3 className="font-display text-lg font-bold text-white group-hover:text-neon-cyan">
              {it.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm text-white/70">{it.summary}</p>
            <div className="mt-auto flex items-center justify-between pt-4 text-xs text-white/50">
              <span>
                {it.published_at
                  ? new Date(it.published_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : ""}
              </span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

function SubscribeCard() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-xl">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-1 text-xs font-semibold text-neon-cyan">
        <Mail className="h-3.5 w-3.5" /> Free · Monthly · Unsubscribe anytime
      </div>
      <h2 className="font-display text-2xl font-bold text-white">Subscribe</h2>
      <p className="mt-2 text-sm text-white/70">
        One email per month. Deep dives, teardown of real systems, no promo fluff.
      </p>
      <form
        className="mt-5 flex flex-col gap-2 sm:flex-row"
        onSubmit={async (e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
          const email = input?.value.trim();
          if (!email) return;
          setStatus("sending");
          setMsg(null);
          try {
            const res = await fetch("/api/public/newsletter", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
            if (!res.ok) {
              const b = await res.json().catch(() => ({}));
              throw new Error(b?.error ?? `Failed (${res.status})`);
            }
            setStatus("ok");
            input.value = "";
          } catch (err) {
            setStatus("error");
            setMsg(err instanceof Error ? err.message : "Failed");
          }
        }}
      >
        <input
          name="email"
          type="email"
          required
          disabled={status === "sending"}
          placeholder="you@company.com"
          aria-label="Email address"
          className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/40"
        />
        <Button
          type="submit"
          disabled={status === "sending"}
          className="bg-brand-gradient text-white shadow-neon"
        >
          {status === "sending" ? "…" : "Subscribe"}
        </Button>
      </form>
      {status === "ok" && (
        <p className="mt-3 text-sm text-emerald-400">You're in — see you on the 1st.</p>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm text-red-400">{msg ?? "Something went wrong."}</p>
      )}
    </div>
  );
}
