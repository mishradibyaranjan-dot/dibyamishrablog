import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Copyright, ShieldCheck, Bot, Mail, AlertCircle, FileText } from "lucide-react";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import { legalPageScript } from "@/lib/legal-schema";
import { SITE_ORIGIN } from "@/lib/og-images";
import { legalConfig, copyrightLine } from "@/lib/legal-config";

const CANONICAL = `${SITE_ORIGIN}/copyright`;
const TITLE = "Copyright & Content Use | Dibya Ranjan Mishra";
const DESC =
  "How original articles, research, learning material, diagrams and designs on this site may be referenced, quoted or reused — and how to request permission.";

export const Route = createFileRoute("/copyright")({
  component: CopyrightPage,
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
      breadcrumbScript([{ name: "Copyright & Content Use", path: "/copyright" }]),
      legalPageScript({ id: "copyright", description: DESC }),
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

function CopyrightPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Content Ownership</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-5xl">
          Copyright &amp; Content Use
        </h1>
        <p className="mt-4 text-base text-muted-foreground">{copyrightLine()}</p>
      </header>

      <div className="grid gap-5">
        <Card icon={Copyright} title="Ownership">
          <p>
            All original content published on this website — including text, articles,
            documentation, graphics, illustrations, diagrams, product descriptions, learning
            materials, software demonstrations, videos, website designs and other original
            materials — is owned by or licensed to {legalConfig.ownerName} unless otherwise
            stated.
          </p>
          <p>
            Unauthorized copying, reproduction, republication, redistribution, modification or
            commercial use of original website content is not permitted without prior written
            permission.
          </p>
          <p>
            You may share links to pages on this website and may quote limited portions of content
            with appropriate attribution where permitted by applicable law.
          </p>
          <p>
            Third-party trademarks, logos, images, software, libraries and other third-party
            materials remain the property of their respective owners.
          </p>
        </Card>

        <Card icon={ShieldCheck} title="Content Usage">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Visitors may</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Read website content</li>
                <li>Share website links</li>
                <li>Reference the website</li>
                <li>Quote limited portions where legally permitted</li>
                <li>Request permission for additional use</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Please do not</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Republish complete articles or pages</li>
                <li>Clone the website</li>
                <li>Copy proprietary graphics or diagrams</li>
                <li>Copy learning materials in bulk</li>
                <li>Republish documentation as your own</li>
                <li>Commercially resell website content</li>
                <li>Scrape large portions of the website</li>
                <li>Remove copyright notices</li>
                <li>Present original content as your own</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card icon={Bot} title="Automated Content Collection">
          <p>
            Automated scraping, bulk extraction, systematic copying or harvesting of original
            website content for republication, commercial databases, competing services, or other
            unauthorized commercial use is not permitted without prior written permission.
          </p>
          <p>
            Use of substantial original website content for training commercial
            artificial-intelligence systems, datasets or similar automated systems requires prior
            permission where such restriction is permitted by applicable law.
          </p>
          <p className="text-xs">
            Legitimate search-engine crawling remains welcome. Crawler preferences are published in{" "}
            <a href="/robots.txt" className="underline hover:text-foreground">
              robots.txt
            </a>
            , which is a preference signal rather than a substitute for the terms on this page.
          </p>
        </Card>

        <Card icon={FileText} title="Website Materials, Code & Third-Party Licenses">
          <p>
            Original website materials and the proprietary parts of this site's implementation may
            be protected by applicable intellectual-property rights.
          </p>
          <p>
            This site is built on open-source frameworks and libraries, third-party fonts, icon
            sets, licensed images and external APIs. No ownership is claimed over those materials,
            and their respective licenses continue to apply.
          </p>
          <p>Product names, company names, logos and brands belong to their respective owners.</p>
        </Card>

        <Card icon={Mail} title="Permission Requests">
          <p>
            For permission to reproduce, republish, distribute or commercially use our original
            content, please contact{" "}
            <a
              href={`mailto:${legalConfig.copyrightContactEmail}`}
              className="underline hover:text-foreground"
            >
              {legalConfig.copyrightContactEmail}
            </a>
            .
          </p>
        </Card>

        <Card icon={AlertCircle} title="Report Unauthorized Use">
          <p>
            If you believe our original content is being used without authorization, please contact
            us with the relevant website URL and details at{" "}
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
        <Link to="/trust" className="text-primary underline">
          Trust &amp; Security
        </Link>
        <Link to="/contact" className="text-primary underline">
          Contact
        </Link>
      </div>
    </div>
  );
}
