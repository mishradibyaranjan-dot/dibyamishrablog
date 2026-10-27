// Pure job-platform rules: freshness, timestamps, seniority, categories, URL safety.
// Shared by the sync worker, server functions and tests.

export const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Parse an original posting time. Returns null when missing, unparseable or lacking a timezone. */
export function parsePostedAt(input: unknown): Date | null {
  if (input == null || input === "") return null;
  if (typeof input === "number") {
    const ms = input < 1e12 ? input * 1000 : input; // seconds vs milliseconds epoch
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof input !== "string") return null;
  const s = input.trim();
  // Date-only values cannot prove the posting fell inside the freshness window.
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  // Require an explicit timezone (Z or ±hh:mm) so we never guess.
  if (!/(Z|[+-]\d{2}:?\d{2})$/i.test(s)) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** True when posted within the last 7 days (exclusive at exactly 7 days) and not in the future. */
export function isFresh(postedAt: Date, now: Date = new Date()): boolean {
  const age = now.getTime() - postedAt.getTime();
  return age >= 0 && age < MAX_AGE_MS;
}

export function expiresAt(postedAt: Date, closesAt?: Date | null): Date {
  const limit = new Date(postedAt.getTime() + MAX_AGE_MS);
  return closesAt && closesAt < limit ? closesAt : limit;
}

export const CAREER_LEVELS = [
  "Intern", "Apprentice", "Fresher / Graduate", "Trainee", "Junior / Associate", "Intermediate",
  "Senior Individual Contributor", "Team Lead", "Manager", "Senior Manager", "Principal / Staff",
  "Architect", "Associate Director", "Director", "Senior Director", "Head of Department / General Manager",
  "Assistant Vice President", "Vice President", "Senior Vice President", "Executive Vice President",
  "Country Head / Managing Director", "CXO / C-Suite", "Chief Executive Officer / President",
] as const;
export type CareerLevel = (typeof CAREER_LEVELS)[number] | "unclassified";

// Ordered most-specific first; phrase patterns on word boundaries, not loose keywords.
const LEVEL_RULES: [RegExp, CareerLevel][] = [
  [/\b(chief executive officer|ceo)\b|^president\b/i, "Chief Executive Officer / President"],
  [/\bchief [a-z ]*officer\b|\b(cto|cfo|coo|cio|ciso|cmo|cpo|chro)\b/i, "CXO / C-Suite"],
  [/\b(country head|country manager|managing director)\b/i, "Country Head / Managing Director"],
  [/\b(executive vice president|evp)\b/i, "Executive Vice President"],
  [/\b(senior vice president|svp|sr\.? vice president)\b/i, "Senior Vice President"],
  [/\b(assistant vice president|avp)\b/i, "Assistant Vice President"],
  [/\b(vice president|vp)\b/i, "Vice President"],
  [/\b(general manager|head of)\b/i, "Head of Department / General Manager"],
  [/\b(senior director|sr\.? director)\b/i, "Senior Director"],
  [/\bassociate director\b/i, "Associate Director"],
  [/\bdirector\b/i, "Director"],
  [/\b(senior manager|sr\.? manager)\b/i, "Senior Manager"],
  [/\barchitect\b/i, "Architect"],
  [/\b(principal|staff)\b/i, "Principal / Staff"],
  [/\bmanager\b/i, "Manager"],
  [/\b(team lead|tech lead|lead)\b/i, "Team Lead"],
  [/\bintern(ship)?\b/i, "Intern"],
  [/\bapprentice(ship)?\b/i, "Apprentice"],
  [/\b(new grad|graduate|fresher|university grad|early career)\b/i, "Fresher / Graduate"],
  [/\btrainee\b/i, "Trainee"],
  [/\b(senior|sr\.?)\b/i, "Senior Individual Contributor"],
  [/\b(junior|jr\.?|associate|entry level)\b/i, "Junior / Associate"],
];

/** Classify from the employer's original title. Returns "unclassified" rather than guessing. */
export function classifyLevel(title: string): CareerLevel {
  // "Product Manager" is a role name, not people management: guard common IC titles.
  const t = title.replace(/\b(product|program|project|account|customer success) manager\b/i, (m) => `${m} ic`);
  for (const [re, level] of LEVEL_RULES) {
    if (re.test(t)) {
      if (level === "Manager" && /\b(product|program|project|account|customer success) manager ic\b/i.test(t)) {
        return /\b(senior|sr\.?)\b/i.test(t) ? "Senior Individual Contributor" : "Intermediate";
      }
      return level;
    }
  }
  return "unclassified";
}

export const CATEGORY_RULES: [string, RegExp][] = [
  ["AI/ML", /\b(machine learning|ml|ai|artificial intelligence|llm|data scientist|research scientist)\b/i],
  ["Software Engineering", /\b(software|engineer|developer|frontend|backend|full[- ]?stack|ios|android|sre)\b/i],
  ["Cloud", /\b(cloud|aws|azure|gcp|infrastructure)\b/i],
  ["DevOps", /\b(devops|platform engineer|site reliability|sre)\b/i],
  ["Cybersecurity", /\b(security|appsec|threat|abuse|fraud|trust & safety)\b/i],
  ["Data Engineering", /\bdata engineer/i],
  ["Analytics", /\b(analyst|analytics|business intelligence|bi)\b/i],
  ["Product Management", /\bproduct (manager|management|lead|owner)\b/i],
  ["Program Management", /\bprogram manag/i],
  ["Project Management", /\bproject manag/i],
  ["QA", /\b(qa|quality assurance|test engineer|sdet)\b/i],
  ["Architecture", /\barchitect/i],
  ["Design", /\b(designer|design|ux|ui)\b/i],
  ["Customer Success", /\b(customer success|support|solutions engineer|account manager)\b/i],
  ["Sales", /\b(sales|account executive|business development|bdr|sdr)\b/i],
  ["Marketing", /\b(marketing|growth|brand|content|seo)\b/i],
  ["Finance", /\b(finance|financial|fp&a|treasury|tax)\b/i],
  ["Accounting", /\b(accountant|accounting|controller)\b/i],
  ["HR", /\b(people|hr|human resources|hrbp)\b/i],
  ["Talent Acquisition", /\b(recruit|talent acquisition|sourcer)\b/i],
  ["Legal", /\b(legal|counsel|attorney|paralegal)\b/i],
  ["Compliance", /\b(compliance|risk|regulatory|audit)\b/i],
  ["Operations", /\b(operations|ops)\b/i],
  ["Executive Leadership", /\b(chief|vice president|vp|head of|director|general manager)\b/i],
  ["IT", /\b(information technology|it support|systems administrator)\b/i],
  ["Delivery Management", /\bdelivery (manager|management|director|head)\b/i],
  ["Technical Support", /\b(technical support|helpdesk|support engineer)\b/i],
  ["BFSI", /\b(banking|insurance|bfsi|financial services)\b/i],
  ["Supply Chain", /\bsupply chain\b/i],
  ["Logistics", /\blogistics\b/i],
  ["Shipping", /\b(shipping|maritime|freight)\b/i],
  ["Retail", /\bretail\b/i],
  ["E-commerce", /\b(e-commerce|ecommerce)\b/i],
  ["Consulting", /\b(consultant|consulting)\b/i],
  ["Manufacturing", /\b(manufacturing|production engineer)\b/i],
  ["Healthcare", /\b(healthcare|nurse|physician|clinical)\b/i],
  ["Education", /\b(education|teacher|professor|instructor)\b/i],
  ["General Management", /\b(general manager|managing director)\b/i],
];

export function classifyCategories(title: string, department?: string | null): string[] {
  const text = `${title} ${department ?? ""}`;
  const out = CATEGORY_RULES.filter(([, re]) => re.test(text)).map(([c]) => c);
  return out.length ? Array.from(new Set(out)) : ["General"];
}

export function classifyArrangement(text: string, isRemote?: boolean | null): "remote" | "hybrid" | "onsite" | "unspecified" {
  if (/\bhybrid\b/i.test(text)) return "hybrid";
  if (isRemote || /\bremote\b/i.test(text)) return "remote";
  if (/\b(on-?site|in office|in-office)\b/i.test(text)) return "onsite";
  return "unspecified";
}

const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?|metadata\.google\.internal)/i;
const SUSPICIOUS = /(bit\.ly|tinyurl|t\.me|wa\.me|whatsapp|telegram|paypal\.me|forms\.gle)/i;

