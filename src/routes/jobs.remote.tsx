import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/layout/Section";
import { JobsDirectory, JobsHero, DEFAULT_FILTERS, jobsQuery } from "@/components/jobs/JobsDirectory";
import { jobsHead } from "@/components/jobs/jobs-head";

const preset = { ...DEFAULT_FILTERS, arrangement: "remote" as const };
export const Route = createFileRoute("/jobs/remote")({
  loader: ({ context }) => context.queryClient.prefetchQuery(jobsQuery(preset)),
  head: () => jobsHead("/jobs/remote", "Remote Jobs Posted in the Last 24 Hours — Verified", "Verified remote openings posted in the last 24 hours. Each listing states whether remote work is worldwide or limited to specific countries.", [{ name: "Remote", path: "/jobs/remote" }]),
  component: () => {
    const [f, setF] = useState(preset);
    return (
      <Section className="pt-14">
        <JobsHero title="Remote Jobs — Verified, Posted Within 24 Hours" subtitle="Remote eligibility varies: check each listing's location line for country or time-zone restrictions before applying." />
        <JobsDirectory filters={f} onChange={(n) => setF({ ...n, arrangement: "remote" })} lockedKeys={["arrangement"]} />
      </Section>
    );
  },
});
