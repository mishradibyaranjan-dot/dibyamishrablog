import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";

const authSearchSchema = z.object({
  mode: z.enum(["login", "register"]).optional(),
  redirect: z.string().regex(/^\/[^/]/).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: authSearchSchema,
  head: () => ({
    meta: [
      { title: "Sign In or Register — Dibya Ranjan Mishra" },
      { name: "description", content: "Sign in or create your account to access the learning library, research, projects, and case studies." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: redirect ?? "/learn" });
    }
  }, [user, loading, navigate, redirect]);

  return (
    <Section className="pt-20 lg:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9"
      >
        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Welcome</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in or create an account to unlock the Learn library, research, projects, and case studies.
        </p>

        <Tabs defaultValue={mode === "register" ? "register" : "login"} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-5">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register" className="mt-5">
            <RegisterForm />
          </TabsContent>
        </Tabs>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-slate-600">
          <span className="h-px flex-1 bg-slate-200" />
          or
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <SocialButtons />

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link to="/forgot-password" className="hover:text-slate-900">Forgot your password?</Link>
        </p>
      </motion.div>
    </Section>
  );
}


const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(8, "Min 8 characters").max(128);

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const parsed = z.object({ email: emailSchema, password: passwordSchema }).safeParse({ email, password });
    if (!parsed.success) {
      setErr(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    setBusy(false);
    if (error) {
      setErr(error.message);
      supabase.from("failed_login_attempts").insert({ email: parsed.data.email, reason: error.message });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field icon={<Mail className="h-4 w-4" />} value={email} onChange={setEmail} type="email" placeholder="you@example.com" autoComplete="email" />
      <Field icon={<Lock className="h-4 w-4" />} value={password} onChange={setPassword} type="password" placeholder="Password" autoComplete="current-password" />
      {err && <p className="text-xs text-red-400">{err}</p>}
      <Button type="submit" disabled={busy} className="w-full bg-brand-gradient text-white shadow-neon">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    const parsed = z
      .object({
        name: z.string().trim().min(1, "Name required").max(80),
        email: emailSchema,
        password: passwordSchema,
      })
      .safeParse({ name, email, password });
    if (!parsed.success) {
      setErr(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: parsed.data.name },
      },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setInfo("Account created. If email confirmation is enabled, check your inbox.");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field icon={<UserIcon className="h-4 w-4" />} value={name} onChange={setName} placeholder="Full name" autoComplete="name" />
      <Field icon={<Mail className="h-4 w-4" />} value={email} onChange={setEmail} type="email" placeholder="you@example.com" autoComplete="email" />
      <Field icon={<Lock className="h-4 w-4" />} value={password} onChange={setPassword} type="password" placeholder="Password (min 8 chars)" autoComplete="new-password" />
      {err && <p className="text-xs text-red-400">{err}</p>}
      {info && <p className="text-xs text-emerald-400">{info}</p>}
      <Button type="submit" disabled={busy} className="w-full bg-brand-gradient text-white shadow-neon">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
      </Button>
    </form>
  );
}

function Field({
  icon,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
      />
    </div>
  );
}

function SocialButtons() {
  const [busy, setBusy] = useState<string | null>(null);
  const click = async (p: "google" | "apple") => {
    setBusy(p);
    await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin });
    setBusy(null);
  };
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Button variant="outline" type="button" disabled={busy !== null} onClick={() => click("google")} className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50">
        {busy === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue with Google"}
      </Button>
      <Button variant="outline" type="button" disabled={busy !== null} onClick={() => click("apple")} className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50">
        {busy === "apple" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue with Apple"}
      </Button>
    </div>
  );
}

