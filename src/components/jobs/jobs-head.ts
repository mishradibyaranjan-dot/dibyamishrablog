import { DEFAULT_FILTERS } from "./JobsDirectory";
import type { JobFilters } from "@/lib/jobs/jobs.functions";
import { breadcrumbScript } from "@/lib/breadcrumbs";

const str = (v: unknown, max = 80) => (typeof v === "string" ? v.slice(0, max) : "");

export function parseJobSearch(s: Record<string, unknown>): JobFilters {
  const hours = Number(s.hours);
  const arr = str(s.arrangement);
  return {
    ...DEFAULT_FILTERS,
    q: str(s.q, 120), level: str(s.level, 60), category: str(s.category, 60), country: str(s.country, 60), company: str(s.company),
    arrangement: (["remote", "hybrid", "onsite"].includes(arr) ? arr : "") as JobFilters["arrangement"],
    hours: [1, 3, 6, 12, 24].includes(hours) ? hours : 24,
    page: Math.min(200, Math.max(1, Number(s.page) || 1)),
  };
}

export function jobsHead(path: string, title: string, description: string, crumbs: { name: string; path: string }[] = [], noindex = false) {
  const url = `https://www.dibyamishra.co.in${path}`;
  return {
    meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:url", content: url }, { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      ...(noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [breadcrumbScript([{ name: "Jobs", path: "/jobs" }, ...crumbs])],
  };
}
