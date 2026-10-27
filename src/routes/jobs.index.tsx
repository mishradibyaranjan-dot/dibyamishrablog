import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Section } from "@/components/layout/Section";
import { JobsDirectory, JobsHero, DEFAULT_FILTERS, jobsQuery } from "@/components/jobs/JobsDirectory";
import { jobsHead, parseJobSearch } from "@/components/jobs/jobs-head";

export const Route = createFileRoute("/jobs/")({
  validateSearch: parseJobSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.prefetchQuery(jobsQuery(deps)),
  head: () => jobsHead("/jobs", "Verified Jobs Posted in the Last 24 Hours — Dibya Mishra", "Fresh, verified job openings from official employer career sites — intern to CEO, India first and worldwide — each with a direct application link."),
  component: JobsPage,
});

function JobsPage() {
  const filters = Route.useSearch();
  const navigate = useNavigate({ from: "/jobs/" });
  return (
    <Section className="pt-14">
      <JobsHero />
      <JobsDirectory filters={filters} onChange={(f) => navigate({ search: f })} />
    </Section>
  );
}
