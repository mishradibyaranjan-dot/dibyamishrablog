import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  Workflow,
  Brain,
  ShieldCheck,
  Zap,
  Sparkles,
  Network,
  Cog,
  Database,
  Users,
  Activity,
  LineChart,
  Lock,
  Eye,
  FileCheck,
  DollarSign,
  Gauge,
  Headphones,
  ServerCog,
  Receipt,
  ShoppingCart,
  Code2,
  Shield,
  UserCheck,
  Truck,
  Download,
  Github,
  Mail,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";

const CANONICAL = "https://dibyamishrablog.lovable.app/white-paper/agentic-ai-enterprise-automation";

export const Route = createFileRoute("/white-paper/agentic-ai-enterprise-automation")({
  head: () => ({
    meta: [
      { title: "How Agentic AI Is Changing Enterprise Automation | Dibya Ranjan Mishra" },
      {
        name: "description",
        content:
          "A white paper on how Agentic AI is reshaping enterprise automation, workflows, governance, and ROI.",
      },
      {
        name: "keywords",
        content:
          "Agentic AI, Enterprise Automation, GenAI, AI Agents, AI Governance, RPA, Workflow Automation, AI ROI, Enterprise AI",
      },
      { property: "og:type", content: "article" },
      { property: "og:title", content: "How Agentic AI Is Changing Enterprise Automation" },
      {
        property: "og:description",
        content:
          "Autonomous agents are moving from research to production. A look at how Agentic AI patterns are reshaping enterprise workflows, governance, and ROI.",
      },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "How Agentic AI Is Changing Enterprise Automation" },
      {
        name: "twitter:description",
        content: "White paper on Agentic AI, enterprise automation, governance, and ROI.",
      },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "How Agentic AI Is Changing Enterprise Automation",
          author: { "@type": "Person", name: "Dibya Ranjan Mishra" },
          description:
            "A white paper on how Agentic AI is reshaping enterprise automation, workflows, governance, and ROI.",
          url: CANONICAL,
          mainEntityOfPage: CANONICAL,
        }),
      },
    ],
  }),
  component: WhitePaper,
});

const whyCards = [
  { icon: Bot, title: "From RPA to Autonomous Agents", desc: "Move beyond brittle scripts to goal-driven agents that reason, plan, and adapt across systems." },
  { icon: Workflow, title: "Faster Enterprise Workflows", desc: "Compress multi-step processes from days to minutes with orchestrated, tool-using agents." },
  { icon: Brain, title: "Improved Decision Intelligence", desc: "Combine LLM reasoning with enterprise data, RAG, and policies for higher-quality decisions." },
  { icon: ShieldCheck, title: "Governance-First Automation", desc: "Bake guardrails, approvals, audit, and observability into every agent from day one." },
];

const insights = [
  "Enterprises are moving from experimentation to production-grade Agentic AI.",
  "Agentic AI improves productivity, decision speed, customer experience, and operational efficiency.",
  "AI agents are becoming digital workers that interact with systems, APIs, knowledge bases, and human approvals.",
  "Governance, explainability, security, and ROI tracking are critical for successful adoption.",
];

const useCases = [
  { icon: Headphones, title: "Customer Service Automation" },
  { icon: ServerCog, title: "IT Operations & Incident Management" },
  { icon: Receipt, title: "Finance & Invoice Processing" },
  { icon: ShoppingCart, title: "Procurement & Vendor Management" },
  { icon: Code2, title: "Software Engineering & DevOps" },
  { icon: Shield, title: "Cybersecurity Operations" },
  { icon: UserCheck, title: "HR & Employee Support" },
  { icon: Truck, title: "Supply Chain & Logistics" },
];

const archLayers = [
  { icon: Users, title: "User / Business Goal", desc: "Intent, objectives, and constraints from a human or upstream system." },
  { icon: Network, title: "Agent Orchestration Layer", desc: "Planner, router, and multi-agent coordination with task decomposition." },
  { icon: Brain, title: "LLM Reasoning Layer", desc: "Foundation models for reasoning, tool selection, and reflection." },
  { icon: Cog, title: "Tool & API Integration Layer", desc: "Typed tools, function calls, and integrations to ERP, CRM, ITSM, custom APIs." },
  { icon: Database, title: "Enterprise Knowledge / RAG Layer", desc: "Vector stores, semantic search, and grounded retrieval across enterprise data." },
  { icon: UserCheck, title: "Human Approval & Governance Layer", desc: "Human-in-the-loop checkpoints, policy enforcement, and role-based controls." },
  { icon: Activity, title: "Monitoring, Audit & ROI Layer", desc: "Traces, evals, cost, latency, quality, and business KPIs in one pane." },
];

