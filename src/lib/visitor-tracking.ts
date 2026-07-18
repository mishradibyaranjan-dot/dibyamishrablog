import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const VISITOR_KEY = "drm_visitor_id";
const SESSION_KEY = "drm_session_id";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getVisitorId() {
  try {
    let v = localStorage.getItem(VISITOR_KEY);
    if (!v) {
      v = uid();
      localStorage.setItem(VISITOR_KEY, v);
    }
    return v;
  } catch {
    return uid();
  }
}

function getSessionId() {
  try {
    let isNew = false;
    let s = sessionStorage.getItem(SESSION_KEY);
    if (!s) {
      s = uid();
      sessionStorage.setItem(SESSION_KEY, s);
      isNew = true;
    }
    return { sessionId: s, isNew };
  } catch {
    return { sessionId: uid(), isNew: true };
  }
}

function readUtm(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const p = new URLSearchParams(window.location.search);
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
      const v = p.get(k);
      if (v) out[k] = v;
    }
  } catch {
    // no-op
  }
  return out;
}

export function useVisitorTracker() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lastRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (lastRef.current === pathname) return;
    lastRef.current = pathname;

    const visitorId = getVisitorId();
    const { sessionId, isNew } = getSessionId();
    const utm = readUtm();

    const payload = {
      visitorId,
      sessionId,
      isNewSession: isNew,
      userId: user?.id ?? null,
      path: pathname,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${window.screen?.width}x${window.screen?.height}`,
      ...utm,
    };

    try {
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/public/track-visit", blob);
      } else {
        void fetch("/api/public/track-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        });
      }
    } catch {
      // ignore
    }
  }, [pathname, user?.id]);
}
