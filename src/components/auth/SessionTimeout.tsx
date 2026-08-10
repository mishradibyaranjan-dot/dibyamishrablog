import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

/**
 * Session lifecycle enforcement (client-side UX layer).
 *
 * - Idle timeout: 30 min for standard users, 15 min for administrators.
 * - Absolute lifetime: 8 hours from first observed sign-in, regardless of activity.
 * - 2 minute warning with an explicit "Stay signed in" interaction; only real
 *   user gestures extend the idle window (background polling cannot).
 * - On expiry the query cache is cancelled + cleared, the Supabase session is
 *   revoked, and the user is sent to /auth with history REPLACE so Back cannot
 *   restore protected content.
 *
 * This is defence in depth only: every protected read/write is independently
 * enforced server-side (auth middleware + admin role checks) and by RLS.
 */

const IDLE_MS_STANDARD = 30 * 60 * 1000;
const IDLE_MS_ADMIN = 15 * 60 * 1000;
const ABSOLUTE_MS = 8 * 60 * 60 * 1000;
const WARN_MS = 2 * 60 * 1000;
const START_KEY = "drm-session-start";

export function SessionTimeout() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [remaining, setRemaining] = useState<number | null>(null);
  const lastActivity = useRef(Date.now());
  const endingRef = useRef(false);

  const idleMs = isAdmin ? IDLE_MS_ADMIN : IDLE_MS_STANDARD;

  const endSession = useCallback(
    async (_reason: "idle" | "absolute") => {
      if (endingRef.current) return;
      endingRef.current = true;
      setRemaining(null);
      try {
        window.localStorage.removeItem(START_KEY);
        await queryClient.cancelQueries();
        queryClient.clear();
        await supabase.auth.signOut();
      } catch {
        /* fail closed: navigate away regardless */
      }
      navigate({
        to: "/auth",
        search: { redirect: "/", mode: "login" },
        replace: true,
      });
    },
    [navigate, queryClient],
  );

  // Record the absolute-lifetime anchor once per session.
  useEffect(() => {
    if (!user) {
      endingRef.current = false;
      setRemaining(null);
      window.localStorage.removeItem(START_KEY);
      return;
    }
    if (!window.localStorage.getItem(START_KEY)) {
      window.localStorage.setItem(START_KEY, String(Date.now()));
    }
    lastActivity.current = Date.now();
  }, [user]);

  // Activity listeners — genuine user gestures only.
  useEffect(() => {
    if (!user) return;
    const bump = () => {
      lastActivity.current = Date.now();
    };
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, bump));
  }, [user]);

  // Tick.
  useEffect(() => {
    if (!user) return;
    const id = window.setInterval(() => {
      const started = Number(window.localStorage.getItem(START_KEY) ?? Date.now());
      if (Date.now() - started >= ABSOLUTE_MS) {
        void endSession("absolute");
        return;
      }
      const idleFor = Date.now() - lastActivity.current;
      if (idleFor >= idleMs) {
        void endSession("idle");
        return;
      }
      const left = idleMs - idleFor;
      setRemaining(left <= WARN_MS ? left : null);
    }, 1000);
    return () => window.clearInterval(id);
  }, [user, idleMs, endSession]);

  if (!user || remaining === null) return null;

  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);

  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      className="fixed inset-x-0 bottom-4 z-[70] mx-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-card p-5 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            Your session will expire due to inactivity.
          </p>
          <p className="mt-1 font-mono text-lg text-muted-foreground">
            {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                lastActivity.current = Date.now();
                setRemaining(null);
              }}
            >
              Stay signed in
            </Button>
            <Button size="sm" variant="outline" onClick={() => void endSession("idle")}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
