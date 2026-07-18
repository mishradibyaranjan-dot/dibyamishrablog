import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, Workflow, Brain, ShieldCheck, Sparkles, Network, Cog, Database, Users, Activity, Lock, Eye, FileCheck, DollarSign, Gauge, Headphones, ServerCog, Receipt, ShoppingCart, Code2, Shield, UserCheck, Truck, ExternalLink, Mail, Briefcase, TrendingUp, Layers, Target, GitBranch, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { breadcrumbScript } from "@/lib/breadcrumbs";

const CANONICAL =
  "https://dibyamishrablog.lovable.app/white-paper/agentic-ai-enterprise-automation";

export const Route = createFileRoute("/white-paper/agentic-ai-enterprise-automation")({
  head: () => ({
    meta: [
      { title: "Agentic AI in Enterprise Automation — White Paper" },
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
          "Autonomous agents are moving from research to production. This white paper analyzes how Agentic AI patterns are reshaping enterprise workflows, governance, and ROI.",
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
      breadcrumbScript([
        { name: "White Paper", path: "/white-paper/agentic-ai-enterprise-automation" },
      ]),
    ],
  }),
  component: WhitePaper,
});

const fiveShifts = [
  {
    icon: Target,
    title: "Task execution → Outcome orchestration",
    desc: "Automation moves from executing predefined steps to pursuing bounded business outcomes across systems.",
  },
  {
    icon: Activity,
    title: "Systems of record → Systems of action",
    desc: "Enterprise applications evolve from storing data to triggering, coordinating, and executing work.",
  },
  {
    icon: Users,
    title: "Operators → Supervisors of digital labor",
    desc: "Human roles shift to designing workflows, supervising agents, and handling exceptions.",
  },
  {
    icon: ShieldCheck,
    title: "Deploy-time review → Runtime governance",
    desc: "Continuous governance across agents, tools, memory, data, and decisions replaces one-time model approvals.",
  },
  {
    icon: TrendingUp,
    title: "Labor savings → Full value equation",
    desc: "ROI expands to speed, quality, capacity, resilience, CX, revenue enablement, and risk reduction.",
  },
];

const marketSignals = [
  {
    signal: "AI agents are scaling in early functions",
    impact:
      "Agents are moving beyond proofs of concept into parts of production workflows. Prioritize process redesign, not tool experimentation.",
  },
  {
    signal: "Digital labor enters workforce planning",
    impact:
      "Capacity planning now includes humans, AI copilots, and autonomous task agents. Redefine roles, skills, supervision, and accountability.",
  },
  {
    signal: "Trust in full autonomy is fragile",
    impact:
      "Enterprises prefer bounded autonomy with guardrails and human checkpoints. Design controls and escalation paths from day one.",
  },
  {
    signal: "AI spending is rising rapidly",
    impact:
      "Agent platforms, data foundations, observability, evaluation, and cost controls become core investments — manage agents like an enterprise platform.",
  },
];

const generations = [
  {
    name: "RPA / scripted workflow",
    mech: "Rules, screen scraping, macros, predefined paths",
    fit: "Repetitive tasks with stable applications",
    limit: "Brittle when systems or process rules change",
  },
  {
    name: "Intelligent automation",
    mech: "RPA plus OCR, ML classification, decision rules",
    fit: "Document processing, triage, prediction, routing",
    limit: "Still mostly step-based and exception-heavy",
  },
  {
    name: "Generative AI copilot",
    mech: "Human-prompted text, code, search, summarization",
    fit: "Knowledge work productivity and content generation",
    limit: "Reactive, outside core process execution",
  },
  {
    name: "Agentic automation",
    mech: "Goal-driven planning, tools, memory, APIs, orchestration, human oversight",
    fit: "Multi-step workflows with dynamic inputs, decisions, and exceptions",
    limit: "Requires strong governance, evaluation, identity, and observability",
  },
];

