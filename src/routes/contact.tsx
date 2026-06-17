import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail, Github, ExternalLink, Linkedin, Send, CheckCircle2, Download, Loader2 } from "lucide-react";
import resumeAsset from "@/assets/resume.pdf.asset.json";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { sendContactMessage, verifyContactPipeline } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Dibya Ranjan Mishra" },
      { name: "description", content: "Get in touch with Dibya Ranjan Mishra for advisory, architecture reviews, or engineering leadership conversations." },
      { property: "og:title", content: "Contact — Dibya Ranjan Mishra" },
      { property: "og:description", content: "Advisory, architecture reviews, or engineering leadership conversations." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    ok: boolean;
    steps: Array<{ step: string; ok: boolean; detail?: string }>;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const send = useServerFn(sendContactMessage);
  const verify = useServerFn(verifyContactPipeline);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
      testMode,
    };
    setSubmitting(true);
    setError(null);
    try {
      await send({ data: payload });
      setSent(true);
      form.reset();
    } catch (err) {
      console.error(err);
      setError("Sorry — something went wrong sending your message. Please try again or email directly.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify() {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const result = await verify();
      setVerifyResult(result);
    } catch (err) {
      console.error(err);
      setVerifyResult({
        ok: false,
        steps: [{ step: "Pipeline call", ok: false, detail: (err as Error).message }],
      });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <>
      <Section className="pb-6 pt-16 lg:pt-24">
        <SectionHeader
          eyebrow="Contact"
          title="Let's talk"
          description="Advisory engagements, architecture reviews, speaking, or a thoughtful exchange on AI and engineering leadership."
        />
      </Section>

      <Section className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="card-flashy rounded-3xl border border-border bg-card p-7 shadow-card-soft">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Message received</h3>
                <p className="mt-1 text-sm text-muted-foreground">Thanks — I'll respond within a couple of business days.</p>
                <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>Send another</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" name="name" placeholder="Your name" required />
                  <Field label="Email" name="email" type="email" placeholder="you@company.com" required />
                </div>
                <Field label="Subject" name="subject" placeholder="What's this about?" required />
                <div>
                  <label className="text-sm font-medium" htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    placeholder="Share a bit of context..."
                    className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive" role="alert">{error}</p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={testMode}
                      onChange={(e) => setTestMode(e.target.checked)}
                      className="h-4 w-4 rounded border-input"
                    />
                    Test mode (sends a marked test email)
                  </label>
                  <Button type="submit" disabled={submitting} className="bg-brand-gradient text-white">
                    {submitting ? (
                      <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Sending…</>
                    ) : (
                      <><Send className="mr-1 h-4 w-4" /> {testMode ? "Send test" : "Send message"}</>
                    )}
                  </Button>
                </div>
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Gmail delivery check</p>
                      <p className="text-xs text-muted-foreground">Sends a test email and confirms it arrived in the connected inbox.</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" disabled={verifying} onClick={handleVerify}>
                      {verifying ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Checking…</> : "Run verification"}
                    </Button>
                  </div>
                  {verifyResult && (
                    <ul className="mt-3 space-y-1.5 text-xs">
                      {verifyResult.steps.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={s.ok ? "text-emerald-500" : "text-destructive"}>{s.ok ? "✓" : "✗"}</span>
                          <span className="flex-1">
                            <span className="font-medium">{s.step}</span>
                            {s.detail && <span className="text-muted-foreground"> — {s.detail}</span>}
                          </span>
                        </li>
                      ))}
                      <li className={`mt-2 font-medium ${verifyResult.ok ? "text-emerald-600" : "text-destructive"}`}>
                        {verifyResult.ok ? "✅ Gmail is receiving submissions." : "❌ Verification failed — see steps above."}
                      </li>
                    </ul>
                  )}
                </div>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <a
              href={resumeAsset.url}
              download
              className="card-flashy flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-gradient text-white">
                <Download className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resume</div>
                <div className="truncate text-sm font-medium">Download CV (PDF)</div>
              </div>
            </a>
            <a
              href="mailto:hello@example.com"
              className="card-flashy flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-gradient text-white">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</div>
                <div className="truncate text-sm font-medium">Send a direct note</div>
              </div>
            </a>
            <a
              href="https://bold.pro/my/dibya-mishra-260203120923"
              target="_blank"
              rel="noreferrer"
              className="card-flashy flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-gradient text-white">
                <ExternalLink className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Portfolio</div>
                <div className="truncate text-sm font-medium">bold.pro/my/dibya-mishra</div>
              </div>
            </a>
            <a
              href="https://github.com/mishradibyaranjan-dot/"
              target="_blank"
              rel="noreferrer"
              className="card-flashy flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-gradient text-white">
                <Github className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">GitHub</div>
                <div className="truncate text-sm font-medium">mishradibyaranjan-dot</div>
              </div>
            </a>
            <a
              href="https://www.linkedin.com/in/dibya-mishra-55b94654"
              target="_blank"
              rel="noreferrer"
              className="card-flashy flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-gradient text-white">
                <Linkedin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">LinkedIn</div>
                <div className="truncate text-sm font-medium">linkedin.com/in/dibya-mishra-55b94654</div>
              </div>
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
