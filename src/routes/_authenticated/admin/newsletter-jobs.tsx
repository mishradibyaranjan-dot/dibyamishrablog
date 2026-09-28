import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Play, RefreshCw, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import {
  listNewsletterSchedules,
  listScheduleHistory,
  runScheduleNow,
} from "@/lib/newsletter-schedules.functions";

export const Route = createFileRoute("/_authenticated/admin/newsletter-jobs")({
  head: () => ({
    meta: [
      { title: "Newsletter jobs — Admin" },
      { name: "description", content: "Weekly and monthly newsletter job status." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NewsletterJobsPage,
});

type Schedule = Awaited<ReturnType<typeof listNewsletterSchedules>>[number];
type Run = Awaited<ReturnType<typeof listScheduleHistory>>[number];

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

function StatusBadge({ status }: { status: string | null }) {
  const ok = status === "completed" || status === "posted";
  const running = status === "running" || status === null;
  const Icon = ok ? CheckCircle2 : running ? Clock : XCircle;
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium " +
        (ok
          ? "border-primary/30 bg-primary/10 text-primary"
          : running
            ? "border-border bg-muted text-muted-foreground"
            : "border-destructive/30 bg-destructive/10 text-destructive")
      }
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {status ?? "not run"}
    </span>
  );
}

function JobCard({ schedule }: { schedule: Schedule }) {
  const fetchHistory = useServerFn(listScheduleHistory);
  const runNow = useServerFn(runScheduleNow);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRuns(await fetchHistory({ data: { scheduleId: schedule.id, limit: 15 } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load history");
    } finally {
      setLoading(false);
    }
  }, [fetchHistory, schedule.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const last = runs[0];

  const onRun = async () => {
    if (!confirm(`Generate, email and post the ${schedule.cadence} newsletter now?`)) return;
    setRunning(true);
    try {
      const r = await runNow({ data: { id: schedule.id } });
      toast.success(`Sent "${r.title}" — LinkedIn ${r.linkedInPosted ? "posted" : "failed"}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Run failed");
    } finally {
      setRunning(false);
      void load();
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-labelledby={`job-${schedule.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`job-${schedule.id}`} className="font-display text-lg font-semibold text-foreground">
            {schedule.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {schedule.active ? "Active" : "Paused"} · Next run {fmt(schedule.next_run_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} aria-label={`Refresh ${schedule.name} history`}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={onRun} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run now
          </Button>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-muted/50 p-3">
          <dt className="text-xs text-muted-foreground">Last run</dt>
          <dd className="text-sm font-medium text-foreground">{fmt(last?.started_at ?? schedule.last_run_at)}</dd>
        </div>
        <div className="rounded-xl bg-muted/50 p-3">
          <dt className="text-xs text-muted-foreground">Newsletter</dt>
          <dd><StatusBadge status={last?.status ?? null} /></dd>
        </div>
        <div className="rounded-xl bg-muted/50 p-3">
          <dt className="text-xs text-muted-foreground">LinkedIn</dt>
          <dd><StatusBadge status={last ? (last.linkedin_status ?? "unknown") : null} /></dd>
        </div>
      </dl>

      <h3 className="mt-5 text-sm font-semibold text-foreground">Run history & errors</h3>
      {loading ? (
        <Loader2 className="mt-3 h-5 w-5 animate-spin text-muted-foreground" aria-label="Loading" />
      ) : runs.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No runs yet.</p>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Started</th>
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Emails</th>
                <th className="py-2 pr-3">LinkedIn</th>
                <th className="py-2">Errors</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="py-2 pr-3 whitespace-nowrap">{fmt(r.started_at)}</td>
                  <td className="py-2 pr-3">{r.title ?? "—"}</td>
                  <td className="py-2 pr-3"><StatusBadge status={r.status} /></td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.queued_count ?? 0}/{r.recipients_total ?? 0}</td>
                  <td className="py-2 pr-3"><StatusBadge status={r.linkedin_status ?? "—"} /></td>
                  <td className="py-2 text-xs text-destructive">
                    {[r.error_message, r.linkedin_error && `LinkedIn: ${r.linkedin_error}`]
                      .filter(Boolean)
                      .join(" · ") || <span className="text-muted-foreground">—</span>}
                    {r.failed_recipients.length > 0 && (
                      <span className="block text-muted-foreground">{r.failed_recipients.length} email(s) failed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function NewsletterJobsPage() {
  const fetchSchedules = useServerFn(listNewsletterSchedules);
  const [schedules, setSchedules] = useState<Schedule[] | null>(null);

  useEffect(() => {
    fetchSchedules()
      .then((s) => setSchedules(s.filter((x) => x.cadence === "weekly" || x.cadence === "monthly")))
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Could not load jobs");
        setSchedules([]);
      });
  }, [fetchSchedules]);

  return (
    <Section>
      <SectionHeader
        eyebrow="Admin"
        as="h1"
        title="Newsletter jobs"
        description="Weekly and monthly newsletters are written by AI, emailed to subscribers and posted to LinkedIn automatically."
      />
      <div className="mt-8 grid gap-6">
        {schedules === null ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
        ) : schedules.length === 0 ? (
          <p className="text-muted-foreground">No weekly or monthly jobs found.</p>
        ) : (
          schedules.map((s) => <JobCard key={s.id} schedule={s} />)
        )}
      </div>
    </Section>
  );
}
