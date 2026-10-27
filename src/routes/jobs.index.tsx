import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Section } from "@/components/layout/Section";
import { JobsDirectory, JobsHero, DEFAULT_FILTERS, jobsQuery } from "@/components/jobs/JobsDirectory";
import { jobsHead, parseJobSearch } from "@/components/jobs/jobs-head";

export const Route = createFileRoute("/jobs/")({
  validateSearch: parseJobSearch,
  loaderDeps: ({ search }) => ({ ...DEFAULT_FILTERS, ...search }),
  loader: async ({ context, deps }) => ({ initial: { filters: deps, data: await context.queryClient.ensureQueryData(jobsQuery(deps)) } }),
  head: () => jobsHead("/jobs", "Verified Jobs Posted in the Last 7 Days — Dibya Mishra", "Fresh, verified job openings from official employer career sites — intern to CEO, India first and worldwide — each with a direct application link."),
  component: JobsPage,
});

function JobsPage() {
  const filters = { ...DEFAULT_FILTERS, ...Route.useSearch() };
  const navigate = useNavigate({ from: "/jobs/" });
  return (
    <Section className="pt-14">
      <JobsHero />
      <JobsDirectory initial={Route.useLoaderData().initial} filters={filters} onChange={(f) => navigate({ search: parseJobSearch(f as unknown as Record<string, unknown>) })} />
    </Section>
  );
}
