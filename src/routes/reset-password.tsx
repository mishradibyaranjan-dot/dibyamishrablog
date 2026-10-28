import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { z } from "zod";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Dibya Ranjan Mishra" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Choose a new password for your Dibya Mishra account." },
      { property: "og:title", content: "Reset Password — Dibya Ranjan Mishra" },
      { property: "og:description", content: "Choose a new password for your Dibya Mishra account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase will set the session from the recovery hash automatically
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const parsed = z.string().min(8, "Min 8 chars").max(128).safeParse(pw);
    if (!parsed.success) return setErr(parsed.error.issues[0].message);
    if (pw !== pw2) return setErr("Passwords do not match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setBusy(false);
    if (error) setErr(error.message);
    else navigate({ to: "/learn" });
  };

  return (
    <Section className="pt-20 lg:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-panel mx-auto w-full max-w-md rounded-lg border border-border bg-card p-7 shadow-card-soft sm:p-9"
      >
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Set a new password</h1>
        {!ready && (
          <p className="mt-2 text-sm text-muted-foreground">Waiting for recovery link to be processed...</p>
        )}
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <PwField value={pw} onChange={setPw} placeholder="New password" />
          <PwField value={pw2} onChange={setPw2} placeholder="Confirm new password" />
          {err && <p className="text-xs text-destructive">{err}</p>}
          <Button type="submit" disabled={busy || !ready} className="w-full bg-primary text-primary-foreground">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
          </Button>
        </form>
      </motion.div>
    </Section>
  );
}

function PwField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        aria-label={placeholder}
        type="password"
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </div>
  );
}
