import { createFileRoute } from "@tanstack/react-router";
import { JobSearches } from "@/components/jobs/JobSearches";
import { Section } from "@/components/layout/Section";
import { JobsHero } from "@/components/jobs/JobsDirectory";
import { jobsHead } from "@/components/jobs/jobs-head";

export const Route = createFileRoute("/jobs/alerts")({
  head: () => jobsHead("/jobs/alerts", "Saved Searches & Matching Alerts — Dibya Mishra Jobs", "Save your job preferences and find matching verified opportunities posted within 24 hours.", [{ name: "Alerts", path: "/jobs/alerts" }], true),
  component: () => (
    <Section className="pt-14">
      <JobsHero title="Saved Searches & Alerts" subtitle="Your preferences. Fresh opportunities. In-app matches only — email delivery is not enabled." />
      <JobSearches />
    </Section>
  ),
});
