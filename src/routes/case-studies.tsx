import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { caseStudies, categories } from "@/lib/content";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { pageOgImages, SITE_ORIGIN } from "@/lib/og-images";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import heroCaseStudies from "@/assets/hero-casestudies.jpg";
import collabCaseStudies from "@/assets/collab-casestudies.jpg";


export const Route = createFileRoute("/case-studies")({
  head: () => {
    const url = `${SITE_ORIGIN}/case-studies`;
    const desc = "Enterprise AI, cloud modernization, and SaaS case studies.";
    return {
      meta: [
        { title: "Case Studies — Dibya Ranjan Mishra" },
        { name: "description", content: "Detailed case studies on enterprise AI, cloud modernization, SaaS architecture, and program execution." },
        { property: "og:title", content: "Case Studies — Dibya Ranjan Mishra" },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:image", content: pageOgImages.caseStudies },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Case Studies — Dibya Ranjan Mishra" },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: pageOgImages.caseStudies },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [breadcrumbScript([{ name: "Case Studies", path: "/case-studies" }])],
    };
  },
  component: CaseStudies,
});

function CaseStudies() {
  const [active, setActive] = useState<string>("All");
  const filtered = active === "All" ? caseStudies : caseStudies.filter((c) => c.area === active);

  return (
    <div className="bg-[#fafbfc]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Section className="pb-6 pt-16 lg:pt-24">
        <SectionHeader
          as="h1"
          eyebrow="Case Studies"
          title="Programs that moved the needle"
          description="Selected case studies with the architecture choices, execution strategy, and business outcomes that defined them."
        />

        <img
          src={heroCaseStudies}
          alt="Editorial illustration of an upward-trending performance curve and stacked architecture blocks representing enterprise case study outcomes"
          width={1600}
          height={900}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="mb-8 aspect-[16/9] w-full rounded-3xl border border-slate-200 object-cover"
        />

        <figure className="mb-8 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 shadow-[0_10px_30px_-16px_rgba(59,130,246,0.3)]">
          <img
            src={collabCaseStudies}
            alt="Business leader and friendly robot reviewing rising enterprise KPI charts together"
            width={1600}
            height={700}
            loading="lazy"
            decoding="async"
            className="aspect-[16/7] w-full object-cover"
          />
          <figcaption className="flex items-center gap-2 border-t border-blue-100 bg-white/70 px-5 py-3 text-sm text-slate-700">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
            Outcomes shaped by humans and AI, working side by side.
          </figcaption>
        </figure>

        <div className="flex flex-wrap gap-2">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active === c
                  ? "border-transparent bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </Section>

      <Section className="space-y-10 pt-0">
        {filtered.map((c) => (
          <article
            key={c.slug}
            className="overflow-hidden rounded-3xl border border-t-[3px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_24px_-16px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5"
            style={{ borderTopColor: "#3b82f6" }}
          >
            <div className="border-b border-slate-200 bg-[#fafbfc] p-8 sm:p-10">
              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">{c.area}</Badge>
              <h2
                className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
              >
                {c.title}
              </h2>
              <p className="mt-3 max-w-3xl text-slate-600">{c.challenge}</p>
            </div>
            <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-2">
              <Block title="Architecture Approach" body={c.architecture} />
              <Block title="Execution Strategy" body={c.execution} />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Technology Stack</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.stack.map((s) => (
                    <span key={s} className="rounded-full border border-slate-200 bg-[#fafbfc] px-2.5 py-1 text-xs text-slate-700">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">AI / Cloud / Data Components</div>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                  {c.components.map((cmp) => (
                    <li key={cmp} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <span>{cmp}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:col-span-2 rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Outcome & Business Impact</div>
                <p className="mt-2 text-sm text-slate-700">{c.outcome}</p>
              </div>
              <div className="lg:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Lessons Learned</div>
                <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
                  {c.lessons.map((l) => (
                    <li key={l} className="rounded-xl border border-slate-200 bg-[#fafbfc] p-3 text-slate-700">{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}

        <div className="text-center">
          <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
            <Link to="/contact">Discuss a similar program</Link>
          </Button>
        </div>
      </Section>
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">{title}</div>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
    </div>
  );
}

