/**
 * Privacy-first, consent-gated analytics event tracking.
 *
 * Events are only recorded when the visitor has explicitly opted in to the
 * "analytics" cookie category (see src/lib/cookie-consent.ts). When consent is
 * granted, events are pushed to `window.dataLayer` (GA4 / Google Tag Manager
 * ready) and forwarded to `gtag` when present. No personal data, identifiers,
 * or query parameters are ever included — only the event name, coarse page
 * path and UTM campaign parameters.
 */
import { hasConsent } from "@/lib/cookie-consent";

/** Events tracked across the site (GA4/GTM-ready names). */
export type AnalyticsEventName =
  | "page_view"
  | "hero_cta_click"
  | "case_study_view"
  | "project_view"
  | "research_view"
  | "learning_view"
  | "advisory_view"
  | "advisory_cta_click"
  | "newsletter_signup"
  | "playbook_download"
  | "contact_submit"
  | "calendar_click"
  | "linkedin_click"
  | "github_click"
  | "search_query"
  | "ai_assistant_open"
  | "ai_assistant_question";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

let utmCache: Record<string, string> | null = null;

/** Read UTM campaign parameters once per page load; kept in memory only. */
function utmParams(): Record<string, string> {
  if (utmCache) return utmCache;
  const out: Record<string, string> = {};
  try {
    const params = new URLSearchParams(window.location.search);
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) out[key] = value.slice(0, 120);
    }
  } catch {
    /* ignore */
  }
  utmCache = out;
  return out;
}

type DataLayerWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

/**
 * Record an analytics event. No-op during SSR and when the visitor has not
 * consented to analytics. Never include personal data in `params`.
 */
export function trackEvent(
  event: AnalyticsEventName,
  params: Record<string, string | number | boolean> = {},
): void {
  if (typeof window === "undefined") return;
  if (!hasConsent("analytics")) return;
  try {
    const w = window as DataLayerWindow;
    w.dataLayer = w.dataLayer ?? [];
    const payload = {
      event,
      ...utmParams(),
      ...params,
      page_path: window.location.pathname,
    };
    w.dataLayer.push(payload);
    w.gtag?.("event", event, payload);
  } catch {
    /* analytics must never break the page */
  }
}