const archLayers = [
  {
    icon: Brain,
    title: "Reasoning Layer (LLMs)",
    desc: "Reasoning, language understanding, code, summarization, classification, multimodal. Governed by model registry, approved providers, data residency, fallback, and versioning.",
  },
  {
    icon: Database,
    title: "Context & Retrieval (RAG)",
    desc: "Grounds decisions in enterprise documents, tickets, policies, CRM, ERP, knowledge bases. Requires RAG governance, data quality, access control, citation, and freshness.",
  },
  {
    icon: Layers,
    title: "Memory",
    desc: "Stores task context, preferences, prior decisions, and process state — with memory isolation, retention limits, PII handling, and poisoning detection.",
  },
  {
    icon: Cog,
    title: "Tools & APIs",
    desc: "Lets agents act: create tickets, update CRM, query ERP, run scripts, send email, trigger workflows — under least privilege, scoped credentials, and approval rules.",
  },
  {
    icon: ShieldCheck,
    title: "Guardrails & Policy",
    desc: "Constrain behavior and block unsafe content, actions, or data access using NIST/ISO controls, business rules, red teaming, and policy-as-code.",
  },
  {
    icon: Eye,
    title: "Observability & Evaluation",
    desc: "Traces, decisions, prompts, tool calls, cost, latency, quality, failures — with audit trail, drift detection, scorecards, and incident response.",
  },
  {
    icon: UserCheck,
    title: "Human Oversight",
    desc: "Review, approval, correction, override, escalation. Human-in-the-loop and human-on-the-loop with clear accountability and a kill switch.",
  },
  {
    icon: Network,
    title: "Orchestration Layer",
    desc: "Deterministic workflow engine manages state, SLAs, approvals, retries, and audit — while agents handle interpretation, planning, and exception resolution.",
  },
];

const patterns = [
  { icon: Bot, title: "Tool-using agent", desc: "Single agent uses approved tools and APIs to complete a bounded workflow." },
  { icon: GitBranch, title: "Supervisor-agent pattern", desc: "A supervisor assigns tasks to specialized research, validation, coding, finance, or compliance agents." },
  { icon: UserCheck, title: "Human-in-the-loop agent", desc: "Executes low-risk steps autonomously and requests approval before high-impact actions." },
  { icon: Database, title: "Retrieval-grounded agent", desc: "Uses RAG to ground decisions in approved policies, contracts, manuals, and enterprise knowledge." },
  { icon: Activity, title: "Event-driven agent", desc: "Monitors incidents, escalations, exceptions, or SLA breaches and triggers remediation." },
  { icon: Workflow, title: "Agentic process automation", desc: "Agents plus deterministic services orchestrate end-to-end processes such as O2C, P2P, claims, and incident response." },
  { icon: Network, title: "Agentic mesh", desc: "Modular, vendor-neutral environment where custom and vendor agents collaborate under shared controls." },
];

const useCases = [
  { icon: Headphones, title: "Customer service", lever: "Lower handle time, better FCR, 24x7 capacity, improved CX.", autonomy: "Medium — approval for refunds above thresholds." },
  { icon: ServerCog, title: "IT operations / SRE", lever: "Reduced MTTR, fewer escalations, improved resilience.", autonomy: "Medium–high for low-risk remediation; approvals for prod changes." },
  { icon: Code2, title: "Software engineering", lever: "Higher throughput, faster release cycles, improved quality.", autonomy: "Low–medium; merge and deploy stay controlled." },
  { icon: Receipt, title: "Finance operations", lever: "Cycle-time reduction, fewer manual interventions, better working capital visibility.", autonomy: "Low–medium; payments and write-offs need approval." },
  { icon: ShoppingCart, title: "Procurement", lever: "Spend optimization, faster sourcing, improved compliance.", autonomy: "Low–medium; contracts and supplier changes require approval." },
  { icon: UserCheck, title: "HR / employee service", lever: "Better EX, HR productivity, consistent policy handling.", autonomy: "Low–medium; employment decisions stay human." },
  { icon: Truck, title: "Supply chain", lever: "Resilience, service levels, inventory optimization.", autonomy: "Medium; high-value commitments require approval." },
  { icon: Shield, title: "Cybersecurity operations", lever: "Faster detection and response, fewer false positives.", autonomy: "Medium; containment with approval thresholds." },
];

