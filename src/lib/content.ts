// Shared taxonomy — used by Projects (area + filter), Case Studies (tags),
// and Research (category filter). All values come from the resume's skill
// groups so filters/tags stay consistent across pages.
export const categories = [
  "AI & Agentic AI",
  "Cloud & DevSecOps",
  "SaaS Platforms",
  "Data & Analytics",
  "BFSI & Payments",
  "Engineering Leadership",
] as const;

export type Category = (typeof categories)[number];

// Canonical technology tags pulled from the resume — re-used as `tech` on
// projects and `stack` on case studies so the same chips appear everywhere.
export const techTags = {
  ai: [
    "LLM Integration",
    "Prompt Engineering",
    "Agentic AI",
    "Model Context Protocol",
    "MLOps",
    "GenAI Platforms",
  ],
  cloud: [
    "AWS",
    "Azure",
    "GCP",
    "Kubernetes",
    "Docker",
    "Terraform (IaC)",
    "GitHub Actions",
    "DevSecOps",
  ],
  stack: [
    ".NET Core / C#",
    "React",
    "Angular",
    "TypeScript",
    "Node.js",
    "Python",
    "SQL / NoSQL",
    "REST APIs",
    "Mobile",
  ],
  data: ["BI & Analytics", "Snowflake", "dbt", "Kafka", "Power BI"],
  delivery: [
    "SAFe 6.0",
    "Scrum",
    "ITIL",
    "Lean Six Sigma",
    "Enterprise Architecture",
  ],
} as const;

export interface Post {
  slug: string;
  title: string;
  summary: string;
  category: Category;
  readingTime: string;
  date: string;
  featured?: boolean;
  content: string;
  takeaways: string[];
}

