import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FileText, ShieldCheck, Scale, Ban, AlertTriangle, Mail, Cookie } from "lucide-react";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import { legalPageScript } from "@/lib/legal-schema";
import { SITE_ORIGIN } from "@/lib/og-images";
import { legalConfig, copyrightLine } from "@/lib/legal-config";

const CANONICAL = `${SITE_ORIGIN}/terms`;
const TITLE = "Terms of Use | Dibya Ranjan Mishra";
const DESC =
  "The terms that apply when you use this website — acceptable use, intellectual property, advisory disclaimers, third-party links, liability and contact details.";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "author", content: legalConfig.ownerName },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      breadcrumbScript([{ name: "Terms of Use", path: "/terms" }]),
      legalPageScript({ name: "Terms of Use", path: "/terms", description: DESC }),
    ],
  }),
});

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-brand-gradient p-2 text-white">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </motion.section>
  );
}

function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Website Terms</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-5xl">
          Terms of Use
        </h1>
        <p className="mt-4 text-base text-muted-foreground">{copyrightLine()}</p>
      </header>

      <div className="grid gap-5">
        <Card icon={FileText} title="Acceptance of these terms">
          <p>
            By accessing or using {legalConfig.websiteName} you agree to these Terms of Use. If you
            do not agree, please stop using the website. These terms apply together with the{" "}
            <Link to="/privacy" className="text-primary underline">
              Privacy Notice
            </Link>{" "}
            and{" "}
            <Link to="/copyright" className="text-primary underline">
              Copyright &amp; Content Use
            </Link>{" "}
            pages.
          </p>
          <p>
            These terms may be updated from time to time. Continued use of the website after an
            update means you accept the revised terms.
          </p>
        </Card>

        <Card icon={ShieldCheck} title="Permitted use">
          <p>
            The website is provided for information, learning and professional-enquiry purposes. You
            may read the content, share links, and contact {legalConfig.ownerName} through the forms
            provided.
          </p>
          <p>
            Where accounts or protected areas exist, you are responsible for keeping your sign-in
            details secure and for activity carried out under your account.
          </p>
        </Card>

        <Card icon={Ban} title="Prohibited use">
          <ul className="list-disc space-y-1 pl-5">
            <li>Attempting to gain unauthorized access to any part of the website or its backend</li>
            <li>Probing, scanning or testing the security of the website without permission</li>
            <li>Automated scraping or bulk extraction of website content</li>
            <li>Submitting spam, malicious code, or misleading contact details</li>
            <li>Interfering with the availability or integrity of the website for others</li>
            <li>Using website content to train commercial AI systems without permission</li>
            <li>Any use that breaches applicable law in {legalConfig.country} or your location</li>
          </ul>
        </Card>

        <Card icon={Scale} title="Intellectual property">
          <p>
            All original content on this website is owned by or licensed to{" "}
            {legalConfig.ownerName}. Reuse beyond what is described on the{" "}
            <Link to="/copyright" className="text-primary underline">
              Copyright &amp; Content Use
            </Link>{" "}
            page requires prior written permission. Third-party trademarks, libraries and materials
            remain with their respective owners.
          </p>
        </Card>

        <Card icon={AlertTriangle} title="No professional advice & no warranty">
          <p>
            Articles, research notes, case studies, playbooks and learning material are shared for
            general information. They do not constitute professional, legal, financial or
            engineering advice for your specific situation, and no client relationship is created by
            reading them or by submitting an enquiry.
          </p>
          <p>
            The website is provided on an “as is” and “as available” basis without warranties of any
            kind. To the maximum extent permitted by law, {legalConfig.ownerName} is not liable for
            indirect, incidental or consequential loss arising from use of the website, or for
            content on third-party websites linked from here.
          </p>
        </Card>

        <Card icon={Cookie} title="Cookies & local storage">
          <p>
            Only strictly necessary storage is used by default — sign-in sessions, security checks
            and spam protection. Preference and analytics storage remain switched off until you
            allow them, and you can change your choice at any time from the Cookie Preferences link
            in the footer. Details are in the{" "}
            <Link to="/privacy" className="text-primary underline">
              Privacy Notice
            </Link>
            .
          </p>
        </Card>

        <Card icon={Mail} title="Governing law & contact">
          <p>
            These terms are governed by the laws of {legalConfig.country}. Questions about these
            terms can be sent to{" "}
            <a
              href={`mailto:${legalConfig.copyrightContactEmail}`}
              className="underline hover:text-foreground"
            >
              {legalConfig.copyrightContactEmail}
            </a>
            .
          </p>
        </Card>
      </div>

      <div className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link to="/privacy" className="text-primary underline">
          Privacy Notice
        </Link>
        <Link to="/copyright" className="text-primary underline">
          Copyright &amp; Content Use
        </Link>
        <Link to="/contact" className="text-primary underline">
          Contact
        </Link>
      </div>
    </div>
  );
}
