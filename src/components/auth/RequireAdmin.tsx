import { Navigate, useRouterState } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Section } from "@/components/layout/Section";

/**
 * Gate for admin-only surfaces (reports, blocked domains, spam audit,
 * security events, visitor tracking audit).
 *
 * This is UI defence only — every underlying read is additionally enforced
 * server-side (admin role check inside the server functions) and by RLS
 * policies restricted to the admin role. The `admin` role itself is granted
 * only to the single owner account by a database trigger.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" search={{ redirect: pathname, mode: "login" }} replace />;
  }

  if (!isAdmin) {
    return (
      <Section>
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-destructive" />
          <h1 className="text-lg font-semibold text-foreground">Restricted area</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This page is available to the site administrator only.
          </p>
        </div>
      </Section>
    );
  }

  return <>{children}</>;
}
