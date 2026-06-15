import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Github, ExternalLink, Linkedin, Send, CheckCircle2, Download, FileText } from "lucide-react";
import resumeAsset from "@/assets/resume.pdf.asset.json";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";

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
          <div className="rounded-3xl border border-border bg-card p-7 shadow-card-soft">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Message received</h3>
                <p className="mt-1 text-sm text-muted-foreground">Thanks — I'll respond within a couple of business days.</p>
                <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>Send another</Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="space-y-4"
              >
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
                <Button type="submit" className="bg-brand-gradient text-white">
                  <Send className="mr-1 h-4 w-4" /> Send message
                </Button>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <a
              href="mailto:hello@example.com"
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
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
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
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
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
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
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
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
