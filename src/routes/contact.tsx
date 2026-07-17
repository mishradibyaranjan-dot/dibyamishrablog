import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ExternalLink, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import heroContact from "@/assets/hero-contact.jpg";


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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      setSent(true);
      form.reset();
    } catch (err) {
      console.error(err);
      setError("Sorry — something went wrong sending your message. Please try again or email directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Section className="pb-6 pt-16 lg:pt-24">
        <SectionHeader
          as="h1"
          eyebrow="Contact"
          title="Let's talk"
          description="Advisory engagements, architecture reviews, speaking, or a thoughtful exchange on AI and engineering leadership."
        />

        <img
          src={heroContact}
          alt="Illustration of an open envelope and paper plane inviting messages for advisory, architecture reviews, and engineering leadership conversations"
          width={1600}
          height={900}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="mt-2 aspect-[16/9] w-full rounded-3xl border border-border/60 object-cover"
        />

      </Section>


      <Section className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="card-flashy rounded-3xl glass-strong p-7">
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
                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
                  <Button type="submit" disabled={submitting} className="bg-brand-gradient text-white">
                    {submitting ? (
                      <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Sending…</>
                    ) : (
                      <><Send className="mr-1 h-4 w-4" /> Send message</>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <a
              href="mailto:mishra.dibyaranajan@gmail.com"
              className="card-flashy flex items-start gap-4 rounded-2xl glass-strong p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-gradient text-white">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</div>
                <div className="truncate text-sm font-medium">mishra.dibyaranajan@gmail.com</div>
              </div>
            </a>
            <a
              href="https://bold.pro/my/dibya-mishra-260203120923"
              target="_blank"
              rel="noreferrer"
              className="card-flashy flex items-start gap-4 rounded-2xl glass-strong p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
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
              className="card-flashy flex items-start gap-4 rounded-2xl glass-strong p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-gradient text-white">
                <ExternalLink className="h-5 w-5" />
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
              className="card-flashy flex items-start gap-4 rounded-2xl glass-strong p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-gradient text-white">
                <ExternalLink className="h-5 w-5" />
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
