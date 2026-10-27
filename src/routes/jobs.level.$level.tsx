import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/layout/Section";
import { JobsDirectory, JobsHero, DEFAULT_FILTERS, jobsQuery } from "@/components/jobs/JobsDirectory";
import { jobsHead } from "@/components/jobs/jobs-head";
import { CAREER_LEVELS, slugify } from "@/lib/jobs/rules";

const find = (s: string) => CAREER_LEVELS.find((l) => slugify(l) === s);
export const Route = createFileRoute("/jobs/level/$level")({
  loader: ({ params, context }) => {
    const level = find(params.level);
    if (!level) throw notFound();
    return context.queryClient.prefetchQuery(jobsQuery({ ...DEFAULT_FILTERS, level })).then(() => ({ level }));
  },
  head: ({ params, loaderData }) => loaderData
    ? jobsHead(`/jobs/level/${params.level}`, `${loaderData.level} Jobs — Verified, Last 24 Hours`, `Verified ${loaderData.level} openings posted by employers in the last 24 hours, classified from the employer's original job title.`, [{ name: loaderData.level, path: `/jobs/level/${params.level}` }])
    : { meta: [{ title: "Level not found" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: () => <Section>Unknown career level.</Section>,
  component: Page,
});
function Page() {
  const { level } = Route.useLoaderData();
  const [f, setF] = useState({ ...DEFAULT_FILTERS, level });
  return (
    <Section className="pt-14">
      <JobsHero title={`${level} Jobs`} subtitle={`Openings posted in the last 24 hours, classified as ${level} from the employer's own job title. Original titles are always shown unchanged.`} />
      <JobsDirectory filters={f} onChange={(n) => setF({ ...n, level })} lockedKeys={["level"]} />
    </Section>
  );
}
