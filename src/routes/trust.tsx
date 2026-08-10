import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield, Lock, Database, Mail, Cookie, Users, AlertCircle, FileText } from "lucide-react";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import { legalPageScript } from "@/lib/legal-schema";
import { pageOgImages, SITE_ORIGIN } from "@/lib/og-images";

const CANONICAL = `${SITE_ORIGIN}/trust`;

export const Route = createFileRoute("/trust")({
  component: TrustPage,
  head: () => ({
    meta: [
      { title: "Trust & Privacy | Dibya Ranjan Mishra" },
      {
        name: "description",
        content:
          "How this site handles data, security, subprocessors, cookies, and privacy requests. Maintained by Dibya Ranjan Mishra.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Trust & Privacy | Dibya Ranjan Mishra" },
      {
        property: "og:description",
        content:
          "Plain-language overview of security, privacy, and data handling practices for dibyamishra.co.in.",
      },
      { property: "og:url", content: CANONICAL },
      { property: "og:image", content: pageOgImages.trust },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Trust & Privacy | Dibya Ranjan Mishra" },
      {
        name: "twitter:description",
        content:
          "Security, privacy, and data handling practices for dibyamishra.co.in — in plain language.",
      },
      { name: "twitter:image", content: pageOgImages.trust },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      breadcrumbScript([{ name: "Trust & Privacy", path: "/trust" }]),
      legalPageScript({
        id: "trust",
        description:
          "How this site handles data, security, subprocessors, cookies, and privacy requests.",
      }),
    ],
  }),
});

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
  >
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-brand-gradient p-2 text-white shadow-neon">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
    </div>
    <div className="mt-4 space-y-3 text-sm leading-relaxed text-white/75">{children}</div>
  </motion.section>
);

function TrustPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-neon-cyan">Trust Center</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
          Trust, Privacy & Security
        </h1>
        <p className="mt-4 text-base text-white/70">
          This page is maintained by Dibya Ranjan Mishra to answer common security and privacy
          questions about this site. It describes the controls currently in place and how your
          data is handled. It is editable site content, not an independent certification.
        </p>
      </header>

      <div className="grid gap-5">
        <Section icon={Shield} title="Platform & Hosting">
          <p>
            This site is built and hosted on Lovable, which runs the application on a managed
            edge runtime with HTTPS enabled by default. Lovable provides the underlying
            infrastructure, build pipeline, and managed database/auth services used by this site.
          </p>
          <p className="text-white/55">
            Reference to platform capabilities is descriptive only and is not a Lovable-issued
            certification or independent audit.
          </p>
        </Section>

        <Section icon={Lock} title="Access & Authentication">
          <p>
            The public site (blog, research, projects, case studies, about, contact) is
            open and does not require an account to read. There is no end-user login on this
            site today. Administrative access to content, analytics, and backend settings is
            limited to the site owner via the Lovable workspace.
          </p>
        </Section>

        <Section icon={Database} title="Data Collection & Use">
          <p>The site collects only the data you choose to submit:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong className="text-white/90">Contact form</strong> — name, email, and your
              message, used to respond to your inquiry.
            </li>
            <li>
              <strong className="text-white/90">Newsletter signup</strong> — email address, used
              to send occasional research notes. You can request removal at any time.
            </li>
            <li>
              <strong className="text-white/90">AI chat widget</strong> — the prompts you type
              are sent to an AI provider to generate a response. Do not paste confidential or
              personal data into the chat.
            </li>
          </ul>
          <p>
            Submitted data is not sold. It is used only to operate this site and to respond to
            you.
          </p>
        </Section>

        <Section icon={Users} title="Subprocessors & Integrations">
          <p>This site relies on the following service providers:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong className="text-white/90">Lovable</strong> — hosting, build, managed
              database, and serverless functions.
            </li>
            <li>
              <strong className="text-white/90">Gmail / Google Workspace</strong> — delivery of
              contact-form and newsletter signup notifications to the site owner.
            </li>
            <li>
              <strong className="text-white/90">AI provider (via Lovable AI Gateway)</strong> —
              processes chat prompts and text-to-speech ("read aloud") requests on demand.
            </li>
          </ul>
        </Section>

        <Section icon={Cookie} title="Cookies & Analytics">
          <p>
            This site does not set advertising or cross-site tracking cookies. The platform may
            set minimal functional cookies required to serve the site. Aggregated, non-identifying
            usage metrics may be visible to the site owner through the hosting platform.
          </p>
        </Section>

        <Section icon={FileText} title="Retention & Deletion">
          <p>
            Contact messages and newsletter subscriptions are kept while they remain useful for
            communication. You can request deletion of your email or contact record at any time
            by writing to the address below; the owner will action the request within a
            reasonable timeframe.
          </p>
        </Section>

        <Section icon={Mail} title="Privacy Requests & Contact">
          <p>
            For privacy, access, correction, or deletion requests, please reach out via the{" "}
            <Link to="/contact" className="text-neon-cyan underline-offset-4 hover:underline">
              contact page
            </Link>
            . Include enough detail (e.g., the email you subscribed with) so the request can be
            verified and actioned.
          </p>
        </Section>

        <Section icon={AlertCircle} title="Security Issues & Disclosure">
          <p>
            If you believe you have found a security issue affecting this site, please report it
            privately via the{" "}
            <Link to="/contact" className="text-neon-cyan underline-offset-4 hover:underline">
              contact page
            </Link>{" "}
            instead of disclosing it publicly. Reports are reviewed by the site owner and
            forwarded to the hosting platform when the issue concerns shared infrastructure.
          </p>
        </Section>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-xs text-white/55">
          <p>
            This page describes current practices in plain language. It is not legal advice and
            is not a substitute for a regulated compliance certification. Specific contractual
            terms (e.g., DPAs, enterprise security questionnaires) can be discussed on request.
          </p>
          <p className="mt-2">Last reviewed: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}.</p>
        </div>
      </div>
    </div>
  );
}
