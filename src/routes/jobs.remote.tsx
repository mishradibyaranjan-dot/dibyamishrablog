import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/layout/Section";
import { JobsDirectory, JobsHero, DEFAULT_FILTERS, jobsQuery } from "@/components/jobs/JobsDirectory";
import { jobsHead } from "@/components/jobs/jobs-head";

const preset = { ...DEFAULT_FILTERS, arrangement: "remote" as const };
export const Route = createFileRoute("/jobs/remote")({
  loader: async ({ context }) => ({ initial: { filters: preset, data: await context.queryClient.ensureQueryData(jobsQuery(preset)) } }),
  head: () => jobsHead("/jobs/remote", "Remote Jobs Posted in the Last 7 Days — Verified", "Verified remote openings posted in the last 7 days. Each listing states whether remote work is worldwide or limited to specific countries.", [{ name: "Remote", path: "/jobs/remote" }]),
  component: Page,
});
function Page() {
    const { initial } = Route.useLoaderData();
    const [f, setF] = useState(preset);
    return (
      <Section className="pt-14">
        <JobsHero title="Remote Jobs — Verified, Posted Within 24 Hours" subtitle="Remote eligibility varies: check each listing's location line for country or time-zone restrictions before applying." />
        <JobsDirectory initial={initial} filters={f} onChange={(n) => setF({ ...n, arrangement: "remote" })} lockedKeys={["arrangement"]} />
      </Section>
    );
}
