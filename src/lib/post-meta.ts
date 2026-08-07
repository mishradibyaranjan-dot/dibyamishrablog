import { posts, type Post } from "@/lib/content";

/**
 * Editorial tags per article. Tags are finer-grained than the six top-level
 * categories and drive the tag filter chips on /research.
 */
export const postTags: Record<string, string[]> = {
  "model-context-protocol-mcp-servers": ["MCP", "Agents", "Integration", "Governance"],
  "what-is-agentic-ai": ["Agentic AI", "Retail", "Supply Chain", "Guardrails"],
  "how-to-build-an-ai-agent": ["Agents", "Architecture", "Evaluation", "Tooling"],
  "agentic-ai-enterprise-automation": ["Agentic AI", "Automation", "ROI", "Governance"],
  "scalable-rag-enterprise": ["RAG", "Retrieval", "Evaluation", "Architecture"],
  "cloud-native-saas-patterns": ["Multi-tenancy", "Kubernetes", "Platform Engineering"],
  "engineering-leadership-global-teams": ["Leadership", "Operating Model", "Culture"],
  "ai-delivery-predictability": ["DORA", "Flow Metrics", "Forecasting", "Leadership"],
  "payments-platform-modernization": ["Payments", "Reliability", "Onboarding", "BFSI"],
  "data-platform-bi-at-scale": ["Data Platform", "Semantic Layer", "Governance", "BI"],
};

export function tagsFor(post: Pick<Post, "slug" | "category">): string[] {
  return postTags[post.slug] ?? [post.category];
}

/** Every tag in use, alphabetically sorted. */
export const allTags: string[] = Array.from(
  new Set(posts.flatMap((p) => tagsFor(p))),
).sort((a, b) => a.localeCompare(b));

export type ReadingStats = { words: number; minutes: number; label: string };

/** Estimated reading length derived from the article body (~220 wpm). */
export function readingStats(post: Post): ReadingStats {
  const text = [post.summary, post.content, ...(post.takeaways ?? [])].join(" ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const declared = Number.parseInt(post.readingTime, 10);
  const minutes = Number.isFinite(declared) && declared > 0
    ? declared
    : Math.max(1, Math.round(words / 220));
  return { words, minutes, label: `${minutes} min read` };
}
