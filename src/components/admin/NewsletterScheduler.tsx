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
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <Calendar className="h-4 w-4 text-neon-cyan" />
        Recurring newsletter schedules
      </div>
      <p className="mb-4 text-xs text-white/60">
        Runs hourly. Each active schedule auto-generates a new newsletter with AI and emails it to every registered user + active subscriber when due.
      </p>

      {/* New schedule form */}
      <div className="mb-4 grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3 md:grid-cols-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs text-white md:col-span-2"
        />
        <select
          value={cadence}
          onChange={(e) => setCadence(e.target.value as any)}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs text-white"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <select
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs text-white"
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
            value={dow}
            onChange={(e) => setDow(Number(e.target.value))}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs text-white"
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
            value={dom}
            onChange={(e) => setDom(Number(e.target.value))}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs text-white"
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
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Optional topic hint"
          className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs text-white md:col-span-5"
        />
        <Button size="sm" onClick={addSchedule} disabled={busy || !name} className="bg-brand-gradient text-white shadow-neon">
          {busy ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-1 h-3.5 w-3.5" />}
          Add
        </Button>
      </div>

      {/* Schedule rows */}
      <div className="space-y-2">
        {rows.length === 0 && <p className="text-xs text-white/50">No schedules yet.</p>}
        {rows.map((r) => (
          <div key={r.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/80">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-white">{r.name}</div>
                <div className="mt-0.5 text-[11px] text-white/50">
                  {r.cadence}
                  {r.cadence === "weekly" && r.day_of_week !== null && ` · ${DOW[r.day_of_week]}`}
                  {r.cadence === "monthly" && r.day_of_month !== null && ` · day ${r.day_of_month}`}
                  {` · ${String(r.hour_utc).padStart(2, "0")}:00 UTC`}
                  {r.topic_hint && ` · “${r.topic_hint}”`}
                </div>
                <div className="mt-0.5 text-[10px] text-white/40">
                  Next: {r.next_run_at ? new Date(r.next_run_at).toLocaleString() : "—"}
                  {r.last_run_at && ` · Last: ${new Date(r.last_run_at).toLocaleString()}`}
                </div>
              </div>
              <button
                onClick={() => toggle(r)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.active ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/60"}`}
              >
                {r.active ? "active" : "paused"}
              </button>
              <Button size="sm" variant="outline" onClick={() => toggleHistory(r.id)} className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                <History className="mr-1 h-3.5 w-3.5" />
                History
                {historyOpen[r.id] ? <ChevronUp className="ml-1 h-3.5 w-3.5" /> : <ChevronDown className="ml-1 h-3.5 w-3.5" />}
              </Button>
              <Button size="sm" variant="outline" onClick={() => runNow(r.id)} disabled={runningId === r.id} className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                {runningId === r.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-1 h-3.5 w-3.5" />}
                Run now
              </Button>
              <Button size="sm" variant="outline" onClick={() => remove(r.id)} className="border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {historyOpen[r.id] && (
              <div className="mt-3 rounded-md border border-white/10 bg-black/30 p-2">
                <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wide text-white/50">
                  <span>Send history (last 10)</span>
                  <button onClick={() => loadHistory(r.id)} className="text-white/60 hover:text-white">
                    Refresh
                  </button>
                </div>
                {historyLoading[r.id] && <div className="flex items-center gap-2 text-white/60"><Loader2 className="h-3 w-3 animate-spin" /> Loading…</div>}
                {!historyLoading[r.id] && (historyData[r.id]?.length ?? 0) === 0 && (
                  <p className="text-white/50">No runs yet.</p>
                )}
                {!historyLoading[r.id] && (historyData[r.id]?.length ?? 0) > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-[11px]">
                      <thead className="text-white/50">
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
                            <tr key={run.id} className="border-t border-white/5 align-top">
                              <td className="py-1 pr-3 text-white/70 whitespace-nowrap">{new Date(run.started_at).toLocaleString()}</td>
                              <td className="py-1 pr-3 text-white/60">{run.trigger_source}</td>
                              <td className="py-1 pr-3 text-white/80 truncate max-w-[220px]">{run.title ?? "—"}</td>
                              <td className="py-1 pr-3 text-right text-emerald-300">{run.queued_count}</td>
                              <td className={`py-1 pr-3 text-right ${run.failed_count > 0 ? "text-red-300" : "text-white/60"}`}>{run.failed_count}</td>
                              <td className="py-1 pr-3 text-right text-white/70">{run.recipients_total}</td>
                              <td className="py-1 pr-3">
                                <span className={`rounded px-1.5 py-0.5 text-[10px] ${run.status === "completed" ? "bg-emerald-500/20 text-emerald-300" : run.status === "failed" ? "bg-red-500/20 text-red-300" : "bg-yellow-500/20 text-yellow-200"}`}>
                                  {run.status}
                                </span>
                              </td>
                            </tr>
                            {(run.error_message || run.failed_recipients.length > 0) && (
                              <tr key={`${run.id}-err`} className="border-t border-white/5">
                                <td colSpan={7} className="py-1 pr-3">
                                  {run.error_message && (
                                    <div className="mb-1 text-red-300">Run error: {run.error_message}</div>
                                  )}
                                  {run.failed_recipients.length > 0 && (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-red-300">{run.failed_recipients.length} failed recipient(s)</span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => retryRun(r.id, run.id, run.failed_recipients.length)}
                                          disabled={retryingRunId === run.id}
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
                                      <details className="text-white/70">
                                        <summary className="cursor-pointer text-red-300/80 text-[10px]">Show recipients</summary>
                                        <ul className="mt-1 space-y-0.5 pl-4">
                                          {run.failed_recipients.map((f, i) => (
                                            <li key={i} className="text-[10px]">
                                              <span className="text-white/80">{f.email}</span>
                                              {f.error_message && <span className="text-red-300"> — {f.error_message}</span>}
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

      {msg && <p className="mt-3 text-xs text-emerald-400">{msg}</p>}
      {err && <p className="mt-3 text-xs text-red-400">{err}</p>}
    </div>
  );
}