export const posts: Post[] = [
  {
    slug: "agentic-ai-enterprise-automation",
    title: "How Agentic AI Is Changing Enterprise Automation",
    summary:
      "Autonomous agents are moving from research to production. A look at how Agentic AI patterns are reshaping enterprise workflows, governance, and ROI.",
    category: "AI & Agentic AI",
    readingTime: "8 min",
    date: "2025-09-12",
    featured: true,
    takeaways: [
      "Agentic systems shift automation from rules to goals.",
      "Memory, tools, and planning loops are the new building blocks.",
      "Governance, observability, and guardrails are non-negotiable in production.",
    ],
    content:
      "Enterprises are moving beyond chatbots toward goal-driven agents that plan, reason, and act across systems. In this article we explore the architecture patterns — planner-executor, multi-agent orchestration, and tool-augmented retrieval — that make Agentic AI deployable at scale. We discuss the operational backbone: identity, policy, observability, and human-in-the-loop checkpoints. Finally we walk through ROI levers across finance ops, customer service, and engineering productivity.",
  },
  {
    slug: "scalable-rag-enterprise",
    title: "Building Scalable RAG Systems for Enterprise Knowledge",
    summary:
      "A practitioner's guide to designing retrieval-augmented generation pipelines that survive real enterprise data — messy, multilingual, and regulated.",
    category: "AI & Agentic AI",
    readingTime: "10 min",
    date: "2025-08-28",
    featured: true,
    takeaways: [
      "Chunking strategy matters more than model size.",
      "Hybrid retrieval (BM25 + dense) outperforms vector-only in most enterprise corpora.",
      "Evaluation harnesses must be built before, not after, the pipeline.",
    ],
    content:
      "RAG looks deceptively simple in demos. Production RAG is an engineering discipline. We cover ingestion pipelines, semantic chunking, hybrid retrieval, reranking, prompt assembly, and continuous evaluation. We also discuss cost optimization, caching, and the hidden tax of stale embeddings.",
  },
  {
    slug: "cloud-native-saas-patterns",
    title: "Cloud-Native Architecture Patterns for Modern SaaS Platforms",
    summary:
      "Multi-tenant isolation, cell-based architectures, and platform engineering — patterns I've used to scale SaaS from MVP to enterprise.",
    category: "SaaS Platforms",
    readingTime: "12 min",
    date: "2025-08-10",
    featured: true,
    takeaways: [
      "Choose tenancy model before product-market fit hardens.",
      "Cells contain blast radius and unlock per-tenant SLOs.",
      "Platform teams accelerate product teams only with paved roads.",
    ],
    content:
      "Modern SaaS lives on Kubernetes, service meshes, and managed data planes. We unpack tenancy models (silo, pool, bridge), cell-based architectures, and how platform engineering converts infrastructure into developer leverage.",
  },
  {
    slug: "engineering-leadership-global-teams",
    title: "Engineering Leadership Lessons from Managing Large Global Teams",
    summary:
      "What I've learned leading 450+ engineers across time zones, cultures, and business contexts — and the operating rhythms that actually work.",
    category: "Engineering Leadership",
    readingTime: "7 min",
    date: "2025-07-22",
    takeaways: [
      "Clarity beats charisma at scale.",
      "Async-first writing culture is a leadership multiplier.",
      "Promote outcomes, not output.",
    ],
    content:
      "Leading global engineering organizations is a craft of clarity, cadence, and care. This piece distills the operating system I've refined over 21+ years — from squad design to skip-levels, from OKRs to engineering excellence reviews.",
  },
  {
    slug: "ai-delivery-predictability",
    title: "How AI Can Improve Delivery Predictability and Operational Efficiency",
    summary:
      "Using AI signals on engineering telemetry to forecast delivery risk, reduce escapes, and improve flow — without surveillance theatre.",
    category: "Engineering Leadership",
    readingTime: "9 min",
    date: "2025-07-05",
    takeaways: [
      "Flow metrics + AI > status meetings.",
      "Predictive risk models depend on clean DORA data.",
      "Trust is the precondition for telemetry.",
    ],
    content:
      "Program delivery is a forecasting problem. AI applied to engineering telemetry — PRs, deploys, incidents, work-item flow — can surface risk early and free leaders to coach instead of chase.",
  },
  {
    slug: "payments-platform-modernization",
    title: "Modernizing Enterprise Payment Platforms",
    summary:
      "Lessons from architecting a BFSI multi-portal payment engine — onboarding, reliability, and the discipline of 99.9% uptime.",
    category: "BFSI & Payments",
    readingTime: "8 min",
    date: "2025-06-18",
    takeaways: [
      "Merchant onboarding is a product, not a project.",
      "Idempotency and retries are the heart of payments reliability.",
      "Compress feedback loops before scaling volume.",
    ],
    content:
      "Payments platforms live or die by reliability and onboarding velocity. This piece distills patterns from BFSI engagements — multi-portal architectures, payment engine design, and the operating model that holds 99.9% uptime under real traffic.",
  },
  {
    slug: "data-platform-bi-at-scale",
    title: "Designing Data Platforms & BI for Enterprise Scale",
    summary:
      "A blueprint for unified semantic layers, governed BI, and AI-ready data products — built on lessons from Microsoft Data Platform programs.",
    category: "Data & Analytics",
    readingTime: "9 min",
    date: "2025-06-02",
    takeaways: [
      "One semantic layer beats ten dashboards.",
      "Governance is a product surface, not a checklist.",
      "AI summaries only work on trusted data.",
    ],
    content:
      "Enterprise BI is shifting from dashboards to decision systems. This piece outlines the architecture patterns — lakehouse, semantic layer, governed metrics, AI narratives — that turn data platforms into leverage.",
  },
];

export interface Project {
  slug: string;
  name: string;
  problem: string;
  solution: string;
  tech: string[];
  impact: string;
  metrics: string[];
  area: Category;
}

