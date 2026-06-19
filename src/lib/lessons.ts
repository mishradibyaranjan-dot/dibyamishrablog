// Lesson catalog metadata. Detailed content lives in the lesson route component
// which dispatches on (topic, slug) to render rich JSX (diagrams, code, tables).

export type TopicKey = "ai" | "cloud" | "saas";

export interface LessonMeta {
  slug: string;
  title: string;
  summary: string;
  duration: string;
}

export const TOPIC_LABEL: Record<TopicKey, string> = {
  ai: "Intro to AI",
  cloud: "Intro to Cloud",
  saas: "Intro to SaaS",
};

export const TOPIC_TAG: Record<TopicKey, string> = {
  ai: "AI · Lesson",
  cloud: "Cloud · Lesson",
  saas: "SaaS · Lesson",
};

export const LESSONS: Record<TopicKey, LessonMeta[]> = {
  ai: [
    {
      slug: "ai-stack",
      title: "The AI Stack",
      summary:
        "How AI, Machine Learning, Deep Learning, and modern Generative & Agentic systems fit together as layered capabilities.",
      duration: "6 min",
    },
    {
      slug: "ml-types",
      title: "Types of Machine Learning",
      summary:
        "Supervised, unsupervised, and reinforcement learning — what each one is for, with concrete examples.",
      duration: "5 min",
    },
    {
      slug: "model-families",
      title: "Modern Model Families",
      summary:
        "From linear models and trees to CNNs, transformers, and diffusion — when to reach for which.",
      duration: "7 min",
    },
    {
      slug: "agent-loop",
      title: "The Agent Loop",
      summary:
        "How an AI agent wraps a model in observe → decide → use tools → act → evaluate, with guardrails.",
      duration: "5 min",
    },
    {
      slug: "governance",
      title: "Responsible AI & Governance",
      summary:
        "Risk surfaces in modern AI — confabulation, privacy, bias, prompt injection — and how to govern them.",
      duration: "6 min",
    },
  ],
  cloud: [
    {
      slug: "service-models",
      title: "Service Models: IaaS, PaaS, SaaS, Serverless",
      summary: "Who manages what across the four major cloud service models, with a side-by-side stack diagram.",
      duration: "6 min",
    },
    {
      slug: "deployment-models",
      title: "Deployment Models",
      summary: "Public, private, hybrid, and multi-cloud — what each one means and how teams actually combine them.",
      duration: "5 min",
    },
    {
      slug: "architecture",
      title: "Regions, Zones & Core Building Blocks",
      summary: "A shared mental model that maps to every major cloud: identity, network, compute, storage, services.",
      duration: "7 min",
    },
    {
      slug: "provider-map",
      title: "Cross-Provider Service Map",
      summary: "The same concept, different brand name: AWS, Azure, and Google Cloud side by side.",
      duration: "5 min",
    },
    {
      slug: "cost",
      title: "Cost, Governance & Compliance",
      summary: "Pricing awareness from day one — calculators, budgets, tagging, and compliance choices.",
      duration: "5 min",
    },
  ],
  saas: [
    {
      slug: "tenancy",
      title: "Tenancy Models: Silo, Pool, Bridge",
      summary: "The isolation spectrum from dedicated infra per tenant to fully shared pools — and when to use which.",
      duration: "7 min",
    },
    {
      slug: "pricing",
      title: "Pricing Building Blocks",
      summary: "Flat-rate, per-seat, tiered, usage-based, freemium, hybrid — how each maps to value and cost drivers.",
      duration: "6 min",
    },
    {
      slug: "architecture",
      title: "Architecture Pillars",
      summary:
        "External OIDC identity, tenant routing, tenant-aware data, and per-tenant observability — the four pillars.",
      duration: "7 min",
    },
    {
      slug: "security",
      title: "Security & Tenant Isolation",
      summary: "AuthN ≠ Isolation. A minimum control set across request, data, cache, jobs, storage, and ops.",
      duration: "6 min",
    },
    {
      slug: "observability",
      title: "Tenant-Aware Observability",
      summary: "What to measure per-tenant — latency, noisy neighbors, auth failures, plan quota.",
      duration: "5 min",
    },
  ],
};

export function getLesson(topic: TopicKey, slug: string): LessonMeta | undefined {
  return LESSONS[topic]?.find((l) => l.slug === slug);
}

export function getAdjacent(topic: TopicKey, slug: string) {
  const list = LESSONS[topic] ?? [];
  const i = list.findIndex((l) => l.slug === slug);
  return {
    prev: i > 0 ? list[i - 1] : undefined,
    next: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined,
  };
}
