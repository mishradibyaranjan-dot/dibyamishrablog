import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/layout/Section";
import { JobsHero } from "@/components/jobs/JobsDirectory";
import { jobsHead } from "@/components/jobs/jobs-head";

const steps = [
  ["Official sources only", "Jobs come from employers' own applicant tracking feeds (Greenhouse, Lever, Ashby) or approved providers with public APIs. We never scrape sites that forbid it or bypass logins."],
  ["Exact original posting time", "We use the employer's original publication timestamp — never the time we found the job. Listings without a reliable timestamp, or with a date but no time, are not shown."],
  ["Strict 24-hour window", "A job is visible only while it is less than 24 hours old. The database itself enforces this on every request, so jobs disappear on time even if a background task is delayed."],
  ["Still open", "Each source is re-checked every 15 minutes. If a job leaves the employer's feed, it is marked closed and removed immediately."],
  ["Safe application links", "Apply links must be secure (https) and public. Link shorteners, messaging apps, internal addresses and fee or payment pages are blocked and sent for review."],
  ["One card per job", "When the same role appears on several sources, we show one card and prefer the employer's own careers link."],
  ["Seniority and category", "Levels and categories are inferred by rules from the employer's original job title. The original title is never changed; unclear roles are left as 'not stated'."],
  ["Report a problem", "Every listing has a Report button. Reports are reviewed and listings can be quarantined or removed."],
];

export const Route = createFileRoute("/jobs/about-verification")({
  head: () => jobsHead("/jobs/about-verification", "How We Verify Jobs — 24-Hour Freshness Rules", "How listings are sourced, time-stamped, checked for safety and removed after 24 hours.", [{ name: "How we verify", path: "/jobs/about-verification" }]),
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
