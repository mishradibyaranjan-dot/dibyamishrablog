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
        className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-7 shadow-glow backdrop-blur-xl sm:p-9"
      >
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Forgot password</h1>
        <p className="mt-2 text-sm text-white/65">
          Enter your email and we'll send a link to reset your password.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-white/15 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/40"
            />
          </div>
          {err && <p className="text-xs text-red-400">{err}</p>}
          {info && <p className="text-xs text-emerald-400">{info}</p>}
          <Button type="submit" disabled={busy} className="w-full bg-brand-gradient text-white shadow-neon">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
          </Button>
        </form>
        <p className="mt-5 text-center text-xs text-white/55">
          <Link to="/auth" className="hover:text-white">Back to sign in</Link>
        </p>
      </motion.div>
    </Section>
  );
}
