import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, Cloud, Database, Layers, Rocket, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { posts, projects } from "@/lib/content";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dibya Ranjan Mishra — AI, Cloud & Engineering Leadership" },
      {
        name: "description",
        content:
          "Research, insights, and real-world technology work by Dibya Ranjan Mishra — focused on GenAI, Agentic AI, Cloud-Native Platforms, SaaS Architecture, Data Science, and Digital Transformation.",
      },
      { property: "og:title", content: "Dibya Ranjan Mishra — AI, Cloud & Engineering Leadership" },
      { property: "og:description", content: "Research, insights, and real-world technology work on GenAI, Agentic AI, Cloud, and SaaS." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const expertise = [
  { icon: Brain, title: "AI & GenAI", desc: "LLMs, RAG, fine-tuning, evaluation, and production AI platforms." },
  { icon: Sparkles, title: "Agentic AI", desc: "Planner-executor agents, tool use, guardrails, and observability." },
  { icon: Cloud, title: "Cloud Architecture", desc: "AWS, Azure, Kubernetes, cell-based designs, FinOps." },
  { icon: Layers, title: "SaaS Platforms", desc: "Multi-tenant patterns, platform engineering, paved roads." },
  { icon: Database, title: "Data Science", desc: "Modern data stacks, semantic layers, AI-driven analytics." },
  { icon: Users, title: "Engineering Leadership", desc: "Global org design, operating rhythms, talent strategy." },
];

const highlights = [
  { k: "21+", v: "Years in technology leadership" },
  { k: "450+", v: "Engineers led across 5 time zones" },
  { k: "$28M+", v: "Combined budgets managed" },
  { k: "$1M → $20M", v: "Revenue growth in 24 months" },
];

function Home() {
  const featured = posts.filter((p) => p.featured).slice(0, 3);
  const latest = posts.slice(0, 4);
  const showcase = projects.slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:pt-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              Technology & Engineering Leader · 21+ years
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Exploring <span className="text-gradient">AI, Cloud, Architecture</span> &
              Engineering Leadership
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-white/70 sm:text-lg">
              Research, insights, and real-world technology work by Dibya Ranjan Mishra — focused on
              GenAI, Agentic AI, Cloud-Native Platforms, SaaS Architecture, Data Science, and
              Digital Transformation.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-brand-gradient text-white shadow-glow hover:opacity-90">
                <Link to="/research">
                  Read Research <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                <Link to="/projects">View Projects</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10">
                <Link to="/contact">Connect with Me</Link>
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
            {highlights.map((h) => (
              <div
                key={h.v}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur"
              >
                <div className="text-2xl font-bold text-white sm:text-3xl">{h.k}</div>
                <div className="mt-1 text-xs text-white/60 sm:text-sm">{h.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERTISE */}
      <Section>
        <SectionHeader
          eyebrow="Key Expertise"
          title="Building at the intersection of AI, platforms, and leadership"
          description="A practitioner's view of the technologies and disciplines that move modern enterprises forward."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {expertise.map((e) => (
            <div
              key={e.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card-soft transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
                <e.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{e.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{e.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* FEATURED RESEARCH */}
      <Section className="border-t border-border">
        <div className="flex items-end justify-between gap-4">
          <SectionHeader eyebrow="Featured Research" title="Selected deep dives" />
          <Button asChild variant="ghost" className="hidden shrink-0 sm:inline-flex">
            <Link to="/research">All research <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {featured.map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <Badge variant="secondary" className="w-fit">{p.category}</Badge>
              <h3 className="mt-4 text-lg font-semibold group-hover:text-gradient">{p.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.summary}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(p.date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
                <span>{p.readingTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* LATEST BLOG */}
      <Section className="border-t border-border">
        <div className="flex items-end justify-between gap-4">
          <SectionHeader eyebrow="Latest Posts" title="From the blog" />
          <Button asChild variant="ghost" className="hidden shrink-0 sm:inline-flex">
            <Link to="/blog">All posts <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {latest.map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 transition-colors hover:bg-accent/40 sm:px-7"
            >
              <div className="min-w-0">
                <div className="text-xs font-medium text-muted-foreground">{p.category} · {p.readingTime}</div>
                <h4 className="mt-1 truncate text-base font-semibold sm:text-lg">{p.title}</h4>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </Section>

      {/* PROJECT SHOWCASE */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="Selected Projects"
          title="From AI platforms to global modernization programs"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {showcase.map((p) => (
            <div key={p.slug} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card-soft">
              <Badge variant="secondary" className="w-fit">{p.area}</Badge>
              <h3 className="mt-3 text-lg font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.solution}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.metrics.map((m) => (
                  <span key={m} className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium">{m}</span>
                ))}
              </div>
              <div className="mt-5">
                <Button asChild variant="outline" size="sm">
                  <Link to="/projects">View details</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CAREER HIGHLIGHTS */}
      <Section className="border-t border-border">
        <SectionHeader eyebrow="Professional Highlights" title="Career at a glance" align="center" />
        <div className="mx-auto max-w-3xl space-y-5">
          {[
            { year: "2022 — 2026 · Inchcape Shipping Services", text: "Head of Engineering & Global Application Support — led 40 engineers across 5 time zones delivering cloud-native vessel management; AI transformation cut incidents 76% and training effort 60%." },
            { year: "2019 — 2022 · Centific India", text: "Director of Delivery — 450-person org, $8M budget; grew account revenue $1M → $20M in 24 months; Microsoft Office 365 & Data Platform programs for 10,000+ users." },
            { year: "2017 — 2019 · Deloitte Support Services", text: "Delivery Manager — built unified web/mobile platform for Deloitte University (Texas), automating event lifecycle for 2,000+ annual guests with zero critical outages." },
            { year: "2011 — 2017 · Capgemini", text: "Senior Consultant, BFSI SME — architected Biller Advantage platform compressing merchant onboarding from 3 months to 4 hours; Selective Insurance CLAS payment engines." },
            { year: "2009 — 2011 · CGI", text: "Senior Software Engineer, Telecom SME — built Payment Engine for Bell Canada serving millions of subscribers with <4-hour P1 SLA." },
            { year: "2006 — 2008 · Accenture India", text: "Software Engineer — Java & Python web applications for Aflac, AAA, and Auto Club across 3 concurrent client programs." },
          ].map((m) => (
            <div key={m.year} className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-gradient">{m.year}</div>
              <p className="mt-1 text-sm text-foreground">{m.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="relative overflow-hidden rounded-3xl bg-hero p-10 text-center shadow-glow sm:p-16">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative">
            <Rocket className="mx-auto h-10 w-10 text-white" />
            <h3 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
              Let's build the next breakthrough together.
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Advisory, architecture reviews, or just a conversation about AI and engineering leadership.
            </p>
            <Button asChild size="lg" className="mt-7 bg-white text-primary hover:bg-white/90">
              <Link to="/contact">Start a conversation <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
