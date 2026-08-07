import { posts, projects, caseStudies, categories } from "@/lib/content";
import { LEARN_MODULES } from "@/lib/learn-catalog";
import { tagsFor } from "@/lib/post-meta";

export type SearchSection =
  | "Research"
  | "Case Studies"
  | "Projects"
  | "Expertise"
  | "Learn";

export type GlobalHit = {
  id: string;
  title: string;
  description: string;
  section: SearchSection;
  /** Typed route path, e.g. "/blog/$slug" */
  to: string;
  params?: Record<string, string>;
  hash?: string;
  keywords: string[];
};

const EXPERTISE_BLURBS: Record<string, string> = {
  "AI & Agentic AI": "GenAI platforms, agent architectures, RAG, MLOps and AI governance.",
  "Cloud & DevSecOps": "Cloud-native architecture on AWS, Azure and GCP with paved-road CI/CD.",
  "SaaS Platforms": "Multi-tenant SaaS design, cell-based delivery and platform engineering.",
  "Data & Analytics": "Lakehouse, semantic layers, governed BI and AI-ready data products.",
  "BFSI & Payments": "Payment engines, merchant onboarding and regulated delivery.",
  "Engineering Leadership": "Org design, operating rhythms, OKRs and delivery predictability.",
};

/** Flat, client-side index across every public content surface. */
export const searchIndex: GlobalHit[] = [
  ...posts.map<GlobalHit>((p) => ({
    id: `post-${p.slug}`,
    title: p.title,
    description: p.summary,
    section: "Research",
    to: "/blog/$slug",
    params: { slug: p.slug },
    keywords: [p.category, ...tagsFor(p)],
  })),
  ...caseStudies.map<GlobalHit>((c) => ({
    id: `case-${c.slug}`,
    title: c.title,
    description: c.challenge,
    section: "Case Studies",
    to: "/case-studies",
    hash: c.slug,
    keywords: [c.area, ...c.stack],
  })),
  ...projects.map<GlobalHit>((pr) => ({
    id: `project-${pr.slug}`,
    title: pr.name,
    description: pr.problem,
    section: "Projects",
    to: "/projects",
    hash: pr.slug,
    keywords: [pr.area, ...pr.tech],
  })),
  ...categories.map<GlobalHit>((c) => ({
    id: `expertise-${c}`,
    title: c,
    description: EXPERTISE_BLURBS[c] ?? "Capability area and engagement models.",
    section: "Expertise",
    to: "/expertise",
    keywords: ["expertise", "capability", c],
  })),
  ...LEARN_MODULES.map<GlobalHit>((m) => ({
    id: `learn-${m.key}`,
    title: m.title,
    description: m.summary,
    section: "Learn",
    to: "/learn",
    keywords: ["learn", ...m.topics, ...m.keywords],
  })),
];

export const SEARCH_SECTIONS: SearchSection[] = [
  "Research",
  "Case Studies",
  "Projects",
  "Expertise",
  "Learn",
];

/** Rank hits by term coverage across title, description and keywords. */
export function searchAll(query: string, limit = 24): GlobalHit[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const scored: Array<{ hit: GlobalHit; score: number }> = [];

  for (const hit of searchIndex) {
    const title = hit.title.toLowerCase();
    const blob = `${title} ${hit.description} ${hit.keywords.join(" ")}`.toLowerCase();
    let score = 0;
    let matchedAll = true;
    for (const t of terms) {
      if (title.includes(t)) score += 5;
      else if (blob.includes(t)) score += 2;
      else matchedAll = false;
    }
    if (!matchedAll || score === 0) continue;
    scored.push({ hit, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.hit.title.localeCompare(b.hit.title))
    .slice(0, limit)
    .map((s) => s.hit);
}
