import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/layout/Section";
import { JobsDirectory, JobsHero, DEFAULT_FILTERS, jobsQuery } from "@/components/jobs/JobsDirectory";
import { jobsHead } from "@/components/jobs/jobs-head";
import { CATEGORY_RULES, slugify } from "@/lib/jobs/rules";

const find = (s: string) => CATEGORY_RULES.map(([c]) => c).find((c) => slugify(c) === s);
export const Route = createFileRoute("/jobs/category/$category")({
  loader: ({ params, context }) => {
    const category = find(params.category);
    if (!category) throw notFound();
    return context.queryClient.prefetchQuery(jobsQuery({ ...DEFAULT_FILTERS, category })).then(() => ({ category }));
  },
  head: ({ params, loaderData }) => loaderData
    ? jobsHead(`/jobs/category/${params.category}`, `${loaderData.category} Jobs — Verified, Last 24 Hours`, `Fresh ${loaderData.category} job openings from official employer career sites, posted within the last 24 hours.`, [{ name: loaderData.category, path: `/jobs/category/${params.category}` }])
    : { meta: [{ title: "Category not found" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: () => <Section>Unknown job category.</Section>,
  component: Page,
});
function Page() {
  const { category } = Route.useLoaderData();
  const [f, setF] = useState({ ...DEFAULT_FILTERS, category });
  return (
    <Section className="pt-14">
      <JobsHero title={`${category} Jobs`} subtitle={`Verified ${category} roles posted within the last 24 hours, from intern to executive level.`} />
      <JobsDirectory filters={f} onChange={(n) => setF({ ...n, category })} lockedKeys={["category"]} />
    </Section>
  );
}
