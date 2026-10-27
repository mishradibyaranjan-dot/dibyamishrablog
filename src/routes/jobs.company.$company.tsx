import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/layout/Section";
import { JobsDirectory, JobsHero, DEFAULT_FILTERS, jobsQuery } from "@/components/jobs/JobsDirectory";
import { jobsHead } from "@/components/jobs/jobs-head";

export const Route = createFileRoute("/jobs/company/$company")({
  loader: ({ params, context }) => {
    const company = decodeURIComponent(params.company).replace(/-/g, " ").slice(0, 80);
    return context.queryClient.prefetchQuery(jobsQuery({ ...DEFAULT_FILTERS, company })).then(() => ({ company }));
  },
  head: ({ params, loaderData }) => jobsHead(`/jobs/company/${params.company}`, `${loaderData?.company ?? "Company"} Jobs — Verified, Last 24 Hours`, `Verified openings at ${loaderData?.company ?? "this company"} posted in the last 24 hours, linked directly to the employer's application page.`, [{ name: loaderData?.company ?? "Company", path: `/jobs/company/${params.company}` }], true),
  component: Page,
});
function Page() {
  const { company } = Route.useLoaderData();
  const [f, setF] = useState({ ...DEFAULT_FILTERS, company });
  return (
    <Section className="pt-14">
      <JobsHero title={`Jobs at ${company}`} subtitle="Openings posted in the last 24 hours on this employer's official careers feed." />
      <JobsDirectory filters={f} onChange={(n) => setF({ ...n, company })} lockedKeys={["company"]} />
    </Section>
  );
}