/** Validate an outbound application URL: https, public host, not a shortener or payment page. */
export function checkApplyUrl(url: string): { ok: true } | { ok: false; reason: string } {
  let u: URL;
  try { u = new URL(url); } catch { return { ok: false, reason: "invalid_url" }; }
  if (u.protocol !== "https:") return { ok: false, reason: "not_https" };
  if (u.username || u.password || (u.port && u.port !== "443")) return { ok: false, reason: "unsafe_authority" };
  if (u.hostname.includes(":") || /^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)) return { ok: false, reason: "ip_literal" };
  if (PRIVATE_HOST.test(u.hostname)) return { ok: false, reason: "private_host" };
  if (SUSPICIOUS.test(u.hostname)) return { ok: false, reason: "suspicious_domain" };
  if (/\b(payment|pay-fee|registration-fee|deposit)\b/i.test(u.pathname)) return { ok: false, reason: "payment_page" };
  return { ok: true };
}

export function dedupeKey(company: string, title: string, location?: string | null): string {
  const n = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return `${n(company)}|${n(title)}|${n(location ?? "")}`;
}

export function slugify(...parts: string[]): string {
  return parts.join(" ").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
}

export function ageLabel(postedAt: Date, now: Date = new Date()): string {
  const mins = Math.max(0, Math.floor((now.getTime() - postedAt.getTime()) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  if (h < 48) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}
