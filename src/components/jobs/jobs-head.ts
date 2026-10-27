import { DEFAULT_FILTERS } from "./JobsDirectory";
import type { JobFilters } from "@/lib/jobs/jobs.functions";
import { breadcrumbScript } from "@/lib/breadcrumbs";

const str = (v: unknown, max = 80) => (typeof v === "string" ? v.slice(0, max) : "");

/** Returns only non-default params so links to /jobs need no search object. */
export function parseJobSearch(s: Record<string, unknown>): Partial<JobFilters> {
  const full = parseFull(s);
  const out: Partial<JobFilters> = {};
  for (const k of Object.keys(full) as (keyof JobFilters)[]) if (full[k] !== DEFAULT_FILTERS[k]) (out as any)[k] = full[k];
  return out;
}

function parseFull(s: Record<string, unknown>): JobFilters {
  const hours = Number(s.hours);
  const arr = str(s.arrangement);
  return {
    ...DEFAULT_FILTERS,
    q: str(s.q, 120), level: str(s.level, 60), category: str(s.category, 60), country: str(s.country, 60), company: str(s.company),
    city: str(s.city), region: str(s.region), skill: str(s.skill), industry: str(s.industry), employment: str(s.employment,60), source: str(s.source), currency: str(s.currency,3),
    salary: Math.min(1e9, Math.max(0, Number(s.salary) || 0)), experience: Math.min(80, Math.max(0, Number(s.experience) || 0)), checked: [15,30].includes(Number(s.checked)) ? Number(s.checked) : 0,
    arrangement: (["remote", "hybrid", "onsite"].includes(arr) ? arr : "") as JobFilters["arrangement"],
    hours: [1, 3, 6, 12, 24, 168].includes(hours) ? hours : 168,
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
