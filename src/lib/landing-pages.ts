/**
 * Content for the SEO landing pages (Phase 4 — Discoverability).
 * Every experience claim references verified facts from src/lib/profile.ts and
 * src/lib/content.ts — nothing here invents metrics, clients or endorsements.
 */

export interface LandingPageContent {
  slug: string;
  eyebrow: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroCopy: string;
  problem: { heading: string; body: string; points: string[] };
  executiveContext: string;
  approach: { title: string; body: string }[];
  architecture: { body: string; points: string[] };
  /** Verified experience highlights relevant to this topic. */
  experience: string[];
  caseStudySlugs: string[];
  relatedPostSlugs: string[];
  advisoryArea: string;
  ctaLabel: string;
}

export const landingPages: Record<string, LandingPageContent> = {
  "ai-transformation": {
    slug: "ai-transformation",
    eyebrow: "Enterprise AI Transformation",
    title: "Enterprise AI Transformation That Reaches Production",
    metaTitle: "Enterprise AI Transformation — Dibya Ranjan Mishra",
    metaDescription:
      "Move enterprise AI beyond experimentation into governed, scalable production systems — agentic AI, RAG, AI governance and delivery discipline from strategy through execution.",
    heroCopy:
      "Most enterprise AI programs stall between a promising pilot and a governed production system. I help leadership teams close that gap — with an operating model that ties every AI initiative to a measurable business outcome.",
    problem: {
      heading: "Why AI Programs Stall",
      body: "Enterprises rarely lack AI ideas — they lack the path from experiment to production. Pilots multiply without governance, data foundations lag behind ambitions, and no one owns the outcome metrics.",
      points: [
        "GenAI experiments that never reach production users",
        "No governance model for agentic or LLM-driven systems",
        "AI spend without agreed business outcome metrics",
        "Engineering teams unsure how to operate AI in production",
      ],
    },
    executiveContext:
      "For CIOs, CTOs and Heads of AI, the question is no longer whether to adopt AI — it is how to adopt it without accumulating ungoverned risk. The organizations that succeed treat AI as an operating-model change: value framing first, platform foundations second, governance throughout, and delivery in thin, measurable slices.",
    approach: [
      { title: "Value framing", body: "Select use cases where a business outcome — cycle time, cost, quality, revenue — can be measured before and after." },
      { title: "Platform foundations", body: "Establish the shared retrieval, evaluation, guardrail and observability layers every AI product will reuse." },
      { title: "Governance by design", body: "Policy guardrails, human-in-the-loop approvals and audit-grade traceability built into the product surface, not bolted on." },
      { title: "Thin-slice delivery", body: "Ship behind kill switches with shadow-mode validation and progressive rollout, expanding only as evaluation coverage grows." },
    ],
    architecture: {
      body: "Production enterprise AI is a systems problem: planner/executor agent runtimes, deterministic tool layers, hybrid retrieval over governed corpora, and full observability — all operated like any other tier-one platform.",
      points: [
        "Cell-based agent runtime with deterministic tools",
        "Hybrid RAG with semantic chunking and reranking",
        "Policy guardrails vetting every tool call",
        "Evaluation infrastructure before scale",
      ],
    },
    experience: [
      "Agentic automation across 40+ regulated back-office workflows — 72% cycle-time reduction and $4.1M annual savings with zero compliance incidents in 11 months of production",
      "GenAI knowledge assistant unifying 14 enterprise systems — time-to-answer cut from 14 minutes to 28 seconds for 9,000+ users",
      "AI human-action detection systems for three retail and supply-chain clients — 40% reduction in manual monitoring",
      "AI-driven incident automation that cut recurring incidents 76% (3,800 → 900) on a global cloud-native platform",
    ],
    caseStudySlugs: ["enterprise-agentic-automation"],
    relatedPostSlugs: ["what-is-agentic-ai", "agentic-ai-enterprise-automation", "ai-delivery-predictability"],
    advisoryArea: "Enterprise AI Strategy",
    ctaLabel: "Discuss AI Transformation",
  },

  "enterprise-agentic-ai": {
    slug: "enterprise-agentic-ai",
    eyebrow: "Agentic AI",
    title: "Enterprise Agentic AI — From Demos to Governed Autonomy",
    metaTitle: "Enterprise Agentic AI — Dibya Ranjan Mishra",
    metaDescription:
      "Design and operate agentic AI systems in the enterprise: multi-agent orchestration, deterministic tool layers, policy guardrails, human-in-the-loop approvals and audit-grade traceability.",
    heroCopy:
      "Agentic AI creates real leverage only when autonomy is bounded by governance. I help enterprises design agent systems that act on their own where it is safe — and escalate to humans where it is not.",
    problem: {
      heading: "The Gap Between Agent Demos and Production",
      body: "Agent demos are easy; governed autonomy is hard. Without deterministic tools, evaluation coverage and kill switches, agent systems become unreviewable — and unreviewable systems never survive an enterprise risk review.",
      points: [
        "Agents that cannot explain or evidence their actions",
        "No human approval path for irreversible decisions",
        "Tool access without policy guardrails",
        "No evaluation infrastructure to prove reliability before scale",
      ],
    },
    executiveContext:
      "For technology leaders, agentic AI is an operating-model decision before it is a model decision. The enterprises getting value start with workflows where humans already follow checklists, prove agents in shadow mode, and expand the tool surface only as evaluation coverage grows.",
    approach: [
      { title: "Workflow selection", body: "Start where humans already follow checklists — the checklist becomes the agent's policy baseline." },
      { title: "Shadow-mode proof", body: "Run agents alongside humans, compare decisions, and build the evidence base before any autonomy is granted." },
      { title: "Bounded autonomy", body: "Deterministic tool layers, policy guardrails on every call, and human-in-the-loop gates on irreversible actions." },
      { title: "Progressive rollout", body: "Every workflow ships behind a kill switch with full traceability, expanding scope only as evaluations pass." },
    ],
    architecture: {
      body: "A production agentic platform is a cell-based runtime: planner/executor agents, a deterministic tool layer, policy guardrails vetting every tool call, hybrid RAG over policy corpora, and observability that satisfies audit — not just engineering.",
      points: [
        "Multi-agent orchestration with planner/executor patterns",
        "Deterministic tool layer — models decide, tools execute",
        "Human-in-the-loop approvals on irreversible actions",
        "Audit-grade traceability for every automated action",
      ],
    },
    experience: [
      "Agentic automation platform across 40+ regulated back-office workflows — 72% faster cycle times, $4.1M annual savings, zero compliance incidents",
      "Multi-agent system design and MCP (Model Context Protocol) integration — certified hands-on practice",
      "LLM integration and prompt engineering across production enterprise platforms",
      "MLOps and AI automation pipelines operated at tier-one reliability standards",
    ],
    caseStudySlugs: ["enterprise-agentic-automation"],
    relatedPostSlugs: ["what-is-agentic-ai", "how-to-build-an-ai-agent", "model-context-protocol-mcp-servers"],
    advisoryArea: "Enterprise AI Strategy",
    ctaLabel: "Discuss Agentic AI",
  },

  "enterprise-rag": {
    slug: "enterprise-rag",
    eyebrow: "Enterprise RAG",
    title: "Enterprise RAG Architecture That Users Trust",
    metaTitle: "Enterprise RAG Architecture — Dibya Ranjan Mishra",
    metaDescription:
      "Retrieval-augmented generation for the enterprise: hybrid retrieval, semantic chunking, reranking, per-tenant guardrails and evaluation — architecture that makes AI answers trustworthy.",
    heroCopy:
      "A RAG system is only as good as its retrieval discipline. I help enterprises build knowledge platforms where every answer is grounded in governed, current, tenant-scoped evidence.",
    problem: {
      heading: "Why Enterprise RAG Disappoints",
      body: "Most RAG failures are retrieval failures: poor chunking, no reranking, stale corpora, and no per-tenant isolation. The model gets blamed for answers the retrieval layer never gave it a chance to produce.",
      points: [
        "Answers that cannot be traced back to source evidence",
        "Knowledge scattered across a dozen or more systems",
        "No tenant isolation or access-aware retrieval",
        "No evaluation harness to measure answer quality over time",
      ],
    },
    executiveContext:
      "For Heads of AI and enterprise architects, RAG is often the first production GenAI workload — and the one that sets the governance precedent for everything after it. Getting retrieval, guardrails and evaluation right here compounds across every later AI initiative.",
    approach: [
      { title: "Corpus governance", body: "Inventory knowledge sources, define ownership and freshness obligations, and ingest with access controls intact." },
      { title: "Hybrid retrieval", body: "Combine semantic chunking, vector search and keyword signals with reranking tuned on real user questions." },
      { title: "Grounded generation", body: "Answers cite their sources; per-tenant guardrails keep retrieval inside each user's authorization boundary." },
      { title: "Continuous evaluation", body: "Golden-question suites and satisfaction signals track answer quality as corpora and models change." },
    ],
    architecture: {
      body: "Production RAG is a pipeline discipline: semantic chunking, hybrid retrieval, reranking, grounded generation with citations, per-tenant guardrails, and an evaluation harness that runs on every corpus or model change.",
      points: [
        "Semantic chunking tuned to document structure",
        "Hybrid vector + keyword retrieval with reranking",
        "Per-tenant guardrails and access-aware retrieval",
        "Citation-grounded answers with quality evaluation",
      ],
    },
    experience: [
      "GenAI knowledge assistant with hybrid-retrieval RAG across 14 enterprise systems — time-to-answer from 14 minutes to 28 seconds for 9,000+ users, 92% answer satisfaction",
      "Hybrid RAG over policy corpora inside a regulated agentic automation platform",
      "Vector search and semantic chunking practice across production GenAI platforms",
    ],
    caseStudySlugs: ["enterprise-agentic-automation"],
    relatedPostSlugs: ["scalable-rag-enterprise", "what-is-agentic-ai"],
    advisoryArea: "Enterprise AI Strategy",
    ctaLabel: "Discuss RAG Architecture",
  },

  "cloud-modernization": {
    slug: "cloud-modernization",
    eyebrow: "Cloud & Platform Modernization",
    title: "Cloud Modernization Without the Big-Bang Risk",
    metaTitle: "Cloud & Platform Modernization — Dibya Ranjan Mishra",
    metaDescription:
      "Modernize legacy platforms into secure, scalable, cloud-native architectures — strangler-fig decomposition, cell-based deployment, internal developer platforms and FinOps guardrails.",
    heroCopy:
      "Modernization fails when it is treated as a migration project instead of an organizational change. I help enterprises modernize legacy platforms incrementally — while product delivery continues.",
    problem: {
      heading: "Why Modernization Programs Stall",
      body: "Legacy monoliths block the SLAs, regional presence and release velocity the business needs — but a big-bang rewrite risks the revenue the platform already generates. The answer is disciplined incrementalism.",
      points: [
        "Monoliths that cannot meet enterprise SLA or residency demands",
        "Release cycles measured in months, not days",
        "Infrastructure costs above industry benchmarks",
        "Teams afraid to touch the platform they depend on",
      ],
    },
    executiveContext:
      "For CTOs and platform leaders, modernization is a business case before it is a technical one: enterprise buyers demand SLAs and data residency the legacy estate cannot provide, and every quarter of delay compounds the gap. The programs that succeed pay down platform debt early to unlock product velocity — and treat the new platform as a product, not a project.",
    approach: [
      { title: "Strangler-fig decomposition", body: "Carve bounded contexts out of the monolith behind stable contracts — never a flag-day rewrite." },
      { title: "Cell-based deployment", body: "Region-aware cells treated as a versioned product, satisfying data residency and SLA demands per market." },
      { title: "Internal developer platform", body: "A paved-road IDP with IaC, policy-as-code and progressive delivery so product teams self-serve safely." },
      { title: "FinOps guardrails", body: "Cost telemetry and budgets on every cell, so modernization demonstrably reduces — not relocates — spend." },
    ],
    architecture: {
      body: "The target architecture is cloud-native and cell-based: bounded contexts behind versioned contracts, region-aware data planes, an internal developer platform with progressive delivery, and FinOps guardrails on every cell.",
      points: [
        "Strangler-fig decomposition into bounded contexts",
        "Region-aware cells with data residency per market",
        "Internal developer platform with paved-road CI/CD",
        "Parallel runs and automated data migration",
      ],
    },
    experience: [
      "18-month modernization of a legacy monolith into region-aware cells — 40x deploy frequency, 38% infrastructure cost reduction, 99.99% availability, 7 new regions in 12 months",
      "Cloud-native vessel management platform led by a 40-engineer org across 5 time zones — time-to-market down 35%, rollback under 2%",
      "DevSecOps transformation — mean time to remediate critical CVEs from 21 days to 36 hours, 100% SBOM coverage",
      "Multi-cloud practice across AWS, Azure and GCP with infrastructure-as-code and Kubernetes",
    ],
    caseStudySlugs: ["saas-cloud-modernization"],
    relatedPostSlugs: ["cloud-native-saas-patterns", "payments-platform-modernization"],
    advisoryArea: "Architecture & Platform Review",
    ctaLabel: "Discuss Modernization",
  },

  "engineering-transformation": {
    slug: "engineering-transformation",
    eyebrow: "Engineering Transformation",
    title: "Engineering Transformation Measured in Outcomes",
    metaTitle: "Engineering Transformation — Dibya Ranjan Mishra",
    metaDescription:
      "Improve engineering delivery, platform practices, architecture governance and global engineering effectiveness — transformation measured in cycle time, quality and throughput, not ceremonies.",
    heroCopy:
      "Engineering transformation is not new ceremonies — it is measurably faster, safer delivery. I help engineering organizations rebuild delivery systems, governance and team topology around outcomes.",
    problem: {
      heading: "When Delivery Becomes the Bottleneck",
      body: "Slow releases, recurring incidents and unclear ownership are symptoms of a delivery system — not individual performance. Fixing it means changing how work flows, how decisions are governed, and how teams are shaped.",
      points: [
        "Release cycles that lag the business by months",
        "Recurring incidents consuming engineering capacity",
        "Architecture decisions made ad hoc, without governance",
        "Global teams misaligned on priorities and standards",
      ],
    },
    executiveContext:
      "For Heads of Engineering and CTOs, the credibility of the technology function rests on delivery predictability. The transformations that stick pair engineering metrics with business outcomes, cascade OKRs across geographies, and make architecture governance an enabler rather than a gate.",
    approach: [
      { title: "Baseline the delivery system", body: "Measure cycle time, deployment frequency, incident load and rollback rate before changing anything." },
      { title: "Rebuild the paved road", body: "CI/CD, DevSecOps and platform practices that make the safe path the easy path for every team." },
      { title: "Governance that enables", body: "Lightweight architecture governance and OKR cascading that align global teams without slowing them." },
      { title: "Prove it in numbers", body: "Track the same baseline metrics through the transformation — improvement must be visible, not asserted." },
    ],
    architecture: {
      body: "The technical backbone of engineering transformation is a paved-road delivery platform: policy-as-code pipelines, SBOM coverage, progressive delivery, and observability that lets teams own their services in production.",
      points: [
        "Paved-road CI/CD with policy-as-code",
        "DevSecOps shifted left — security as an enabler",
        "Progressive delivery with automated rollback",
        "Service ownership with production observability",
      ],
    },
    experience: [
      "Recurring incidents cut 76% (3,800 → 900) via AI-driven automation and root-cause discipline on a global platform",
      "Release frequency lifted from monthly to bi-weekly with under 2% rollback across a 40-engineer org",
      "200% delivery throughput and ~$2M vendor savings directing a 450-person delivery organization",
      "OKRs cascaded across 500+ engineers, 4 business units, India · Europe · Americas",
    ],
    caseStudySlugs: ["saas-cloud-modernization"],
    relatedPostSlugs: ["engineering-leadership-global-teams", "ai-delivery-predictability"],
    advisoryArea: "GCC & Engineering Transformation",
    ctaLabel: "Discuss Engineering Transformation",
  },

  "gcc-technology-strategy": {
    slug: "gcc-technology-strategy",
    eyebrow: "GCC Strategy & Scale",
    title: "GCC Technology Strategy — From Setup to Scale",
    metaTitle: "GCC Technology Strategy — Dibya Ranjan Mishra",
    metaDescription:
      "Establish and scale Global Capability Centres: technology strategy, organization design, engineering capability development, delivery governance and AI adoption — from ground-up setup to scaled operations.",
    heroCopy:
      "A GCC succeeds when it owns outcomes, not just headcount. I help organizations design and scale Global Capability Centres with the technology strategy, operating model and governance to deliver from day one.",
    problem: {
      heading: "Why GCCs Underdeliver",
      body: "Many GCCs become cost centres executing tickets instead of capability centres owning outcomes. The difference is set early: charter, organization design, delivery governance and the technology strategy that ties them together.",
      points: [
        "Charters defined around cost arbitrage instead of capability",
        "Organization designs that recreate headquarters' bottlenecks",
        "No delivery governance connecting the GCC to global priorities",
        "AI and platform practices imported late, or never",
      ],
    },
    executiveContext:
      "For CEOs, CIOs and GCC leaders, the centre's first eighteen months decide its trajectory. Ground-up setup done well — country leadership, org design, hiring engine, delivery governance and a multi-year technology roadmap — turns a GCC from a staffing play into a strategic capability.",
    approach: [
      { title: "Charter & technology strategy", body: "Define the outcomes the centre will own and the platform, data and AI strategy that supports them." },
      { title: "Organization design", body: "Structure teams around products and capabilities, with clear career ladders from tech lead to senior director." },
      { title: "Delivery governance", body: "Operating model, OKR cascading and stakeholder rhythms that connect the centre to global priorities." },
      { title: "Capability development", body: "Build engineering excellence, AI-enabled delivery and leadership bench strength deliberately, not accidentally." },
    ],
    architecture: {
      body: "A modern GCC is built cloud-native and AI-first from day one: DevSecOps paved roads, platform engineering practices, and governance telemetry that gives headquarters confidence without micromanagement.",
      points: [
        "Cloud-native, AI-first platform foundations",
        "DevSecOps and platform engineering from day one",
        "Governance telemetry instead of status reporting",
        "Delivery model aligned to global release trains",
      ],
    },
    experience: [
      "Currently leading ground-up setup of a Global Capability Centre in India for an international retail & supply chain client — country P&L, org design, hiring, delivery governance and multi-year roadmap",
      "Built and scaled 3 engineering organizations ground-up, from tech leads to senior directors",
      "Directed a 450-person delivery organization with $8M CAPEX/OPEX, growing account revenue $1M → $20M in 24 months",
      "$28M+ annual budget authority with C-suite reporting across global operations",
    ],
    caseStudySlugs: ["saas-cloud-modernization"],
    relatedPostSlugs: ["engineering-leadership-global-teams", "data-platform-bi-at-scale"],
    advisoryArea: "GCC & Engineering Transformation",
    ctaLabel: "Discuss GCC Strategy",
  },

  "multi-tenant-saas": {
    slug: "multi-tenant-saas",
    eyebrow: "Multi-Tenant SaaS",
    title: "Multi-Tenant SaaS Architecture That Scales Profitably",
    metaTitle: "Multi-Tenant SaaS Architecture — Dibya Ranjan Mishra",
    metaDescription:
      "Design multi-tenant SaaS platforms: tenant isolation, cell-based deployment, region-aware data planes, progressive delivery and the operating discipline that keeps enterprise SLAs.",
    heroCopy:
      "Multi-tenancy is where architecture meets unit economics. I help SaaS organizations design platforms where tenant isolation, regional compliance and release velocity reinforce each other instead of competing.",
    problem: {
      heading: "Where SaaS Architecture Breaks",
      body: "The SaaS platforms that struggle share a pattern: tenant isolation retrofitted after an incident, regional requirements discovered during a sales cycle, and deployment pipelines that treat every release as a bespoke event.",
      points: [
        "Tenant isolation bolted on after early architecture decisions",
        "Enterprise deals blocked on data residency or SLA gaps",
        "Releases that require downtime or heroic coordination",
        "Cost per tenant growing faster than revenue per tenant",
      ],
    },
    executiveContext:
      "For SaaS CTOs and product leaders, architecture decisions are commercial decisions: enterprise buyers purchase SLAs, residency and security posture as much as features. The platforms that win enterprise deals treat cells as versioned products and isolation as a design constraint from the first commit.",
    approach: [
      { title: "Isolation by design", body: "Tenant boundaries in data, compute and deployment — decided before the first enterprise contract, not after the first incident." },
      { title: "Cells as products", body: "Region-aware cells with versioned contracts, so new markets are a deployment decision, not an engineering program." },
      { title: "Progressive delivery", body: "Per-tenant rollout rings, automated rollback and parallel runs that keep SLAs through every release." },
      { title: "Unit economics telemetry", body: "Cost and performance telemetry per tenant, so the platform scales profitably, not just technically." },
    ],
    architecture: {
      body: "The reference architecture is cell-based: region-aware data planes, per-tenant isolation, an internal developer platform with progressive delivery, and observability scoped per tenant for both reliability and cost.",
      points: [
        "Region-aware cells with versioned contracts",
        "Per-tenant data isolation and guardrails",
        "Progressive delivery with per-tenant rollout rings",
        "Per-tenant cost and reliability telemetry",
      ],
    },
    experience: [
      "Cloud-native multi-tenant vessel management SaaS with 5+ SaaS integrations, led across 5 time zones — 99.9%+ reliability standards, rollback under 2%",
      "Monolith-to-cells modernization for a global ISV — 99.99% availability and 7 new regions in 12 months",
      "Greenfield SaaS product builds with roadmap ownership from presales through production",
      "Boarding & Servicing platform run at 99.9% uptime across a multi-portal BFSI estate",
    ],
    caseStudySlugs: ["saas-cloud-modernization", "biller-advantage-bfsi"],
    relatedPostSlugs: ["cloud-native-saas-patterns", "payments-platform-modernization"],
    advisoryArea: "Architecture & Platform Review",
    ctaLabel: "Discuss SaaS Architecture",
  },

  "supply-chain-ai": {
    slug: "supply-chain-ai",
    eyebrow: "Supply Chain & Enterprise Technology",
    title: "Supply Chain AI That Survives Contact With Operations",
    metaTitle: "Supply Chain AI & Enterprise Technology — Dibya Ranjan Mishra",
    metaDescription:
      "Apply AI, SaaS, data and digital platforms to complex supply-chain and enterprise technology challenges — visibility, inventory intelligence, logistics platforms and retail modernization.",
    heroCopy:
      "Supply chain technology succeeds when it respects operations. I help organizations apply AI, data platforms and cloud-native SaaS to visibility, inventory and logistics — with adoption designed in, not hoped for.",
    problem: {
      heading: "Why Supply Chain Technology Underdelivers",
      body: "Supply chains run on fragmented systems, partner data of uneven quality, and operational teams with no tolerance for disruption. Technology programs that ignore these constraints produce dashboards nobody trusts.",
      points: [
        "Visibility data fragmented across partners and systems",
        "Inventory intelligence that planners do not trust",
        "Legacy logistics platforms that resist integration",
        "AI initiatives disconnected from operational workflows",
      ],
    },
    executiveContext:
      "For supply-chain and retail technology leaders, the opportunity is real: AI-driven visibility, inventory intelligence and automated monitoring deliver measurable savings. But value only lands when the platform integrates with the systems operations already runs on — and when adoption is treated as a design requirement.",
    approach: [
      { title: "Visibility foundations", body: "Unify partner and internal data into a trustworthy operational picture before layering intelligence on top." },
      { title: "Intelligence where decisions happen", body: "Embed AI into the workflows planners and operators already use — not into separate tools they must visit." },
      { title: "Cloud-native platform", body: "Integrate SaaS providers and legacy systems on a cloud-native backbone with DevSecOps discipline." },
      { title: "Measured adoption", body: "Track operational metrics — monitoring effort, incident load, time-to-market — to prove value in the language of operations." },
    ],
    architecture: {
      body: "The platform pattern is integration-first: a cloud-native backbone connecting SaaS providers and legacy systems, AI services for detection and prediction, and operational dashboards grounded in a single governed data picture.",
      points: [
        "Cloud-native integration backbone for SaaS and legacy",
        "AI-driven detection, prediction and automation",
        "Governed data platform as the single operational picture",
        "DevSecOps delivery for continuous, safe change",
      ],
    },
    experience: [
      "Leading a GCC build for an international retail & supply chain client — supply chain visibility, inventory intelligence and retail modernization on a cloud-native, AI-first foundation",
      "Cloud-native vessel management platform for global shipping operations — onboarding, customs, prefunding and agent payments with 5+ SaaS integrations",
      "AI human-action detection for three retail and supply-chain clients — 40% reduction in manual monitoring",
      "Recurring incidents cut 76% on a global logistics platform via AI-driven automation",
    ],
    caseStudySlugs: ["enterprise-agentic-automation"],
    relatedPostSlugs: ["agentic-ai-enterprise-automation", "data-platform-bi-at-scale"],
    advisoryArea: "Executive Technology Advisory",
    ctaLabel: "Discuss Supply Chain AI",
  },
};

export const landingPageSlugs = Object.keys(landingPages);
