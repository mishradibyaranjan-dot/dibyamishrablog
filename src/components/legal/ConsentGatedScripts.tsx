import { useEffect } from "react";
import { useCookieConsent } from "@/lib/cookie-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

const GA_ID = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY'] as
  | string
  | undefined;

const SCRIPT_ATTR = "data-consent-script";

function loadOnce(id: string, src: string) {
  if (document.querySelector(`script[${SCRIPT_ATTR}="${id}"]`)) return;
  const el = document.createElement("script");
  el.async = true;
  el.src = src;
  el.setAttribute(SCRIPT_ATTR, id);
  document.head.appendChild(el);
}

/**
 * Loads third-party/analytics scripts ONLY after the visitor accepts the
 * matching cookie category. Nothing is injected before consent, and consent
 * withdrawal disables collection immediately (full teardown on next load).
 */
export function ConsentGatedScripts() {
  const { hydrated, prefs } = useCookieConsent();

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    if (!prefs.analytics) {
      // Withdrawn or never granted: hard-disable any previously loaded tag.
      if (GA_ID) window[`ga-disable-${GA_ID}`] = true;
      return;
    }

    if (GA_ID) {
      window[`ga-disable-${GA_ID}`] = false;
      loadOnce("ga4", `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
      window.dataLayer = window.dataLayer ?? [];
      const gtag = (...args: unknown[]) => window.dataLayer!.push(args);
      gtag("js", new Date());
      gtag("config", GA_ID, { anonymize_ip: true });
    }
  }, [hydrated, prefs.analytics]);

  return null;
}
