import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Section } from "@/components/layout/Section";
import { getJob } from "@/lib/jobs/jobs.functions";
import { JobActions, fmtTime, salaryLabel, sourceLabel, type PublicJob } from "@/components/jobs/JobCard";
import { ageLabel } from "@/lib/jobs/rules";
import { breadcrumbScript } from "@/lib/breadcrumbs";

export const Route = createFileRoute("/jobs/$slug")({
  loader: async ({ params }) => {
    const job = (await getJob({ data: { slug: params.slug } })) as PublicJob | null;
    if (!job) throw notFound(); // expired, closed or unverified jobs are never served
    return { job };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Job no longer available" }, { name: "robots", content: "noindex" }] };
    const j = loaderData.job;
    const url = `https://www.dibyamishra.co.in/jobs/${params.slug}`;
    const title = `${j.title} at ${j.company} — Verified Job`;
    const desc = `${j.title} at ${j.company}${j.location ? ` in ${j.location}` : ""}. Posted ${fmtTime(j.original_posted_at)} UTC; apply directly at the source.`;
    return {
      meta: [
        { title }, { name: "description", content: desc }, { property: "og:title", content: title },
        { property: "og:description", content: desc }, { property: "og:url", content: url }, { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        breadcrumbScript([{ name: "Jobs", path: "/jobs" }, { name: j.title, path: `/jobs/${params.slug}` }]),
        ...(j.summary ? [{
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org", "@type": "JobPosting", title: j.title, description: j.summary,
            datePosted: j.original_posted_at, validThrough: j.expires_at,
            hiringOrganization: { "@type": "Organization", name: j.company },
            ...(j.work_arrangement === "remote" ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: j.country ? { "@type": "Country", name: j.country } : undefined } : {}),
            ...(j.location ? { jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: j.location, ...(j.country ? { addressCountry: j.country } : {}) } } } : {}),
            ...(j.employment_type ? { employmentType: j.employment_type } : {}),
            directApply: false,
          }),
        }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <Section className="pt-16">
      <h1 className="font-display text-3xl font-bold">This job is no longer listed</h1>
      <p className="mt-3 text-muted-foreground">Jobs are removed once they are more than 24 hours old, closed by the employer, or fail verification.</p>
      <Link to="/jobs" className="mt-6 inline-block text-primary underline">Browse current verified jobs</Link>
    </Section>
  ),
  errorComponent: () => <Section>Could not load this job. Please try again.</Section>,
  component: JobDetail,
});

function JobDetail() {
  const { job } = Route.useLoaderData();
  const salary = salaryLabel(job);
  return (
    <Section className="pt-14">
      <Link to="/jobs" className="text-sm text-primary">← All verified jobs</Link>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">{job.title}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{job.company} · {job.location ?? "Location not stated"}</p>
      <dl className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Seniority", job.career_level === "unclassified" ? "Not stated" : job.career_level],
          ["Categories", job.categories.join(", ")],
          ["Work arrangement", job.work_arrangement === "unspecified" ? "Not stated by employer" : job.work_arrangement],
          ["Employment type", job.employment_type ?? "Not stated"],
          ["Salary", salary ?? "Not disclosed"],
          ["Source", sourceLabel(job)],
          ["Original posted", `${fmtTime(job.original_posted_at)} (${ageLabel(new Date(job.original_posted_at))})`],
          ["Removed from listings", fmtTime(job.expires_at)],
          ["Last checked", fmtTime(job.last_verified_at)],
        ].map(([k, v]) => (
          <div key={k}><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{k}</dt><dd className="mt-1 capitalize-first">{v}</dd></div>
        ))}
      </dl>
      <section className="mt-8 max-w-3xl">
        <h2 className="font-display text-xl font-semibold">Summary</h2>
        <p className="mt-2 text-muted-foreground">{job.summary ?? "The employer's full description is available on the original posting."}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Summary excerpted from the{" "}
          <a href={job.source_url} target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline">original posting</a>
          {job.job_sources?.provider === "remoteok" ? " via Remote OK" : ` on ${job.company}'s careers site`}. Always confirm details there before applying.
        </p>
      </section>
      <div className="mt-8"><JobActions job={job} showDetails={false} /></div>
    </Section>
  );
}