const governance = [
  { icon: UserCheck, label: "Human-in-the-loop approvals" },
  { icon: Lock, label: "Role-based access controls" },
  { icon: FileCheck, label: "Audit logs" },
  { icon: Eye, label: "Model & prompt monitoring" },
  { icon: ShieldCheck, label: "Data privacy controls" },
  { icon: Sparkles, label: "Hallucination & output validation" },
  { icon: Gauge, label: "Cost & performance monitoring" },
  { icon: Shield, label: "Responsible AI policies" },
];

const roi = [
  { icon: Zap, label: "Time saved" },
  { icon: DollarSign, label: "Cost reduction" },
  { icon: LineChart, label: "Productivity improvement" },
  { icon: ShieldCheck, label: "Error reduction" },
  { icon: Gauge, label: "Faster turnaround time" },
  { icon: Sparkles, label: "Customer satisfaction" },
  { icon: FileCheck, label: "Compliance & risk reduction" },
];

const roadmap = [
  { step: "01", title: "Identify high-value automation opportunities", desc: "Map workflows where reasoning, unstructured data, or coordination dominates." },
  { step: "02", title: "Prioritize by risk, complexity, and ROI", desc: "Score candidates on impact, feasibility, governance load, and time-to-value." },
  { step: "03", title: "Build a pilot agent with human oversight", desc: "Ship a narrow, observable agent with explicit guardrails and approval steps." },
  { step: "04", title: "Integrate with enterprise systems & governance", desc: "Wire into IAM, data, ITSM, and policy controls; harden for production." },
  { step: "05", title: "Scale with monitoring, security, and continuous improvement", desc: "Expand across domains with shared platform, evals, and FinOps." },
];

