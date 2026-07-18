import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  isBlockedEmail,
  refreshBlockedDomains,
  BLOCKED_EMAIL_MESSAGE,
} from "@/lib/blocked-domains";
import { logBlockedLoginAttempt } from "@/lib/spam-audit.functions";

/**
 * Site-wide guard: signs out any authenticated user whose email domain is on
 * the spam blocklist and blocks access to all pages with a full-screen notice.
 */
export function SpamDomainGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user?.email) {
      setBlocked(false);
      return;
    }
    (async () => {
      await refreshBlockedDomains();
      if (cancelled) return;
      if (isBlockedEmail(user.email!)) {
        setBlocked(true);
        void logBlockedLoginAttempt({
          data: { email: user.email!, reason: "active session sign-out: domain on blocklist" },
        });
        try {
          await supabase.auth.signOut();
        } catch {
          /* ignore */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  if (blocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Access blocked</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {BLOCKED_EMAIL_MESSAGE} If you believe this is a mistake, contact the site owner.
          </p>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/";
            }}
            className="mt-6 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Reload
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