const governance = [
  { icon: UserCheck, label: "Agent identity (no shared service accounts)" },
  { icon: Lock, label: "Scoped tools with explicit input/output schemas" },
  { icon: Database, label: "Memory as governed data store" },
  { icon: ShieldCheck, label: "Risk-based human approval" },
  { icon: FileCheck, label: "End-to-end traceability" },
  { icon: Eye, label: "Prompt injection & output validation" },
  { icon: Gauge, label: "Cost, latency & quality monitoring" },
  { icon: BookOpen, label: "NIST AI RMF, ISO 42001, EU AI Act alignment" },
];

const valueLevers = [
  { icon: TrendingUp, label: "Productivity", desc: "Hours saved, tickets per agent, cases per FTE, throughput." },
  { icon: Gauge, label: "Cycle time", desc: "AHT, lead time, MTTR, invoice cycle, quote turnaround." },
  { icon: FileCheck, label: "Quality", desc: "First-pass yield, defect escape, hallucination rate, compliance rate." },
  { icon: Sparkles, label: "Customer experience", desc: "FCR, CSAT, NPS, response time, personalization quality." },
  { icon: DollarSign, label: "Revenue", desc: "Conversion, upsell lift, speed to quote, renewal retention." },
  { icon: ShieldCheck, label: "Risk reduction", desc: "Violations avoided, fraud lift, audit findings reduced." },
];

const roles = [
  { title: "Business process owner", desc: "Owns workflow outcomes, KPIs, exception rules, and business value." },
  { title: "Agent product owner", desc: "Owns backlog, adoption, user feedback, controls, and agent lifecycle." },
  { title: "Enterprise architect", desc: "Fits agent patterns to data, integration, identity, and platform strategy." },
  { title: "AI platform team", desc: "Provides orchestration, observability, evaluation, model routing, and tools." },
  { title: "AI risk & compliance", desc: "Owns policy-as-code, red teaming, audit, and regulatory alignment." },
  { title: "Workflow & evaluation engineer", desc: "Designs flows, evaluation sets, and quality gates for agents." },
];

const roadmap = [
  { step: "0–30 days", title: "Establish strategy and guardrails", desc: "Use case inventory, value/risk matrix, agent taxonomy, governance charter, platform decision, initial policies." },
  { step: "31–90 days", title: "Build controlled pilots", desc: "2–3 high-value workflows: MVP agents, evaluation datasets, tool registry, approval design, cost dashboard, security tests." },
  { step: "90–180 days", title: "Scale pilots to production", desc: "Production monitoring, SLA metrics, operational support, user training, incident response, ROI review." },
  { step: "6–12 months", title: "Build an enterprise agentic platform", desc: "Agent registry, reusable orchestration, model routing, RAG governance, policy-as-code, center of excellence." },
  { step: "12+ months", title: "Move to an agentic operating model", desc: "Agent mesh, multi-agent workflows, portfolio governance, workforce redesign, strategic business model innovation." },
];

const recommendations = [
  "Start with workflows, not models — design agents around business outcomes.",
  "Create an enterprise agent registry with owners, risk tiers, tools, and retirement criteria.",
  "Adopt bounded autonomy: automate low-risk actions, gate high-risk ones.",
  "Build a shared agentic platform for models, RAG, tools, observability, policy, identity, and cost.",
  "Invest in data readiness — agent quality depends on clean, current, governed knowledge.",
  "Measure beyond accuracy: cost, latency, efficacy, assurance, reliability, security, compliance.",
  "Design for trust — show what the agent did, why, with what sources, and who is accountable.",
  "Prepare the workforce to supervise agents and redesign work responsibly.",
  "Avoid agent sprawl — no unmanaged team-level agents with shadow credentials.",
  "Treat governance as an accelerator of trust, adoption, and ROI.",
];

