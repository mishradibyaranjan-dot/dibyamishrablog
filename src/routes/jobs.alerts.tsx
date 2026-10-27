import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/layout/Section";
import { JobsHero } from "@/components/jobs/JobsDirectory";
import { jobsHead } from "@/components/jobs/jobs-head";

export const Route = createFileRoute("/jobs/alerts")({
  head: () => jobsHead("/jobs/alerts", "Job Alerts — Verified Jobs", "Email alerts for new verified jobs are coming soon.", [{ name: "Alerts", path: "/jobs/alerts" }], true),
  component: () => (
    <Section className="pt-14">
      <JobsHero title="Job Alerts" subtitle="Email alerts for new verified jobs are not available yet." />
      <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 text-muted-foreground">
        <p>Until alerts launch, set your filters on the <Link to="/jobs" className="text-primary underline">jobs page</Link> and bookmark the page — the address keeps your search, and every visit shows only jobs posted in the last 24 hours.</p>
      </div>
    </Section>
  ),
});