function WhitePaper() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-image">
        <div className="absolute inset-0 grid-pattern opacity-25" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              White Paper · Agentic AI · Enterprise Automation
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              How <span className="text-gradient">Agentic AI</span> Is Changing Enterprise Automation
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-white/70 sm:text-lg">
              Autonomous agents are moving from research to production. A look at how Agentic AI
              patterns are reshaping enterprise workflows, governance, and ROI.
            </p>
            <div className="no-print mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-brand-gradient text-white shadow-glow hover:opacity-90">
                <a href="#executive-summary">Read White Paper <ArrowRight className="ml-1 h-4 w-4" /></a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                onClick={() => typeof window !== "undefined" && window.print()}
              >
                <Download className="mr-1 h-4 w-4" /> Download PDF
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                <Link to="/contact">Connect with Dibya</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* EXECUTIVE SUMMARY */}
      <Section id="executive-summary">
        <SectionHeader
          eyebrow="Executive Summary"
          title="From scripted automation to goal-driven autonomy"
        />
        <div className="card-flashy rounded-2xl border border-border bg-card p-8 shadow-card-soft">
          <p className="relative z-[3] text-base leading-relaxed text-foreground sm:text-lg">
            Agentic AI is redefining enterprise automation by moving organizations from scripted
            task execution toward autonomous, goal-driven workflow orchestration. Unlike
            traditional RPA or first-generation GenAI copilots, agentic systems can reason, plan,
            use tools, retrieve enterprise knowledge, coordinate with humans or other agents, and
            execute bounded actions across business systems — under measurable governance.
          </p>
        </div>
      </Section>

      {/* WHY THIS MATTERS */}
      <Section className="border-t border-border">
        <SectionHeader eyebrow="Why This Matters" title="Four shifts redefining automation" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyCards.map((c) => (
            <div key={c.title} className="card-flashy rounded-2xl border border-border bg-card p-6 shadow-card-soft">
              <div className="relative z-[3] mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="relative z-[3] text-lg font-semibold">{c.title}</h3>
              <p className="relative z-[3] mt-2 text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* KEY INSIGHTS */}
      <Section className="border-t border-border">
        <SectionHeader eyebrow="Key Research Insights" title="What the data is telling us" />
        <div className="grid gap-5 md:grid-cols-2">
          {insights.map((t, i) => (
            <div key={i} className="card-flashy rounded-2xl border border-border bg-card p-6 shadow-card-soft">
              <div className="relative z-[3] text-sm font-semibold uppercase tracking-wider text-gradient">
                Insight {String(i + 1).padStart(2, "0")}
              </div>
              <p className="relative z-[3] mt-2 text-base text-foreground">{t}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* USE CASES */}
      <Section className="border-t border-border">
        <SectionHeader eyebrow="Enterprise Use Cases" title="Where Agentic AI delivers value" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((u) => (
            <div key={u.title} className="card-flashy rounded-2xl border border-border bg-card p-5 shadow-card-soft">
              <div className="relative z-[3] mb-3 grid h-10 w-10 place-items-center rounded-xl bg-accent text-foreground">
                <u.icon className="h-5 w-5" />
              </div>
              <h3 className="relative z-[3] text-sm font-semibold sm:text-base">{u.title}</h3>
            </div>
          ))}
        </div>
      </Section>

      {/* ARCHITECTURE */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="Agentic AI Architecture"
          title="A reference architecture for production agents"
        />
        <div className="mx-auto max-w-4xl space-y-3">
          {archLayers.map((l, i) => (
            <div key={l.title} className="card-flashy rounded-2xl border border-border bg-card p-5 shadow-card-soft">
              <div className="relative z-[3] flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white">
                  <l.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gradient">
                    Layer {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-1 text-base font-semibold sm:text-lg">{l.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{l.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* GOVERNANCE */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="Governance & Risk"
          title="Enterprise Agentic AI must be safe by design"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {governance.map((g) => (
            <div key={g.label} className="card-flashy rounded-2xl border border-border bg-card p-5 shadow-card-soft">
              <div className="relative z-[3] mb-3 grid h-10 w-10 place-items-center rounded-xl bg-accent text-foreground">
                <g.icon className="h-5 w-5" />
              </div>
              <p className="relative z-[3] text-sm font-semibold">{g.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ROI */}
      <Section className="border-t border-border">
        <SectionHeader eyebrow="ROI Framework" title="Measure what matters" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roi.map((r) => (
            <div key={r.label} className="card-flashy rounded-2xl border border-border bg-card p-6 shadow-card-soft">
              <div className="relative z-[3] mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
                <r.icon className="h-5 w-5" />
              </div>
              <p className="relative z-[3] text-base font-semibold">{r.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ROADMAP */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="Implementation Roadmap"
          title="A 5-step path from pilot to scale"
        />
        <div className="mx-auto max-w-4xl space-y-4">
          {roadmap.map((r) => (
            <div key={r.step} className="card-flashy rounded-2xl border border-border bg-card p-6 shadow-card-soft">
              <div className="relative z-[3] flex items-start gap-5">
                <div className="font-display text-3xl font-bold text-gradient">{r.step}</div>
                <div>
                  <h3 className="text-lg font-semibold">{r.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* AUTHOR */}
      <Section className="border-t border-border">
        <div className="card-flashy rounded-3xl border border-border bg-card p-8 shadow-card-soft sm:p-10">
          <div className="relative z-[3] flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-2xl font-bold text-white">
              DM
            </div>
            <div className="min-w-0">
              <Badge variant="secondary" className="w-fit">About the Author</Badge>
              <h3 className="mt-3 text-2xl font-bold">Dibya Ranjan Mishra</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Technology and Engineering Leader · AI Transformation · Cloud-Native Platforms ·
                Enterprise Automation · Agentic AI · GenAI · MLOps
              </p>
              <p className="mt-4 text-base text-foreground">
                Dibya is a technology and engineering leader with 19+ years of experience leading
                large-scale engineering organizations, cloud transformation programs, AI-driven
                product initiatives, and enterprise platform modernization across Shipping, BFSI,
                Insurance, and Enterprise SaaS.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="relative overflow-hidden rounded-3xl bg-hero p-10 text-center shadow-glow sm:p-16">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative">
            <Sparkles className="mx-auto h-10 w-10 text-white" />
            <h3 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
              Interested in AI-led enterprise automation or Agentic AI transformation?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Let's discuss how Agentic AI can unlock measurable ROI in your organization.
            </p>
            <div className="no-print mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => typeof window !== "undefined" && window.print()}
              >
                <Download className="mr-1 h-4 w-4" /> Download White Paper
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                <a href="https://bold.pro/my/dibya-mishra-260203120923" target="_blank" rel="noopener noreferrer">
                  <Briefcase className="mr-1 h-4 w-4" /> View Portfolio
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                <a href="https://github.com/mishradibyaranjan-dot/Dibyatraining#dibyatraining" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-1 h-4 w-4" /> Connect on GitHub
                </a>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10">
                <Link to="/contact"><Mail className="mr-1 h-4 w-4" /> Contact Me</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