const autonomyLevels = [
  { level: "L0", name: "No autonomy", desc: "AI provides content or insights; humans execute all actions." },
  { level: "L1", name: "Assisted execution", desc: "AI recommends next steps; human selects and executes." },
  { level: "L2", name: "Supervised action", desc: "AI performs low-risk actions after human approval." },
  { level: "L3", name: "Bounded autonomy", desc: "AI performs actions within limits and escalates exceptions." },
  { level: "L4", name: "Conditional autonomy", desc: "AI manages workflow end-to-end under policy; humans audit and handle exceptions." },
  { level: "L5", name: "Full autonomy", desc: "Not recommended for most regulated enterprise processes today." },
];

const references = [
  { n: 1, t: "The State of AI: Global Survey 2025 — McKinsey & Company", url: "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai" },
  { n: 2, t: "Autonomous generative AI agents: Under development — Deloitte Insights", url: "https://www.deloitte.com/us/en/insights/industry/technology/technology-media-and-telecom-predictions/2025/autonomous-generative-ai-agents-still-under-development.html" },
  { n: 3, t: "Agentic AI to Dominate IT Budget Expansion — IDC", url: "https://my.idc.com/getdoc.jsp?containerId=prUS53765225" },
  { n: 4, t: "2025: The Year the Frontier Firm Is Born — Microsoft WorkLab", url: "https://www.microsoft.com/en-us/worklab/work-trend-index/2025-the-year-the-frontier-firm-is-born" },
  { n: 5, t: "AI Agent Survey — PwC", url: "https://www.pwc.com/us/en/tech-effect/ai-analytics/ai-agent-survey.html" },
  { n: 6, t: "Rise of Agentic AI — Capgemini Research Institute", url: "https://www.capgemini.com/insights/research-library/ai-agents/" },
  { n: 7, t: "Seizing the Agentic AI Advantage — McKinsey & Company", url: "https://www.mckinsey.com/capabilities/quantumblack/our-insights/seizing-the-agentic-ai-advantage" },
  { n: 8, t: "AI Risk Management Framework & GenAI Profile — NIST", url: "https://www.nist.gov/itl/ai-risk-management-framework" },
  { n: 9, t: "ISO/IEC 42001:2023 — AI Management System", url: "https://www.iso.org/standard/42001" },
  { n: 10, t: "EU AI Act — European Commission", url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai" },
  { n: 11, t: "OWASP Top 10 for LLM Applications", url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/" },
  { n: 12, t: "MAESTRO: Agentic AI Threat Modeling — Cloud Security Alliance", url: "https://cloudsecurityalliance.org/blog/2025/02/06/agentic-ai-threat-modeling-framework-maestro" },
  { n: 13, t: "How to Maximize AI ROI in 2026 — IBM", url: "https://www.ibm.com/think/insights/ai-roi" },
  { n: 14, t: "2026 Work Trend Index — Microsoft WorkLab", url: "https://www.microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization" },
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
              White Paper · Agentic AI · Enterprise Automation · June 2026
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              How <span className="text-gradient">Agentic AI</span> Is Changing Enterprise Automation
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base text-white/70 sm:text-lg">
              Autonomous agents are moving from research to production. This white paper analyzes
              how Agentic AI patterns are reshaping enterprise workflows, governance, and ROI.
            </p>
            <div className="no-print mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-brand-gradient text-white shadow-glow hover:opacity-90">
                <a href="#executive-summary">Read White Paper <ArrowRight className="ml-1 h-4 w-4" /></a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                <Link to="/contact">Connect with Dibya</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* RESEARCH SCOPE */}
      <Section id="scope">
        <div className="card-flashy rounded-2xl glass-strong p-6 sm:p-8">
          <div className="relative z-[3]">
            <Badge variant="secondary" className="mb-3">Research scope</Badge>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              This white paper synthesizes enterprise research and public sources available as of
              16 June 2026 — including analyst reports, vendor platform documentation, standards
              bodies, security frameworks, and recent academic research. It is intended for CIOs,
              CTOs, engineering leaders, automation heads, product leaders, enterprise architects,
              risk teams, and AI transformation teams.
            </p>
          </div>
        </div>
      </Section>

      {/* EXECUTIVE SUMMARY */}
      <Section id="executive-summary" className="border-t border-border">
        <SectionHeader
          eyebrow="Executive Summary"
          title="From scripted automation to goal-driven autonomy"
        />
        <div className="card-flashy rounded-2xl glass-strong p-8">
          <div className="relative z-[3] space-y-5 text-base leading-relaxed text-foreground sm:text-lg">
            <p>
              Agentic AI represents the next major phase of enterprise automation. Unlike
              traditional RPA or workflow automation, agentic systems can interpret goals, plan
              multi-step actions, call enterprise tools, use memory, coordinate with other agents
              or humans, and adapt as conditions change. This turns AI from a reactive assistant
              into a goal-driven operating layer for enterprise work.
            </p>
            <p>
              McKinsey reports 23% of organizations are scaling an agentic AI system in at least
              one business function, while another 39% are experimenting [1]. Deloitte predicted
              25% of GenAI-using companies would launch agentic pilots in 2025, rising to 50% by
              2027 [2]. IDC forecasts worldwide AI IT spending to reach $1.3 trillion by 2029 [3].
            </p>
            <p>
              The highest value comes from redesigning workflows around <strong>bounded
              autonomy</strong> — agents that perform parts of a process independently while
              policy, identity, observability, evaluation, human approval, and cost controls
              define what they are allowed to do.
            </p>
          </div>
        </div>
      </Section>

      {/* FIVE SHIFTS */}
      <Section className="border-t border-border">
        <SectionHeader eyebrow="The Core Thesis" title="Five shifts reshaping enterprise automation" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fiveShifts.map((c) => (
            <div key={c.title} className="card-flashy rounded-2xl glass-strong p-6">
              <div className="relative z-[3] mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="relative z-[3] text-lg font-semibold">{c.title}</h3>
              <p className="relative z-[3] mt-2 text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* MARKET CONTEXT */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="1 · Market Context"
          title="Why Agentic AI matters now"
        />
        <p className="mx-auto -mt-4 mb-10 max-w-3xl text-center text-sm text-muted-foreground sm:text-base">
          82% of leaders are confident digital labor will expand workforce capacity in the next
          12–18 months [4]. Among AI-agent adopters, 66% report productivity gains, 57% cost
          savings, 55% faster decisions, and 54% improved CX [5]. Yet trust in fully autonomous
          agents declined from 43% to 27% in a year [6] — adoption now hinges on governance,
          process redesign, integration, and explainability.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          {marketSignals.map((s, i) => (
            <div key={i} className="card-flashy rounded-2xl glass-strong p-6">
              <div className="relative z-[3] text-xs font-semibold uppercase tracking-wider text-gradient">
                Signal {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="relative z-[3] mt-2 text-lg font-semibold">{s.signal}</h3>
              <p className="relative z-[3] mt-2 text-sm text-muted-foreground">{s.impact}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* GENERATIONS OF AUTOMATION */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="2 · From RPA to Agentic"
          title="Four generations of enterprise automation"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {generations.map((g) => (
            <div key={g.name} className="card-flashy rounded-2xl glass-strong p-6">
              <div className="relative z-[3]">
                <h3 className="text-lg font-semibold">{g.name}</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="inline font-semibold text-foreground">Mechanism: </dt>
                    <dd className="inline text-muted-foreground">{g.mech}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-foreground">Best for: </dt>
                    <dd className="inline text-muted-foreground">{g.fit}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-foreground">Limit: </dt>
                    <dd className="inline text-muted-foreground">{g.limit}</dd>
                  </div>
                </dl>
              </div>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-muted-foreground sm:text-base">
          The strongest production patterns blend deterministic orchestration with probabilistic
          reasoning — workflow engines manage state, SLAs, approvals, and audit; agents handle
          interpretation, planning, and exception resolution.
        </p>
      </Section>

      {/* ARCHITECTURE */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="3 · Architecture Patterns"
          title="Capability stack for production agents"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {archLayers.map((l) => (
            <div key={l.title} className="card-flashy rounded-2xl glass-strong p-5">
              <div className="relative z-[3] flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white">
                  <l.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold sm:text-lg">{l.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{l.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* PATTERNS */}
      <Section className="border-t border-border">
        <SectionHeader eyebrow="Agentic Patterns" title="Seven patterns enterprises actually deploy" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patterns.map((p) => (
            <div key={p.title} className="card-flashy rounded-2xl glass-strong p-5">
              <div className="relative z-[3] mb-3 grid h-10 w-10 place-items-center rounded-xl bg-accent text-foreground">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="relative z-[3] text-base font-semibold">{p.title}</h3>
              <p className="relative z-[3] mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* USE CASES */}
      <Section className="border-t border-border">
        <SectionHeader eyebrow="4 · High-Impact Use Cases" title="Where Agentic AI delivers value" />
        <div className="grid gap-4 md:grid-cols-2">
          {useCases.map((u) => (
            <div key={u.title} className="card-flashy rounded-2xl glass-strong p-6">
              <div className="relative z-[3] flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white">
                  <u.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold sm:text-lg">{u.title}</h3>
                  <p className="mt-2 text-sm text-foreground">{u.lever}</p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gradient">
                    Autonomy: <span className="normal-case tracking-normal text-muted-foreground">{u.autonomy}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* GOVERNANCE */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="5 · Governance, Risk & Security"
          title="Enterprise Agentic AI must be safe by design"
        />
        <p className="mx-auto -mt-4 mb-10 max-w-3xl text-center text-sm text-muted-foreground sm:text-base">
          Align to NIST AI RMF [8], ISO/IEC 42001 [9], the EU AI Act [10], OWASP Top 10 for LLMs
          [11], and CSA MAESTRO threat modeling [12]. Treat every agent as a governed digital
          worker with an owner, identity, allowed tools, risk tier, approval thresholds,
          scorecard, audit trail, and retirement process.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {governance.map((g) => (
            <div key={g.label} className="card-flashy rounded-2xl glass-strong p-5">
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
        <SectionHeader eyebrow="6 · ROI Framework" title="Measure value at workflow level" />
        <div className="card-flashy mb-8 rounded-2xl glass-strong p-6 sm:p-8">
          <div className="relative z-[3]">
            <Badge variant="secondary" className="mb-3">ROI Formula</Badge>
            <p className="text-base leading-relaxed text-foreground sm:text-lg">
              <strong>Net annual value</strong> = labor productivity + cycle-time value +
              quality/rework reduction + revenue uplift + risk reduction + capacity creation
              <em className="text-muted-foreground"> − run cost − integration cost − governance cost − change management cost.</em>
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Only ~25% of AI initiatives deliver expected ROI today, and only 16% scale
              enterprise-wide [13] — discipline in portfolio selection, instrumentation, and
              operating model changes is essential.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {valueLevers.map((r) => (
            <div key={r.label} className="card-flashy rounded-2xl glass-strong p-6">
              <div className="relative z-[3] mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
                <r.icon className="h-5 w-5" />
              </div>
              <p className="relative z-[3] text-base font-semibold">{r.label}</p>
              <p className="relative z-[3] mt-1 text-sm text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* OPERATING MODEL */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="7 · Operating Model & Workforce"
          title="New roles for an agent-powered enterprise"
        />
        <p className="mx-auto -mt-4 mb-10 max-w-3xl text-center text-sm text-muted-foreground sm:text-base">
          Microsoft research finds organizational factors — culture, manager support, talent
          practices — drive 67% of reported AI impact vs 32% from individual factors [14]. The
          emerging discipline goes far beyond prompt engineering.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => (
            <div key={r.title} className="card-flashy rounded-2xl glass-strong p-5">
              <div className="relative z-[3]">
                <h3 className="text-base font-semibold">{r.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ROADMAP */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="8 · Implementation Roadmap"
          title="A wave-based path from pilot to platform"
        />
        <div className="mx-auto max-w-4xl space-y-4">
          {roadmap.map((r) => (
            <div key={r.step} className="card-flashy rounded-2xl glass-strong p-6">
              <div className="relative z-[3] flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
                <div className="font-display text-xl font-bold text-gradient sm:w-32 sm:shrink-0">
                  {r.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{r.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* RECOMMENDATIONS */}
      <Section className="border-t border-border">
        <SectionHeader eyebrow="9 · Key Recommendations" title="What leaders should do now" />
        <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2">
          {recommendations.map((r, i) => (
            <div key={i} className="card-flashy flex items-start gap-3 rounded-xl glass-strong p-4">
              <div className="relative z-[3] grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-gradient text-xs font-bold text-white">
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="relative z-[3] text-sm text-foreground">{r}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* AUTONOMY LEVELS */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="Appendix A"
          title="Autonomy levels for enterprise agents"
        />
        <div className="mx-auto max-w-4xl space-y-3">
          {autonomyLevels.map((l) => (
            <div key={l.level} className="card-flashy rounded-xl glass-strong p-5">
              <div className="relative z-[3] flex items-start gap-4">
                <div className="grid h-10 w-12 shrink-0 place-items-center rounded-lg bg-brand-gradient font-mono text-sm font-bold text-white">
                  {l.level}
                </div>
                <div>
                  <h3 className="text-base font-semibold">{l.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{l.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CONCLUSION */}
      <Section className="border-t border-border">
        <SectionHeader eyebrow="10 · Conclusion" title="A hybrid operating model wins" />
        <div className="card-flashy rounded-2xl glass-strong p-8">
          <p className="relative z-[3] text-base leading-relaxed text-foreground sm:text-lg">
            Enterprises that win with Agentic AI will not be those with the most agents. They will
            be those that redesign high-value workflows, govern autonomy at runtime, build strong
            data and integration foundations, measure ROI at process level, and prepare humans to
            supervise digital labor responsibly. The next phase of enterprise automation is
            hybrid: <strong>humans</strong> for judgment, empathy, strategy, and exceptions;
            <strong> agents</strong> for speed, scale, synthesis, and bounded execution;
            <strong> deterministic systems</strong> for policy, audit, state, and irreversible
            controls.
          </p>
        </div>
      </Section>

      {/* REFERENCES */}
      <Section className="border-t border-border">
        <SectionHeader eyebrow="References" title="Sources cited in this white paper" />
        <ol className="mx-auto max-w-4xl space-y-2 text-sm">
          {references.map((r) => (
            <li key={r.n} className="flex gap-3 rounded-lg glass-strong/40 p-3">
              <span className="font-mono text-xs font-semibold text-gradient">[{r.n}]</span>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {r.t}
              </a>
            </li>
          ))}
        </ol>
      </Section>

      {/* AUTHOR */}
      <Section className="border-t border-border">
        <div className="card-flashy rounded-3xl glass-strong p-8 sm:p-10">
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
              Ready to design bounded autonomy that delivers measurable ROI?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Let's discuss how Agentic AI can unlock outcomes across your enterprise workflows.
            </p>
            <div className="no-print mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                <a href="https://bold.pro/my/dibya-mishra-260203120923" target="_blank" rel="noopener noreferrer">
                  <Briefcase className="mr-1 h-4 w-4" /> View Portfolio
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                <a href="https://github.com/mishradibyaranjan-dot/Dibyatraining#dibyatraining" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1 h-4 w-4" /> Connect on GitHub
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
