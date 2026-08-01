/**
 * Search catalog for the Learn library and the members-only repository.
 *
 * Keeps a single source of truth for module keys, topics, PDF doc keys and
 * the free-text blob each entry is matched against.
 */

export type LearnTopic =
  | "AI"
  | "Cloud"
  | "SaaS"
  | "ITSM"
  | "Retail"
  | "Architecture"
  | "Executive";

export type LearnModule = {
  /** Tab key used by /learn */
  key: string;
  label: string;
  title: string;
  summary: string;
  topics: LearnTopic[];
  /** Key understood by /api/download/pdf, or null when no PDF exists */
  docKey: string | null;
  keywords: string[];
};

export const LEARN_MODULES: LearnModule[] = [
  {
    key: "ai",
    label: "Intro to AI",
    title: "Introduction to AI & AI Agents",
    summary:
      "Ground-up introduction to artificial intelligence, machine learning, neural networks and modern autonomous agents.",
    topics: ["AI"],
    docKey: "ai-beginner",
    keywords: [
      "artificial intelligence", "machine learning", "deep learning", "neural network",
      "supervised", "unsupervised", "reinforcement learning", "agents", "tools",
      "planning", "perception", "transformers", "history of ai", "turing",
    ],
  },
  {
    key: "cloud",
    label: "Intro to Cloud",
    title: "Cloud Computing Foundations",
    summary:
      "Service models (IaaS/PaaS/SaaS), deployment models, regions and availability zones, networking, cost and security basics.",
    topics: ["Cloud", "Architecture"],
    docKey: "intro-cloud",
    keywords: [
      "iaas", "paas", "saas", "public cloud", "private cloud", "hybrid", "region",
      "availability zone", "virtual machine", "container", "kubernetes", "serverless",
      "cost optimization", "finops", "shared responsibility", "aws", "azure", "gcp",
    ],
  },
  {
    key: "saas",
    label: "Intro to SaaS",
    title: "SaaS Architecture & Delivery",
    summary:
      "How SaaS products are architected, priced, secured, observed and operated in production.",
    topics: ["SaaS", "Architecture"],
    docKey: "saas-tutorial",
    keywords: [
      "subscription", "pricing", "churn", "arr", "mrr", "onboarding", "billing",
      "observability", "sla", "uptime", "release", "feature flags", "product led growth",
    ],
  },
  {
    key: "itil",
    label: "ITIL & Kanban",
    title: "Implementing ITIL with Kanban",
    summary:
      "Incident, change, problem and service request management run as a Kanban flow with WIP limits, SLAs and governance.",
    topics: ["ITSM"],
    docKey: "itil",
    keywords: [
      "itil", "kanban", "incident management", "change management", "problem management",
      "service request", "wip limit", "cycle time", "lead time", "cab", "sla", "cmdb",
      "service desk", "major incident", "governance",
    ],
  },
  {
    key: "llm",
    label: "LLM Engineering",
    title: "Large Language Models — Foundations & Practice",
    summary:
      "Architectures, tokenisation, training, prompting, fine-tuning, evaluation and production deployment of LLMs.",
    topics: ["AI"],
    docKey: "llm",
    keywords: [
      "transformer", "attention", "token", "embedding", "context window", "prompt",
      "few shot", "fine tuning", "lora", "quantization", "inference", "hallucination",
      "guardrails", "evaluation", "latency", "cost per token",
    ],
  },
  {
    key: "genai-retail",
    label: "GenAI in Retail",
    title: "Generative AI in Retail & Supply Chains",
    summary:
      "Applying generative AI to demand forecasting, merchandising, logistics, store operations and customer service.",
    topics: ["Retail", "AI"],
    docKey: "retail",
    keywords: [
      "retail", "supply chain", "demand forecasting", "merchandising", "assortment",
      "inventory", "logistics", "last mile", "store operations", "personalization",
      "pricing", "planogram", "omnichannel",
    ],
  },
  {
    key: "multitenant",
    label: "Multi-Tenant Apps",
    title: "Designing Multi-Tenant Applications",
    summary:
      "Tenant isolation strategies, data partitioning, noisy-neighbour control, per-tenant limits and security boundaries.",
    topics: ["SaaS", "Architecture"],
    docKey: "saas-tutorial",
    keywords: [
      "multi tenant", "tenant isolation", "row level security", "schema per tenant",
      "database per tenant", "noisy neighbour", "quota", "rate limit", "sharding",
      "tenant onboarding", "data residency",
    ],
  },
  {
    key: "rag",
    label: "RAG Systems",
    title: "Building & Deploying RAG Systems",
    summary:
      "Chunking, embeddings, vector stores, retrievers, re-ranking, evaluation and production RAG operations.",
    topics: ["AI", "Architecture"],
    docKey: "rag",
    keywords: [
      "retrieval augmented generation", "rag", "chunking", "embedding", "vector database",
      "pgvector", "hybrid search", "bm25", "re-ranking", "recall", "precision",
      "grounding", "citations", "evaluation harness",
    ],
  },
  {
    key: "mas",
    label: "Multi-Agent Systems",
    title: "Building Multi-Agent Systems",
    summary:
      "MAS taxonomy, coordination topologies, FIPA ACL, contract net, ROS 2/DDS, MQTT, gRPC, swarms and reference designs.",
    topics: ["AI", "Architecture"],
    docKey: "multi-agent-systems",
    keywords: [
      "multi agent", "mas", "swarm", "bdi", "reactive agent", "deliberative", "blackboard",
      "broker", "contract net", "fipa acl", "ros 2", "dds", "mqtt", "grpc", "marl",
      "negotiation", "coordination", "warehouse robots", "marketplace",
    ],
  },
  {
    key: "vector",
    label: "Vector Search",
    title: "Vector Search — Beginner to Production",
    summary:
      "Embeddings, similarity metrics, ANN indexes (Flat/IVF/HNSW/PQ), FAISS and Milvus, hybrid retrieval, reranking, evaluation and cost control.",
    topics: ["AI", "Architecture"],
    docKey: "vector-search",
    keywords: [
      "vector search", "embedding", "cosine similarity", "dot product", "euclidean",
      "approximate nearest neighbor", "ann", "faiss", "annoy", "hnswlib", "hnsw", "ivf",
      "product quantization", "pq", "milvus", "weaviate", "pinecone", "vespa",
      "recall@k", "ndcg", "mrr", "hybrid search", "bm25", "reranking", "cross encoder",
      "sentence transformers", "semantic search", "index freshness", "normalization",
    ],
  },
];

