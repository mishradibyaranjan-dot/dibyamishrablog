import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Database, Mail, Cookie, LineChart, Users, Server } from "lucide-react";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import { legalPageScript } from "@/lib/legal-schema";
import { SITE_ORIGIN } from "@/lib/og-images";
import { legalConfig, copyrightLine } from "@/lib/legal-config";

const CANONICAL = `${SITE_ORIGIN}/privacy`;
const TITLE = "Privacy Notice | Dibya Ranjan Mishra";
const DESC =
  "Plain-language summary of what this website collects, why it is collected, the cookies and services involved, and how to contact the site owner.";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
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
      breadcrumbScript([{ name: "Privacy Notice", path: "/privacy" }]),
      legalPageScript({ name: "Privacy Notice", path: "/privacy", description: DESC }),
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

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Privacy</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-5xl">
          Privacy Notice
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          This notice describes, in plain language, what this website actually collects and why. It
          reflects how {legalConfig.websiteName} is currently built and is updated when the site
          changes.
        </p>
      </header>

      <div className="grid gap-5">
        <Card icon={Mail} title="Information you send us">
          <p>
            <strong className="text-foreground">Contact form.</strong> When you use the contact
            form, the name, email address, subject/topic and message you enter are stored in this
            site's database and emailed to{" "}
            <a
              href={`mailto:${legalConfig.privacyContactEmail}`}
              className="font-medium text-primary underline underline-offset-4"
            >
              {legalConfig.privacyContactEmail}
            </a>{" "}
            so the enquiry can be
            answered. Replies may be sent from the same address.
          </p>
          <p>
            <strong className="text-foreground">Newsletter.</strong> If you subscribe, your email
            address is stored so issues can be sent to you. Every email includes an unsubscribe
            link, and unsubscribing is recorded so no further issues are sent.
          </p>
          <p>
            <strong className="text-foreground">Accounts.</strong> If you sign in (email or Google
            sign-in), an account record is created containing your email address and, where
            provided by the sign-in provider, your name and profile image.
          </p>
          <p>
            <strong className="text-foreground">Assistant chat.</strong> Messages you send to the
            on-site assistant are processed by an AI service to generate a reply and are stored so
            conversations can be reviewed for quality and abuse prevention. Please do not enter
            confidential or sensitive personal information into the chat.
          </p>
        </Card>

        <Card icon={LineChart} title="Information collected automatically">
          <p>
            Page visits are logged for analytics, security and abuse detection. These logs can
            include the page visited, referrer, browser/user-agent string, approximate location
            derived from network request headers (such as country, region and city), a
            one-way-hashed form of your IP address, and — if you are signed in — your account
            identifier.
          </p>
          <p>
            Requests to forms, downloads and API endpoints are also rate-limited and logged for
            security purposes (for example, repeated failed submissions or automated scraping
            attempts).
          </p>
        </Card>

        <Card icon={Cookie} title="Cookies and local storage">
          <p>
            This site uses cookies and browser storage that are necessary for it to work: a session
            cookie/token when you are signed in, plus local storage for your theme choice, learning
            progress, caption preferences and similar interface settings.
          </p>
          <p>
            No advertising or marketing cookies are set by this site, so there is no cookie-consent
            banner. If that changes, the appropriate controls will be added here.
          </p>
        </Card>

        <Card icon={Server} title="Services involved">
          <p>
            The site is built and hosted on Lovable, which also provides the managed
            database, authentication and file storage used here. AI features (assistant replies,
            generated newsletter drafts, read-aloud audio) are processed through Lovable's AI
            gateway to model providers. Outbound email (contact confirmations, newsletter issues,
            account emails) is sent through Lovable's email delivery service. Search-console
            verification tags from Google are present in the site's HTML.
          </p>
          <p>
            These providers process data on our behalf in order to run the site. See our{" "}
            <Link to="/trust" className="underline hover:text-foreground">
              Trust &amp; Security
            </Link>{" "}
            page for more detail on hosting and security controls.
          </p>
        </Card>

        <Card icon={Database} title="How the information is used">
          <p>
            Information is used to respond to enquiries, send requested newsletters, operate
            accounts and protected areas, understand which content is useful, keep the site secure,
            and prevent spam and abuse. It is not sold.
          </p>
        </Card>

        <Card icon={Users} title="Your requests and contact">
          <p>
            To ask what information is held about you, to correct it, to request deletion, or to
            unsubscribe, email{" "}
            <a
              href={`mailto:${legalConfig.privacyContactEmail}`}
              className="underline hover:text-foreground"
            >
              {legalConfig.privacyContactEmail}
            </a>
            . Please include enough detail (for example, the email address you used) to locate the
            relevant records.
          </p>
          <p>
            The site is operated from {legalConfig.country} by {legalConfig.ownerName}.
          </p>
        </Card>
      </div>

      <p className="mt-10 text-xs text-muted-foreground">{copyrightLine()}</p>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
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
