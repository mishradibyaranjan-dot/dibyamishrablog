import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Section } from "@/components/layout/Section";
import { JobsHero } from "@/components/jobs/JobsDirectory";
import { jobsHead } from "@/components/jobs/jobs-head";
import { JobCard, readSaved, type PublicJob } from "@/components/jobs/JobCard";
import { getJob } from "@/lib/jobs/jobs.functions";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { personalJobs } from "@/lib/jobs/personal.functions";

export const Route = createFileRoute("/jobs/saved")({
  head: () => jobsHead("/jobs/saved", "Saved Jobs — Dibya Mishra Jobs", "Your saved opportunities, synchronized to your account and limited to fresh verified jobs.", [{ name: "Saved", path: "/jobs/saved" }], true),
  component: Page,
});

function Page() {
  const { user, loading } = useAuth();
  const load = useServerFn(personalJobs);
  const personal = useQuery({ queryKey: ["personal-jobs", user?.id], queryFn: () => load(), enabled: Boolean(user), refetchInterval: 60_000 });
  const fetchJob = useServerFn(getJob);
  const [state, setState] = useState<{ live: PublicJob[]; gone: number } | null>(null);
  useEffect(() => {
    const slugs = readSaved();
    Promise.all(slugs.map((slug) => fetchJob({ data: { slug } }))).then((rows) => {
      const live = rows.filter(Boolean) as PublicJob[];
      setState({ live, gone: slugs.length - live.length });
    });
  }, [fetchJob]);
  const accountLive = (personal.data?.saves.map((s) => s.jobs).filter(Boolean) ?? []) as unknown as PublicJob[];
  const visible = user ? (personal.data ? { live: accountLive, gone: personal.data.saves.length - accountLive.length } : null) : state;
  return (
    <Section className="pt-14">
      <JobsHero title="Saved Jobs" subtitle={user ? "Saved to your account. Only open opportunities from the last 24 hours appear." : "Saved on this device. Sign in to save jobs across devices."} />
      {personal.error ? <p role="alert">Could not load saved jobs.</p> : loading || !visible ? <p>Loading…</p> : (
        <>
          {visible.gone > 0 && <p className="mb-4 text-sm text-muted-foreground">{visible.gone} saved job{visible.gone === 1 ? " has" : "s have"} expired or closed.</p>}
          <div className="grid gap-4">{visible.live.map((j) => <JobCard key={j.id} job={j} />)}</div>
          {visible.live.length === 0 && <p className="text-muted-foreground">No saved jobs are currently open.</p>}
        </>
      )}
    </Section>
  );
}