export const projects: Project[] = [
  {
    slug: "ai-enterprise-automation",
    name: "AI-Powered Enterprise Automation Suite",
    problem:
      "Manual back-office workflows across finance and operations caused multi-day cycle times and inconsistent quality.",
    solution:
      "Designed an agentic automation platform combining LLM planners, deterministic tools, and human-in-the-loop approvals.",
    tech: ["Agentic AI", "LLM Integration", "Python", "Azure", "Kubernetes", "MLOps"],
    impact: "Cut cycle time by 72% and reclaimed 18,000+ analyst hours annually.",
    metrics: ["-72% cycle time", "+99.2% accuracy", "$4.1M annual savings"],
    area: "AI & Agentic AI",
  },
  {
    slug: "vessel-management-platform",
    name: "Cloud-Native Vessel Management Platform",
    problem:
      "Legacy port operations across onboarding, customs, prefunding, and agent payments lacked a unified, AI-assisted platform.",
    solution:
      "Led a 40-engineer org across 5 time zones to deliver a cloud-native SaaS with 5+ integrations (Unit4, Eye-share) and embedded AI for incident reduction.",
    tech: [".NET Core / C#", "React", "Azure", "Kubernetes", "DevSecOps", "REST APIs"],
    impact: "Time-to-market down 35%; recurring incidents 3,800 → 900; manual training effort -60%.",
    metrics: ["-76% recurring incidents", "-35% time-to-market", "<2% rollback rate"],
    area: "SaaS Platforms",
  },
  {
    slug: "genai-knowledge-assistant",
    name: "GenAI Knowledge Assistant (RAG)",
    problem:
      "Distributed enterprise knowledge across 14 systems made expert answers slow and inconsistent.",
    solution:
      "Built a hybrid-retrieval RAG platform with semantic chunking, reranking, and per-tenant guardrails.",
    tech: ["GenAI Platforms", "LLM Integration", "Python", "React", "Azure"],
    impact: "Reduced time-to-answer from 14 min to 28 sec for 9,000+ users.",
    metrics: ["-96% time to answer", "92% answer satisfaction", "14 sources unified"],
    area: "AI & Agentic AI",
  },
  {
    slug: "cloud-platform-modernization",
    name: "Cloud Migration & Platform Modernization",
    problem:
      "Legacy monoliths on-prem limited release velocity and pushed infrastructure costs above industry benchmarks.",
    solution:
      "Led a cell-based AWS migration with strangler-fig refactoring, IaC, and an internal developer platform.",
    tech: ["AWS", "Kubernetes", "Terraform (IaC)", "GitHub Actions", ".NET Core / C#", "Node.js"],
    impact: "Deploy frequency moved from monthly to 40+ per day; infra cost down 38%.",
    metrics: ["40x deploy frequency", "-38% infra cost", "99.99% availability"],
    area: "Cloud & DevSecOps",
  },
  {
    slug: "office365-delivery-program",
    name: "Data Platform & BI Delivery",
    problem:
      "A $1M account needed a scaled delivery engine to ship Office 365 / Office IP, Data Platform, and BI to 10,000+ Microsoft employees.",
    solution:
      "Directed a 450-person org (15 Managers, 70 Tech Leads); rebuilt delivery on Azure with BI and governance.",
    tech: ["Azure", "Power BI", "BI & Analytics", "SAFe 6.0", "Enterprise Architecture"],
    impact: "Account revenue grew $1M → $20M in 24 months; 200% delivery throughput; ~$2M vendor savings at 99.5% SLA.",
    metrics: ["$1M → $20M revenue", "+200% throughput", "99.5% SLA"],
    area: "Data & Analytics",
  },
  {
    slug: "deloitte-university-platform",
    name: "Unified Web + Mobile Platform",
    problem:
      "Five third-party tools and manual workflows ran the event lifecycle for 2,000+ annual guests at a corporate campus, Texas.",
    solution:
      "Architected a unified web + mobile platform with AI automation and SaaS payments, retiring all five tools.",
    tech: ["React", "Mobile", "Node.js", "SQL / NoSQL", "REST APIs"],
    impact: "100% event lifecycle automated; -15 hrs/week manual entry; booking errors -90%; zero critical outages for 2.5 years.",
    metrics: ["-90% booking errors", "10+ deploys/week", "0 critical outages (2.5 yrs)"],
    area: "SaaS Platforms",
  },
  {
    slug: "devsecops-transformation",
    name: "DevSecOps & CI/CD Transformation",
    problem:
      "Security was a release blocker; pipelines were fragmented across teams.",
    solution:
      "Shifted security left with policy-as-code, SBOMs, and a paved-road CI/CD platform.",
    tech: ["GitHub Actions", "DevSecOps", "Kubernetes", "Terraform (IaC)"],
    impact: "Mean time to remediate critical CVEs dropped from 21 days to 36 hours.",
    metrics: ["-94% MTTR for criticals", "100% SBOM coverage", "0 prod escapes (Q4)"],
    area: "Cloud & DevSecOps",
  },
  {
    slug: "intelligent-analytics",
    name: "Intelligent Analytics & Dashboards",
    problem:
      "Executives lacked a real-time view of operations across geographies.",
    solution:
      "Built a streaming analytics platform with AI-summarized narratives over a unified semantic layer.",
    tech: ["Snowflake", "dbt", "Kafka", "BI & Analytics", "LLM Integration"],
    impact: "Decisions accelerated by 5x with a single source of truth.",
    metrics: ["5x faster decisions", "1 semantic layer", "8 geographies live"],
    area: "Data & Analytics",
  },
];

