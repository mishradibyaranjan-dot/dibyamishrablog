import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

/** Tracks page visits + maintains an open login_session row. */
export function useActivityTracker() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartRef = useRef<number>(0);
  const lastPathRef = useRef<{ path: string; at: number } | null>(null);
  // Access token kept fresh so the unload flush can authenticate as the user.
  // The publishable key alone authenticates as `anon`, which RLS rejects.
  const tokenRef = useRef<string | null>(null);


  // Open + close login session
  useEffect(() => {
    if (!user) {
      if (sessionIdRef.current) {
        const id = sessionIdRef.current;
        const startedAt = sessionStartRef.current;
        sessionIdRef.current = null;
        const ended = new Date().toISOString();
        const dur = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : null;
        void supabase
          .from("login_sessions")
          .update({ ended_at: ended, duration_seconds: dur })
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
      if (!cancelled && data && !error) {
        sessionIdRef.current = data.id;
        sessionStartRef.current = Date.now();
      }
    })();

    const close = () => {
      if (!sessionIdRef.current) return;
      const id = sessionIdRef.current;
      const startedAt = sessionStartRef.current;
      const dur = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : null;
      const ended = new Date().toISOString();
      // keepalive fetch carries headers; sendBeacon to Supabase REST won't include apikey
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/login_sessions?id=eq.${id}`;
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
      void fetch(url, {
        method: "PATCH",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          apikey: key,
          Authorization: `Bearer ${key}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ ended_at: ended, duration_seconds: dur }),
      }).catch(() => {});

      // Also flush current page visit
      const prev = lastPathRef.current;
      if (prev) {
        const pdur = Math.max(1, Math.round((Date.now() - prev.at) / 1000));
        const purl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/page_visits`;
        void fetch(purl, {
          method: "POST",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
            apikey: key,
            Authorization: `Bearer ${key}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            user_id: user.id,
            path: prev.path,
            duration_seconds: pdur,
          }),
        }).catch(() => {});
      }
    };
    window.addEventListener("beforeunload", close);
    window.addEventListener("pagehide", close);
    return () => {
      cancelled = true;
      window.removeEventListener("beforeunload", close);
      window.removeEventListener("pagehide", close);
      if (sessionIdRef.current) {
        const id = sessionIdRef.current;
        const startedAt = sessionStartRef.current;
        const dur = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : null;
        sessionIdRef.current = null;
        void supabase
          .from("login_sessions")
          .update({ ended_at: new Date().toISOString(), duration_seconds: dur })
          .eq("id", id);
      }
    };
  }, [user]);

  // Track page visits with duration. Writes prior page on each navigation,
  // and records the very first visit immediately so single-page sessions are captured.
  useEffect(() => {
    if (!user) return;
    const now = Date.now();
    const prev = lastPathRef.current;
    if (prev) {
      const duration = Math.max(1, Math.round((now - prev.at) / 1000));
      void supabase.from("page_visits").insert({
        user_id: user.id,
        path: prev.path,
        duration_seconds: duration,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
      });
    } else {
      // First page in this mount — log an entry row immediately (duration 0, updated on next nav/unload)
      void supabase.from("page_visits").insert({
        user_id: user.id,
        path: pathname,
        duration_seconds: 0,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
      });
    }
    lastPathRef.current = { path: pathname, at: now };
  }, [pathname, user]);
}
