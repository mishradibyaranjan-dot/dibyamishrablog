import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2 } from "lucide-react";
import { z } from "zod";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Dibya Ranjan Mishra" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Request a password reset for your Dibya Mishra account." },
      { property: "og:title", content: "Forgot Password — Dibya Ranjan Mishra" },
      { property: "og:description", content: "Request a password reset for your Dibya Mishra account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    const parsed = z.string().trim().email().safeParse(email);
    if (!parsed.success) {
      setErr("Enter a valid email");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setInfo("Password reset email sent — check your inbox.");
  };

  return (
    <Section className="pt-20 lg:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-panel mx-auto w-full max-w-md rounded-lg border border-border bg-card p-7 shadow-card-soft sm:p-9"
      >
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Forgot password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we'll send a link to reset your password.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              aria-label="Email address"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-input bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
          {info && <p className="text-xs text-success">{info}</p>}
          <Button type="submit" disabled={busy} className="w-full bg-primary text-primary-foreground">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
          </Button>
        </form>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          <Link to="/auth" className="hover:text-foreground">Back to sign in</Link>
        </p>
      </motion.div>
    </Section>
  );
}