export type RepoDoc = {
  key: string;
  title: string;
  description: string;
  category: string;
  topics: LearnTopic[];
};

export const REPO_DOCS: RepoDoc[] = [
  { key: "ai-beginner", title: "Comprehensive Beginner Guide to AI & AI Agents", description: "A ground-up introduction to Artificial Intelligence and modern AI Agents — concepts, architectures, tooling, and real-world use cases.", category: "AI / Beginner", topics: ["AI"] },
  { key: "intro-cloud", title: "Intro to Cloud & Basic Concepts of Cloud", description: "Foundations of cloud computing: service models (IaaS/PaaS/SaaS), deployment models, architecture patterns, and cost basics.", category: "Cloud / Foundations", topics: ["Cloud"] },
  { key: "saas-tutorial", title: "Comprehensive SaaS Tutorial & Architecture Report", description: "End-to-end SaaS blueprint — multi-tenancy, pricing, security, observability, and architecture decisions for production platforms.", category: "SaaS / Architecture", topics: ["SaaS", "Architecture"] },
  { key: "enterprise-brief", title: "The Intelligent Enterprise Brief — July 2026", description: "Executive brief on the shift from AI experiments to governed enterprise agents across BFSI, retail, shipping, supply chain, and telecom.", category: "Executive Brief", topics: ["Executive", "AI"] },
  { key: "llm", title: "Large Language Models — Foundations & Practice", description: "Comprehensive guide to LLM architectures, training, prompting, evaluation, and production deployment.", category: "AI / LLM", topics: ["AI"] },
  { key: "rag", title: "Building & Deploying RAG Systems", description: "End-to-end blueprint for Retrieval-Augmented Generation: chunking, embeddings, vector stores, retrievers, evaluation.", category: "AI / RAG", topics: ["AI"] },
  { key: "retail", title: "Generative AI in Retail Supply Chains", description: "White paper on applying GenAI across demand forecasting, merchandising, logistics, and store operations.", category: "Retail / Supply Chain", topics: ["Retail"] },
  { key: "itil", title: "Implementing ITIL with Kanban", description: "Incident, Change, Problem, and Service Request Management using Kanban — flow, WIP limits, SLAs, and governance.", category: "IT Service Management", topics: ["ITSM"] },
  { key: "executive-summary", title: "Executive Summary — The Intelligent Enterprise", description: "Executive brief on AI agents, cloud platforms, and industry-specific AI adoption across BFSI, retail, and telecom.", category: "Executive Brief", topics: ["Executive"] },
  { key: "vector-search", title: "Vector Search — A Beginner-to-Production Learning Report", description: "Embeddings, similarity metrics, ANN indexes (Flat/IVF/HNSW/PQ), FAISS, Annoy, HNSWlib, Milvus, hybrid retrieval, reranking, evaluation, cost and production operations.", category: "AI / Retrieval", topics: ["AI", "Architecture"] },
  { key: "multi-agent-systems", title: "Building Multi-Agent Systems", description: "Engineering report on MAS architecture — coordination topologies, FIPA ACL, ROS 2/DDS, MQTT, gRPC, frameworks, simulation, security, benchmarks, and reference designs.", category: "AI / Multi-Agent Systems", topics: ["AI", "Architecture"] },
];

