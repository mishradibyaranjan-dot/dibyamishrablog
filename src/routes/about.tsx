import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Briefcase, Download, GraduationCap, Globe } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Dibya Ranjan Mishra" },
      { name: "description", content: "Executive profile of Dibya Ranjan Mishra — Technology & Engineering Leader with 19+ years across AI, Cloud, SaaS, and Enterprise Architecture." },
      { property: "og:title", content: "About — Dibya Ranjan Mishra" },
      { property: "og:description", content: "Technology & Engineering Leader with 19+ years across AI, Cloud, SaaS, and Enterprise Architecture." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

const timeline = [
  { year: "2022 — Present", role: "VP / Director — AI, Cloud & Platform Engineering", text: "Leading enterprise AI, Agentic AI, GenAI, and SaaS platform initiatives. Driving cloud modernization and platform engineering programs across global teams." },
  { year: "2018 — 2022", role: "Director of Engineering", text: "Owned engineering for multi-tenant SaaS products. Led 150+ engineers across geographies; established DevSecOps and platform engineering practices." },
  { year: "2014 — 2018", role: "Principal Architect / Engineering Manager", text: "Architected enterprise platforms across BFSI, Insurance, and Shipping. Spearheaded migrations to microservices and cloud-native architectures." },
  { year: "2010 — 2014", role: "Senior Engineering Lead", text: "Led delivery of large enterprise applications across .NET, Java, and distributed systems. Established CI/CD and engineering excellence practices." },
  { year: "2006 — 2010", role: "Software Engineer", text: "Hands-on engineering across application platforms, services, and early cloud adoption." },
];

const skillGroups = [
  { title: "AI & Data", items: ["GenAI / LLMs", "Agentic AI", "RAG Systems", "MLOps", "Data Science", "Snowflake / dbt", "Streaming Analytics"] },
  { title: "Cloud & Platform", items: ["AWS", "Azure", "Kubernetes", "Terraform", "ArgoCD", "Istio", "FinOps"] },
  { title: "Architecture", items: ["Microservices", "Event-Driven", "Multi-Tenant SaaS", "Cell-Based", "DDD", "Enterprise Architecture"] },
  { title: "Engineering", items: [".NET", "Python", "Node.js", "React", "Go", "DevSecOps"] },
];

function About() {
  return (
    <>
      <Section className="pb-8 pt-16 lg:pt-24">
        <div className="grid items-start gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Badge variant="secondary" className="mb-4">About</Badge>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Technology leader building <span className="text-gradient">AI-native enterprises</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Dibya Ranjan Mishra is a Technology & Engineering Leader with 19+ years of experience
              architecting, scaling, and leading mission-critical platforms across Shipping, BFSI,
              Insurance, and Enterprise SaaS.
            </p>
            <p className="mt-4 text-muted-foreground">
              His work centers on AI/ML, Generative AI, Agentic AI, Cloud-Native Platforms, SaaS
              Architecture, Data Science, and Enterprise Architecture. He has led global engineering
              organizations, transformed legacy estates into cloud-native platforms, and stood up
              AI-first programs that deliver measurable business outcomes.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Button asChild className="bg-brand-gradient text-white">
                <a href="https://bold.pro/my/dibya-mishra-260203120923" target="_blank" rel="noreferrer">Full Portfolio</a>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Get in touch</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4">
            {[
              { icon: Briefcase, k: "Industries", v: "Shipping · BFSI · Insurance · Enterprise SaaS" },
              { icon: Globe, k: "Reach", v: "Global engineering teams across 4 continents" },
              { icon: Award, k: "Focus", v: "AI Strategy · Platform · Architecture · Delivery" },
              { icon: GraduationCap, k: "Approach", v: "Research-driven, outcome-obsessed leadership" },
            ].map((c) => (
              <div key={c.k} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-gradient text-white">
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.k}</div>
                  <div className="mt-0.5 text-sm font-medium">{c.v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="border-t border-border">
        <SectionHeader eyebrow="Capabilities" title="Skills & technology stack" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {skillGroups.map((g) => (
            <div key={g.title} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gradient">{g.title}</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <span key={s} className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border">
        <SectionHeader eyebrow="Journey" title="Professional timeline" />
        <ol className="relative space-y-6 border-l border-border pl-6">
          {timeline.map((t) => (
            <li key={t.year} className="relative">
              <span className="absolute -left-[33px] top-1.5 grid h-4 w-4 place-items-center rounded-full bg-brand-gradient ring-4 ring-background" />
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-gradient">{t.year}</div>
                <div className="mt-1 font-semibold">{t.role}</div>
                <p className="mt-1 text-sm text-muted-foreground">{t.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
