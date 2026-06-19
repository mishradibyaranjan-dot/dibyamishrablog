import { useAuth } from "@/lib/auth";
import { Section } from "@/components/layout/Section";
import { AccessBanner } from "@/components/auth/AccessBanner";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Section className="pt-24">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-white/10" />
      </Section>
    );
  }

  if (user) return <>{children}</>;

  return (
    <div className="relative">
      <AccessBanner variant="page" />
      {/* Blurred preview of restricted content behind glass overlay */}
      <div aria-hidden className="pointer-events-none relative">
        <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 blur-sm">
            <div className="h-6 w-40 rounded bg-white/10" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="h-32 rounded-xl bg-white/10" />
              <div className="h-32 rounded-xl bg-white/10" />
              <div className="h-32 rounded-xl bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