export const LEARN_TOPICS: LearnTopic[] = [
  "AI",
  "Cloud",
  "SaaS",
  "Architecture",
  "ITSM",
  "Retail",
  "Executive",
];

export type SearchHit =
  | { kind: "module"; key: string; title: string; snippet: string; topics: LearnTopic[]; badge: string; score: number }
  | { kind: "doc"; key: string; title: string; snippet: string; topics: LearnTopic[]; badge: string; score: number };

function scoreText(haystack: string, terms: string[]): number {
  let score = 0;
  for (const t of terms) {
    if (!t) continue;
    const idx = haystack.indexOf(t);
    if (idx === -1) return 0;
    score += idx < 80 ? 3 : 1;
  }
  return score;
}

/** Full-text search across Learn modules and repository documents. */
export function searchLearn(query: string, topic: LearnTopic | "all" = "all"): SearchHit[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const hits: SearchHit[] = [];

  for (const m of LEARN_MODULES) {
    if (topic !== "all" && !m.topics.includes(topic)) continue;
    const blob = [m.title, m.label, m.summary, ...m.keywords, ...m.topics].join(" ").toLowerCase();
    const score = terms.length === 0 ? 1 : scoreText(blob, terms);
    if (score === 0) continue;
    hits.push({ kind: "module", key: m.key, title: m.title, snippet: m.summary, topics: m.topics, badge: "Learn module", score: score + 2 });
  }

  for (const d of REPO_DOCS) {
    if (topic !== "all" && !d.topics.includes(topic)) continue;
    const blob = [d.title, d.description, d.category, ...d.topics].join(" ").toLowerCase();
    const score = terms.length === 0 ? 1 : scoreText(blob, terms);
    if (score === 0) continue;
    hits.push({ kind: "doc", key: d.key, title: d.title, snippet: d.description, topics: d.topics, badge: d.category, score });
  }

  return hits.sort((a, b) => b.score - a.score);
}
