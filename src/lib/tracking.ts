import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

/** Tracks page visits + maintains an open login_session row. */
export function useActivityTracker() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sessionIdRef = useRef<string | null>(null);
  const lastPathRef = useRef<{ path: string; at: number } | null>(null);

  // Open + close login session
  useEffect(() => {
    if (!user) {
      // close prior session if it exists
      if (sessionIdRef.current) {
        const id = sessionIdRef.current;
        sessionIdRef.current = null;
        supabase
          .from("login_sessions")
          .update({ ended_at: new Date().toISOString() })
          .eq("id", id);
      }
      return;
    }

    let cancelled = false;
    (async () => {
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : null;
      const { data, error } = await supabase
        .from("login_sessions")
        .insert({ user_id: user.id, user_agent: ua })
        .select("id")
        .single();
      if (!cancelled && data && !error) sessionIdRef.current = data.id;
    })();

    const close = () => {
      if (!sessionIdRef.current) return;
      const id = sessionIdRef.current;
      const startedAt = Date.now();
      const payload = JSON.stringify({ ended_at: new Date().toISOString() });
      // Best-effort during unload
      try {
        navigator.sendBeacon?.(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/login_sessions?id=eq.${id}`,
          new Blob([payload], { type: "application/json" }),
        );
      } catch {
        // ignore
      }
      void startedAt;
    };
    window.addEventListener("beforeunload", close);
    return () => {
      cancelled = true;
      window.removeEventListener("beforeunload", close);
      if (sessionIdRef.current) {
        const id = sessionIdRef.current;
        sessionIdRef.current = null;
        supabase.from("login_sessions").update({ ended_at: new Date().toISOString() }).eq("id", id);
      }
    };
  }, [user]);

  // Track page visits with duration
  useEffect(() => {
    if (!user) return;
    const now = Date.now();
    const prev = lastPathRef.current;
    if (prev) {
      const duration = Math.round((now - prev.at) / 1000);
      supabase.from("page_visits").insert({
        user_id: user.id,
        path: prev.path,
        duration_seconds: duration,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
      });
    }
    lastPathRef.current = { path: pathname, at: now };
  }, [pathname, user]);
}