export interface CaseStudy {
  slug: string;
  title: string;
  challenge: string;
  architecture: string;
  stack: string[];
  execution: string;
  components: string[];
  outcome: string;
  lessons: string[];
  area: Category;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "enterprise-agentic-automation",
    title: "Enterprise Agentic Automation at Scale",
    area: "AI & Agentic AI",
    challenge:
      "A multinational needed to automate 40+ back-office workflows under strict compliance and audit constraints.",
    architecture:
      "Cell-based agent runtime with planner/executor agents, deterministic tool layer, policy guardrails, and full observability.",
    stack: ["Agentic AI", "LLM Integration", "Azure", "Kubernetes", "Python", "MLOps"],
    execution:
      "Quarterly thin-slice releases; each workflow shipped behind a kill switch with shadow-mode and progressive rollout.",
    components: [
      "Multi-agent orchestration",
      "Hybrid RAG over policy corpora",
      "Human-in-the-loop approvals",
      "Audit-grade traceability",
    ],
    outcome:
      "72% cycle-time reduction, $4.1M annual savings, zero compliance incidents across 11 months in production.",
    lessons: [
      "Start with workflows where humans already follow checklists.",
      "Invest in evaluation infrastructure before scaling agents.",
      "Guardrails are a product surface, not a bolt-on.",
    ],
  },
  {
    slug: "saas-cloud-modernization",
    title: "SaaS Cloud Modernization for a Global ISV",
    area: "Cloud & DevSecOps",
    challenge:
      "Legacy monolith couldn't meet enterprise SLAs or regional data residency demands.",
    architecture:
      "Strangler-fig decomposition into bounded contexts, cell-based deployment per region, IDP for product teams.",
    stack: ["AWS", "Kubernetes", "Terraform (IaC)", "GitHub Actions", ".NET Core / C#", "Node.js"],
    execution:
      "18-month program with parallel runs, automated data migration, and weekly stakeholder demos.",
    components: [
      "Internal developer platform",
      "Region-aware data plane",
      "Progressive delivery",
      "FinOps guardrails",
    ],
    outcome:
      "40x deploy frequency, 38% infra cost reduction, 99.99% availability, 7 new regions in 12 months.",
    lessons: [
      "Modernization is an organizational change as much as a technical one.",
      "Pay down platform debt early to unlock product velocity.",
      "Treat cells as a product with versioned contracts.",
    ],
  },
  {
    slug: "biller-advantage-bfsi",
    title: "BFSI Payments Onboarding at Scale",
    area: "BFSI & Payments",
    challenge:
      "Merchant onboarding took 3 months across 20+ US states, capping growth for a multi-portal payments platform.",
    architecture:
      "Multi-portal platform sharing a hardened payment engine; automated merchant onboarding pipeline with rules-driven KYC and routing.",
    stack: [".NET Core / C#", "SQL / NoSQL", "REST APIs", "Azure", "DevSecOps"],
    execution:
      "Domain-driven slices per portal; release trains aligned to regulator windows; SRE-led reliability program targeting 99.9% uptime.",
    components: [
      "Merchant onboarding pipeline",
      "Core payment engine",
      "Boarding & Servicing platform",
      "Reconciliation & audit",
    ],
    outcome:
      "Merchant onboarding compressed from 3 months to 4 hours (-98%); 99.9% uptime on Boarding & Servicing across the engagement.",
    lessons: [
      "Onboarding velocity is a product KPI — instrument it end-to-end.",
      "Idempotency and retries belong in the platform, not the apps.",
      "Regulator-aligned release trains beat ad-hoc deployments in BFSI.",
    ],
  },
];
