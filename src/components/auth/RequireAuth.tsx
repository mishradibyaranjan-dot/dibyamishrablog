import { Link } from "@tanstack/react-router";
import { Lock, LogIn, UserPlus, KeyRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/Section";

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
    <Section className="pt-20 lg:pt-28">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-glow backdrop-blur-xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-neon">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-bold text-white sm:text-3xl">
          Members-only content
        </h2>
        <p className="mt-3 text-sm text-white/70 sm:text-base">
          Please register or log in to access this content.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Button asChild className="bg-brand-gradient text-white shadow-neon">
            <Link to="/auth" search={{ mode: "login" }}>
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
            <Link to="/auth" search={{ mode: "register" }}>
              <UserPlus className="mr-2 h-4 w-4" /> Register
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-white/75 hover:text-white">
            <Link to="/forgot-password">
              <KeyRound className="mr-2 h-4 w-4" /> Forgot password
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
