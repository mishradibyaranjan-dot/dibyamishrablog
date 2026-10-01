/** Presentation helpers shared by newsletter archive, article and home card. */

export type IssueExtras = { subtitle?: string; categories?: string[]; author?: string };

/** Editorial metadata not stored in the issues table, keyed by slug. */
export const issueExtras: Record<string, IssueExtras> = {
  "intelligent-enterprise-brief-october-2026": {
    subtitle: "Building the Governed Agentic Enterprise",
    author: "Dibya Ranjan Mishra",
    categories: [
      "GenAI",
      "Agentic AI",
      "Cloud",
      "Enterprise Architecture",
      "BFSI",
      "Retail",
      "Shipping",
      "Supply Chain",
      "Telecom",
    ],
  },
};

export function readingMinutes(text: string | null | undefined): number {
  const words = (text ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function slugifyHeading(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export function extractHeadings(markdown: string): { id: string; title: string }[] {
  return markdown
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => {
      const title = l.replace(/^##\s+/, "").trim();
      return { id: slugifyHeading(title), title };
    });
}
