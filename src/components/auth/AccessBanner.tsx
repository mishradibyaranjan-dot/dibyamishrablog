import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  LogIn,
  UserPlus,
  KeyRound,
  Brain,
  Cloud,
  Layers,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/cinematic/Reveal";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/access-hero.jpg";

type AccessEvent =
  | "banner_viewed"
  | "register_clicked"
  | "login_clicked"
  | "reset_clicked"
  | "protected_access_attempt";

/** Fire-and-forget tracking. Writes to user_activity when allowed by RLS; silent otherwise. */
function trackAccessEvent(event: AccessEvent, path?: string) {
  try {
    void supabase.from("user_activity").insert({
      activity_type: event,
      activity_data: { path: path ?? (typeof window !== "undefined" ? window.location.pathname : null) },
    });
  } catch {
    /* ignore */
  }
}

const PILLARS = [
  { icon: GraduationCap, label: "Learn" },
  { icon: Brain, label: "Research" },
  { icon: Layers, label: "Case Studies" },
  { icon: Cloud, label: "Projects" },
];

export function AccessBanner({
  variant = "page",
  path,
}: {
  /** "page" = full-bleed restricted-content overlay. "inline" = compact top-of-page strip. */
  variant?: "page" | "inline";
  path?: string;
}) {
  // Track view once on mount
  if (typeof window !== "undefined") {
    // microtask defer to avoid render-phase side effect noise
    queueMicrotask(() => trackAccessEvent("banner_viewed", path));
    if (variant === "page") queueMicrotask(() => trackAccessEvent("protected_access_attempt", path));
  }

  const onRegister = () => trackAccessEvent("register_clicked", path);
  const onLogin = () => trackAccessEvent("login_clicked", path);
  const onReset = () => trackAccessEvent("reset_clicked", path);

  if (variant === "inline") {
    return (
      <div className="relative z-10 border-b border-white/10 bg-background/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 text-xs sm:text-sm text-white/80">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand-gradient shadow-neon">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="truncate">
              <strong className="text-white">Unlock premium learning resources</strong>
              <span className="hidden sm:inline text-white/60"> — register or log in to access Learn, Research, Case Studies & Projects.</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button asChild size="sm" className="bg-brand-gradient text-white shadow-neon" onClick={onRegister}>
              <Link to="/auth" search={{ mode: "register" }}>
                <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Register
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={onLogin}>
              <Link to="/auth" search={{ mode: "login" }}>
                <LogIn className="mr-1.5 h-3.5 w-3.5" /> Login
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="text-white/75 hover:text-white" onClick={onReset}>
              <Link to="/forgot-password">
                <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Reset
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Section className="pt-20 lg:pt-28">
      <Reveal>
        <div className="card-flashy relative overflow-hidden rounded-3xl glass-strong p-6 shadow-glow sm:p-10 lg:p-14">
          {/* Animated aurora wash */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-aurora animate-aurora opacity-70" />
            <div
              className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-aurora animate-aurora opacity-60"
              style={{ animationDelay: "-9s", animationDuration: "26s" }}
            />
            <div className="absolute inset-0 grid-pattern opacity-20" />
          </div>

          {/* Floating particles */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
            {[...Array(14)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-neon-cyan/70 shadow-[0_0_8px_oklch(0.82_0.18_200/0.9)]"
                style={{ left: `${(i * 73) % 100}%`, top: `${(i * 41) % 100}%` }}
                animate={{ y: [0, -18, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              />
            ))}
          </div>

          <div className="relative z-[3] grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            {/* Copy */}
            <div className="min-w-0">
              <Badge className="w-fit bg-white/10 text-white hover:bg-white/15">
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Members-only access
              </Badge>
              <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Unlock <span className="text-gradient">Premium Learning</span> Resources
              </h1>
              <div className="mt-5 space-y-2 text-sm text-white/75 sm:text-base">
                <p>
                  To access the <strong className="text-white">Learn</strong>,{" "}
                  <strong className="text-white">Research</strong>,{" "}
                  <strong className="text-white">Case Studies</strong>, and{" "}
                  <strong className="text-white">Projects</strong> sections, please register and log in to your account.
                </p>
                <p>If you already have an account, simply log in.</p>
                <p>Forgotten your password? Reset it and sign in again.</p>
              </div>

              {/* Pillars */}
              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PILLARS.map(({ icon: Icon, label }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur"
                  >
                    <Icon className="h-4 w-4 text-neon-cyan" />
                    <span className="text-xs font-medium text-white/85">{label}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap gap-2.5">
                <Button asChild className="group bg-brand-gradient text-white shadow-neon" onClick={onRegister}>
                  <Link to="/auth" search={{ mode: "register" }}>
                    <UserPlus className="mr-2 h-4 w-4" /> Register Now
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={onLogin}>
                  <Link to="/auth" search={{ mode: "login" }}>
                    <LogIn className="mr-2 h-4 w-4" /> Login
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="text-white/80 hover:text-white" onClick={onReset}>
                  <Link to="/forgot-password">
                    <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                  </Link>
                </Button>
              </div>
            </div>

            {/* Floating hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-md"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-glow"
              >
                <img
                  src={heroImg}
                  alt="AI-powered learning, research, cloud and SaaS workspace"
                  width={1280}
                  height={896}
                  className="h-auto w-full"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/40 via-transparent to-transparent" />
              </motion.div>
              {/* Glow halo */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] opacity-70 blur-3xl"
                style={{ background: "var(--brand-gradient, linear-gradient(135deg,oklch(0.7 0.22 255/0.5),oklch(0.68 0.27 305/0.4)))" }}
              />
            </motion.div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
