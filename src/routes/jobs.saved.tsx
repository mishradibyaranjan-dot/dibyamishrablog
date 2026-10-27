import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Section } from "@/components/layout/Section";
import { JobsHero } from "@/components/jobs/JobsDirectory";
import { jobsHead } from "@/components/jobs/jobs-head";
import { JobCard, readSaved, type PublicJob } from "@/components/jobs/JobCard";
import { getJob } from "@/lib/jobs/jobs.functions";

export const Route = createFileRoute("/jobs/saved")({
  head: () => jobsHead("/jobs/saved", "Saved Jobs — Verified Jobs", "Jobs you saved on this device that are still open and verified.", [{ name: "Saved", path: "/jobs/saved" }], true),
  component: Page,
});

function Page() {
  const fetchJob = useServerFn(getJob);
  const [state, setState] = useState<{ live: PublicJob[]; gone: number } | null>(null);
  useEffect(() => {
    const slugs = readSaved();
    Promise.all(slugs.map((slug) => fetchJob({ data: { slug } }))).then((rows) => {
      const live = rows.filter(Boolean) as PublicJob[];
      setState({ live, gone: slugs.length - live.length });
    });
  }, [fetchJob]);
  return (
    <Section className="pt-14">
      <JobsHero title="Saved Jobs" subtitle="Saved on this device only. Jobs drop off automatically once they expire or close." />
      {!state ? <p>Loading…</p> : (
        <>
          {state.gone > 0 && <p className="mb-4 text-sm text-muted-foreground">{state.gone} saved job{state.gone === 1 ? " has" : "s have"} expired or closed.</p>}
          <div className="grid gap-4">{state.live.map((j) => <JobCard key={j.id} job={j} />)}</div>
          {state.live.length === 0 && <p className="text-muted-foreground">No saved jobs are currently open.</p>}
        </>
      )}
    </Section>
  );
}
