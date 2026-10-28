import { Fragment, useEffect, useState } from "react";
import { Loader2, Calendar, Play, Trash2, Plus, History, ChevronDown, ChevronUp, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  listNewsletterSchedules,
  upsertNewsletterSchedule,
  deleteNewsletterSchedule,
  runScheduleNow,
  listScheduleHistory,
  retryFailedRunRecipients,
} from "@/lib/newsletter-schedules.functions";

type Row = {
  id: string;
  name: string;
  cadence: "daily" | "weekly" | "monthly";
  hour_utc: number;
  day_of_week: number | null;
  day_of_month: number | null;
  topic_hint: string | null;
  active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
};

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type HistoryRow = {
  id: string;
  issue_id: string | null;
  trigger_source: string;
  title: string | null;
  recipients_total: number;
  queued_count: number;
  failed_count: number;
  status: string;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
  failed_recipients: Array<{ run_id: string; email: string; error_message: string | null }>;
};

export function NewsletterScheduler() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState<Record<string, boolean>>({});
  const [historyData, setHistoryData] = useState<Record<string, HistoryRow[]>>({});
  const [historyLoading, setHistoryLoading] = useState<Record<string, boolean>>({});
  const [retryingRunId, setRetryingRunId] = useState<string | null>(null);
  const [pendingRetry, setPendingRetry] = useState<{
    scheduleId: string;
    runId: string;
    failedCount: number;
    recipients: Array<{ email: string; error_message: string | null }>;
  } | null>(null);

  // form
  const [name, setName] = useState("Weekly digest");
  const [cadence, setCadence] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [hour, setHour] = useState(13);
  const [dow, setDow] = useState(1);
  const [dom, setDom] = useState(1);
  const [topic, setTopic] = useState("");

  const refresh = async () => {
    try {
      const data = await listNewsletterSchedules();
      setRows(data as Row[]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };
  useEffect(() => {
    refresh();
  }, []);

  const addSchedule = async () => {
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      await upsertNewsletterSchedule({
        data: {
          name,
          cadence,
          hour_utc: hour,
          day_of_week: cadence === "weekly" ? dow : null,
          day_of_month: cadence === "monthly" ? dom : null,
          topic_hint: topic || null,
          active: true,
        },
      });
      setMsg("Schedule saved.");
      setName("Weekly digest");
      setTopic("");
      refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (r: Row) => {
    try {
      await upsertNewsletterSchedule({
        data: {
          id: r.id,
          name: r.name,
          cadence: r.cadence,
          hour_utc: r.hour_utc,
          day_of_week: r.day_of_week,
          day_of_month: r.day_of_month,
          topic_hint: r.topic_hint,
          active: !r.active,
        },
      });
      refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this schedule?")) return;
    try {
      await deleteNewsletterSchedule({ data: { id } });
      refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const runNow = async (id: string) => {
    if (!confirm("Generate and send a newsletter now for this schedule?")) return;
    setRunningId(id);
    setErr(null);
    setMsg(null);
    try {
      const r = (await runScheduleNow({ data: { id } })) as {
        title: string;
        recipients: number;
        emailsQueued: number;
        emailErrors: number;
      };
      setMsg(`Sent "${r.title}" — ${r.emailsQueued}/${r.recipients} queued (errors: ${r.emailErrors}).`);
      refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setRunningId(null);
    }
  };

  const loadHistory = async (id: string) => {
    setHistoryLoading((m) => ({ ...m, [id]: true }));
    try {
      const data = (await listScheduleHistory({ data: { scheduleId: id, limit: 10 } })) as HistoryRow[];
      setHistoryData((m) => ({ ...m, [id]: data }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setHistoryLoading((m) => ({ ...m, [id]: false }));
    }
  };

  const toggleHistory = (id: string) => {
    const open = !historyOpen[id];
    setHistoryOpen((m) => ({ ...m, [id]: open }));
    if (open && !historyData[id]) loadHistory(id);
  };

  const retryRun = (
    scheduleId: string,
    runId: string,
    failedCount: number,
    recipients: Array<{ email: string; error_message: string | null }>,
  ) => {
    if (failedCount === 0) return;
    setPendingRetry({ scheduleId, runId, failedCount, recipients });
  };

  const executeRetry = async () => {
    if (!pendingRetry) return;
    const { scheduleId, runId } = pendingRetry;
    setPendingRetry(null);
    setRetryingRunId(runId);
    setErr(null);
    setMsg(null);
    try {
      const r = (await retryFailedRunRecipients({ data: { runId } })) as {
        retried: number;
        queued: number;
        errors: number;
      };
      setMsg(`Retried ${r.retried} — ${r.queued} re-queued, ${r.errors} still failing.`);
      await loadHistory(scheduleId);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setRetryingRunId(null);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Calendar className="h-4 w-4 text-neon-cyan" />
        Recurring newsletter schedules
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Runs hourly. Each active schedule auto-generates a new newsletter with AI and emails it to every registered user + active subscriber when due.
      </p>

      {/* New schedule form */}
      <div className="mb-4 grid gap-2 rounded-xl border border-border bg-muted p-3 md:grid-cols-6">
        <input
          aria-label="Schedule name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground md:col-span-2"
        />
        <select
          aria-label="Schedule cadence"
          value={cadence}
          onChange={(e) => setCadence(e.target.value as any)}
          className="rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <select
          aria-label="Hour UTC"
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          className="rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground"
          title="Hour UTC"
        >
          {Array.from({ length: 24 }).map((_, h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, "0")}:00 UTC
            </option>
          ))}
        </select>
        {cadence === "weekly" && (
          <select
            aria-label="Day of week"
          value={dow}
            onChange={(e) => setDow(Number(e.target.value))}
            className="rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground"
          >
            {DOW.map((d, i) => (
              <option key={i} value={i}>
                {d}
              </option>
            ))}
          </select>
        )}
        {cadence === "monthly" && (
          <select
            aria-label="Day of month"
          value={dom}
            onChange={(e) => setDom(Number(e.target.value))}
            className="rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground"
          >
            {Array.from({ length: 28 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Day {i + 1}
              </option>
            ))}
          </select>
        )}
        {cadence === "daily" && <div />}
        <input
          aria-label="Schedule topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Optional topic hint"
          className="rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground md:col-span-5"
        />
        <Button size="sm" onClick={addSchedule} disabled={busy || !name} className="bg-primary text-primary-foreground">
          {busy ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-1 h-3.5 w-3.5" />}
          Add
        </Button>
      </div>

      {/* Schedule rows */}
      <div className="space-y-2">
        {rows.length === 0 && <p className="text-xs text-muted-foreground">No schedules yet.</p>}
        {rows.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-card p-3 text-xs text-foreground">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-foreground">{r.name}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {r.cadence}
                  {r.cadence === "weekly" && r.day_of_week !== null && ` · ${DOW[r.day_of_week]}`}
                  {r.cadence === "monthly" && r.day_of_month !== null && ` · day ${r.day_of_month}`}
                  {` · ${String(r.hour_utc).padStart(2, "0")}:00 UTC`}
                  {r.topic_hint && ` · “${r.topic_hint}”`}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  Next: {r.next_run_at ? new Date(r.next_run_at).toLocaleString() : "—"}
                  {r.last_run_at && ` · Last: ${new Date(r.last_run_at).toLocaleString()}`}
                </div>
              </div>
              <button
                onClick={() => toggle(r)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.active ? "bg-success-soft text-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {r.active ? "active" : "paused"}
              </button>
              <Button size="sm" variant="outline" onClick={() => toggleHistory(r.id)} className="border-input bg-card text-foreground hover:bg-muted">
                <History className="mr-1 h-3.5 w-3.5" />
                History
                {historyOpen[r.id] ? <ChevronUp className="ml-1 h-3.5 w-3.5" /> : <ChevronDown className="ml-1 h-3.5 w-3.5" />}
              </Button>
              <Button size="sm" variant="outline" onClick={() => runNow(r.id)} disabled={runningId === r.id} className="border-input bg-card text-foreground hover:bg-muted">
                {runningId === r.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-1 h-3.5 w-3.5" />}
                Run now
              </Button>
              <Button size="sm" variant="outline" aria-label={`Delete ${r.name} schedule`} onClick={() => remove(r.id)} className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {historyOpen[r.id] && (
              <div className="mt-3 rounded-md border border-border bg-muted p-2">
                <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
                  <span>Send history (last 10)</span>
                  <button onClick={() => loadHistory(r.id)} className="text-muted-foreground hover:text-foreground">
                    Refresh
                  </button>
                </div>
                {historyLoading[r.id] && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Loading…</div>}
                {!historyLoading[r.id] && (historyData[r.id]?.length ?? 0) === 0 && (
                  <p className="text-muted-foreground">No runs yet.</p>
                )}
                {!historyLoading[r.id] && (historyData[r.id]?.length ?? 0) > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-[11px]">
                      <thead className="text-muted-foreground">
                        <tr>
                          <th className="py-1 pr-3 font-medium">When</th>
                          <th className="py-1 pr-3 font-medium">Trigger</th>
                          <th className="py-1 pr-3 font-medium">Title</th>
                          <th className="py-1 pr-3 font-medium text-right">Queued</th>
                          <th className="py-1 pr-3 font-medium text-right">Failed</th>
                          <th className="py-1 pr-3 font-medium text-right">Total</th>
                          <th className="py-1 pr-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData[r.id].map((run) => (
                          <Fragment key={run.id}>
                            <tr key={run.id} className="border-t border-border align-top">
                              <td className="py-1 pr-3 text-muted-foreground whitespace-nowrap">{new Date(run.started_at).toLocaleString()}</td>
                              <td className="py-1 pr-3 text-muted-foreground">{run.trigger_source}</td>
                              <td className="py-1 pr-3 text-foreground truncate max-w-[220px]">{run.title ?? "—"}</td>
                              <td className="py-1 pr-3 text-right text-foreground">{run.queued_count}</td>
                              <td className={`py-1 pr-3 text-right ${run.failed_count > 0 ? "text-destructive" : "text-muted-foreground"}`}>{run.failed_count}</td>
                              <td className="py-1 pr-3 text-right text-muted-foreground">{run.recipients_total}</td>
                              <td className="py-1 pr-3">
                                <span className={`rounded px-1.5 py-0.5 text-[10px] ${run.status === "completed" ? "bg-success-soft text-foreground" : run.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-warning-soft text-foreground"}`}>
                                  {run.status}
                                </span>
                              </td>
                            </tr>
                            {(run.error_message || run.failed_recipients.length > 0) && (
                              <tr key={`${run.id}-err`} className="border-t border-border">
                                <td colSpan={7} className="py-1 pr-3">
                                  {run.error_message && (
                                    <div className="mb-1 text-destructive">Run error: {run.error_message}</div>
                                  )}
                                  {run.failed_recipients.length > 0 && (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-destructive">{run.failed_recipients.length} failed recipient(s)</span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            retryRun(
                                              r.id,
                                              run.id,
                                              run.failed_recipients.length,
                                              run.failed_recipients,
                                            )
                                          }
                                          disabled={retryingRunId === run.id || pendingRetry?.runId === run.id}
                                          className="h-6 border-amber-400/30 bg-amber-500/10 px-2 py-0 text-[10px] text-amber-200 hover:bg-amber-500/20"
                                        >
                                          {retryingRunId === run.id ? (
                                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                          ) : (
                                            <RefreshCw className="mr-1 h-3 w-3" />
                                          )}
                                          Retry failed
                                        </Button>
                                      </div>
                                      <details className="text-muted-foreground">
                                        <summary className="cursor-pointer text-destructive/80 text-[10px]">Show recipients</summary>
                                        <ul className="mt-1 space-y-0.5 pl-4">
                                          {run.failed_recipients.map((f, i) => (
                                            <li key={i} className="text-[10px]">
                                              <span className="text-foreground">{f.email}</span>
                                              {f.error_message && <span className="text-destructive"> — {f.error_message}</span>}
                                            </li>
                                          ))}
                                        </ul>
                                      </details>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {msg && <p className="mt-3 text-xs text-success">{msg}</p>}
      {err && <p className="mt-3 text-xs text-destructive">{err}</p>}

      <Dialog open={!!pendingRetry} onOpenChange={(open) => !open && setPendingRetry(null)}>
        <DialogContent className="border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Retry failed deliveries?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Please review the run summary below before confirming.
            </DialogDescription>
          </DialogHeader>
          {pendingRetry && (
            <div className="space-y-3 py-2 text-sm">
              <div className="grid grid-cols-[120px_1fr] gap-2 rounded-lg border border-border bg-card p-3">
                <span className="text-muted-foreground">Run ID</span>
                <span className="font-mono text-foreground">{pendingRetry.runId}</span>
                <span className="text-muted-foreground">Failed count</span>
                <span className="font-semibold text-destructive">{pendingRetry.failedCount}</span>
                <span className="text-muted-foreground">Estimated recipients</span>
                <span className="text-foreground">{pendingRetry.recipients.length} email(s) will be re-queued</span>
              </div>
              <details className="rounded-lg border border-border bg-card">
                <summary className="cursor-pointer p-3 text-xs text-muted-foreground hover:text-foreground">
                  Preview failed recipients
                </summary>
                <ul className="max-h-40 overflow-auto p-3 pt-0 text-xs">
                  {pendingRetry.recipients.map((f, i) => (
                    <li key={i} className="py-0.5">
                      <span className="text-foreground">{f.email}</span>
                      {f.error_message && <span className="text-destructive"> — {f.error_message}</span>}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingRetry(null)}
              className="border-input bg-card text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={executeRetry}
              disabled={retryingRunId === pendingRetry?.runId}
              className="bg-amber-500 text-foreground hover:bg-amber-400"
            >
              {retryingRunId === pendingRetry?.runId ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-1 h-4 w-4" />
              )}
              Retry now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
