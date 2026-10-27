import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/layout/Section";
import { JobsHero } from "@/components/jobs/JobsDirectory";
import { jobsHead } from "@/components/jobs/jobs-head";

const steps = [
  ["Official sources only", "Jobs come from employers' own applicant tracking feeds (Greenhouse, Lever, Ashby) or approved providers with public APIs. We never scrape sites that forbid it or bypass logins."],
  ["Exact original posting time", "We use the employer's original publication timestamp — never the time we found the job. Listings without a reliable timestamp, or with a date but no time, are not shown."],
  ["Strict 7-day window", "A job is visible only while it is less than 7 days old. The database itself enforces this on every request, so jobs disappear on time even if a background task is delayed."],
  ["Still open", "The job must appear in an authorized feed and pass a recent live application-link check. Listings with inconclusive checks are quarantined. Sources follow their configured polling interval; a complete feed snapshot removes missing jobs."],
  ["Safe application links", "Application checks follow only approved provider and board addresses. Redirects outside those addresses, shorteners, messaging apps, internal addresses and payment pages are quarantined."],
  ["One card per job", "When the same role appears on several sources, we show one card and prefer the employer's own careers link."],
  ["Seniority and category", "Rules and AI normalize employer-provided text with recorded evidence. The original title is never changed; unclear roles are left as 'not stated'. Skills are retained only when explicitly named."],
  ["Report a problem", "Every listing has a Report button. Reports are reviewed and listings can be quarantined or removed."],
];

export const Route = createFileRoute("/jobs/about-verification")({
  head: () => jobsHead("/jobs/about-verification", "How We Verify Jobs — 7-Day Freshness Rules", "How listings are sourced, time-stamped, checked for safety and removed after 7 days.", [{ name: "How we verify", path: "/jobs/about-verification" }]),
  component: () => (
    <Section className="pt-14">
      <JobsHero title="How We Verify Jobs" subtitle="Plain-language rules every listing must pass before it appears." />
      <ol className="grid gap-4 md:grid-cols-2">
        {steps.map(([h, p], i) => (
          <li key={h} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-primary">Step {i + 1}</p>
            <h2 className="mt-1 font-display text-lg font-semibold">{h}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{p}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-muted-foreground">We never collect resumes or apply on your behalf. Applications happen on the employer's site.</p>
    </Section>
  ),
});
