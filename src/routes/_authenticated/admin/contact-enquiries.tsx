import { Fragment } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Mail,
  CheckCheck,
  Download,
  RotateCw,
  Send,
  BarChart3,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { replyToEnquiry, retryEnquiryEmails } from "@/lib/contact-admin.functions";

export const Route = createFileRoute("/_authenticated/admin/contact-enquiries")({
  head: () => ({
    meta: [
      { title: "Contact enquiries — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ContactEnquiriesPage,
});

type Row = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  notification_status: string;
  confirmation_status: string;
  error_message: string | null;
  retry_count: number | null;
  last_attempt_at: string | null;
  next_retry_at: string | null;
  replied_at: string | null;
  created_at: string;
};

type Attempt = {
  id: string;
  kind: string;
  recipient_email: string;
  status: string;
  attempt_no: number;
  trigger_source: string;
  error_message: string | null;
  created_at: string;
};

const PAGE_SIZE = 20;

const STATUSES = ["new", "read", "replied", "spam"] as const;

const STATUS_STYLES: Record<string, string> = {
  new: "border-primary/30 bg-primary/10 text-primary",
  read: "border-border bg-muted text-muted-foreground",
  replied: "border-border bg-accent text-accent-foreground",
  spam: "border-destructive/30 bg-destructive/10 text-destructive",
};

const DELIVERY_STYLES: Record<string, string> = {
  sent: "border-border bg-accent text-accent-foreground",
  partial: "border-border bg-muted text-muted-foreground",
  pending: "border-border bg-muted text-muted-foreground",
  failed: "border-destructive/30 bg-destructive/10 text-destructive",
};

const KIND_LABELS: Record<string, string> = {
  "contact-notification": "Owner notification",
  "contact-confirmation": "Requester confirmation",
  "contact-reply": "Admin reply",
};

function Badge({ value, styles }: { value: string; styles: Record<string, string> }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        styles[value] ?? "border-border bg-muted text-muted-foreground"
      }`}
    >
      {value}
    </span>
  );
}

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

function ContactEnquiriesPage() {
  const { isAdmin, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [delivery, setDelivery] = useState("");
  const [days, setDays] = useState("30");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Record<string, Attempt[]>>({});
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [trend, setTrend] = useState<{ day: string; count: number }[]>([]);
  const [topSubjects, setTopSubjects] = useState<{ subject: string; count: number }[]>([]);

  const sendReply = useServerFn(replyToEnquiry);
  const retryEmails = useServerFn(retryEnquiryEmails);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  /** Applies the active filters to a contact_enquiries query builder. */
  const applyFilters = <T extends { eq: any; gte: any; or: any }>(query: T): T => {
    let q: any = query;
    if (status) q = q.eq("status", status);
    if (delivery) q = q.eq("notification_status", delivery);
    if (days !== "all") {
      const since = new Date(Date.now() - Number(days) * 86400000).toISOString();
      q = q.gte("created_at", since);
    }
    if (debounced) {
      const esc = debounced.replace(/[%,]/g, " ");
      q = q.or(
        `name.ilike.%${esc}%,email.ilike.%${esc}%,subject.ilike.%${esc}%,message.ilike.%${esc}%`,
      );
    }
    return q as T;
  };

  const load = async () => {
    if (!isAdmin) return;
    setBusy(true);
    setErr(null);
    const from = page * PAGE_SIZE;
    const query = applyFilters(
      supabase
        .from("contact_enquiries")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1) as any,
    );

    const { data, error, count } = await query;
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setRows((data ?? []) as Row[]);
    setTotal(count ?? 0);
  };

  /** Aggregates volume-by-day and top subjects across all matching rows. */
  const loadAnalytics = async () => {
    if (!isAdmin) return;
    const { data, error } = await applyFilters(
      supabase
        .from("contact_enquiries")
        .select("created_at, subject")
        .order("created_at", { ascending: true })
        .limit(2000) as any,
    );
    if (error || !data) return;
    const byDay = new Map<string, number>();
    const bySubject = new Map<string, number>();
    for (const r of data as { created_at: string; subject: string }[]) {
      const day = new Date(r.created_at).toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
      const key = r.subject?.trim() || "(no subject)";
      bySubject.set(key, (bySubject.get(key) ?? 0) + 1);
    }
    setTrend([...byDay.entries()].map(([day, count]) => ({ day: day.slice(5), count })));
    setTopSubjects(
      [...bySubject.entries()]
        .map(([subject, count]) => ({ subject, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6),
    );
  };

  useEffect(() => {
    void load();
    void loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, page, status, delivery, days, debounced]);

  const loadAttempts = async (id: string) => {
    const { data, error } = await supabase
      .from("contact_email_attempts")
      .select("id, kind, recipient_email, status, attempt_no, trigger_source, error_message, created_at")
      .eq("enquiry_id", id)
      .order("created_at", { ascending: false });
    if (error) {
      setErr(error.message);
      return;
    }
    setAttempts((prev) => ({ ...prev, [id]: (data ?? []) as Attempt[] }));
  };

  const toggleExpanded = (id: string) => {
    const next = expanded === id ? null : id;
    setExpanded(next);
    if (next && !attempts[next]) void loadAttempts(next);
  };

  const updateStatus = async (id: string, next: string) => {
    const { error } = await supabase.from("contact_enquiries").update({ status: next }).eq("id", id);
    if (error) {
      setErr(error.message);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
  };

  const handleRetry = async (id: string) => {
    setActionBusy(`retry-${id}`);
    setErr(null);
    setNotice(null);
    try {
      const result = await retryEmails({ data: { enquiryId: id } });
      setNotice(
        `Retry finished — notification: ${result.notification_status}, confirmation: ${result.confirmation_status}.`,
      );
      await loadAttempts(id);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Retry failed");
    } finally {
      setActionBusy(null);
    }
  };

  const handleReply = async (id: string) => {
    const body = (replyDraft[id] ?? "").trim();
    if (!body) {
      setErr("Write a reply before sending.");
      return;
    }
    setActionBusy(`reply-${id}`);
    setErr(null);
    setNotice(null);
    try {
      const result = await sendReply({ data: { enquiryId: id, body } });
      if (!result.ok) {
        setErr(`Reply could not be sent: ${result.error}`);
        return;
      }
      setNotice(`Reply sent to ${result.recipient}.`);
      setReplyDraft((prev) => ({ ...prev, [id]: "" }));
      await loadAttempts(id);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Reply failed");
    } finally {
      setActionBusy(null);
    }
  };

  /** Exports every row matching the current filters (not just this page). */
  const exportCsv = async () => {
    setExporting(true);
    setErr(null);
    try {
      const { data, error } = await applyFilters(
        supabase
          .from("contact_enquiries")
          .select(
            "created_at, name, email, subject, message, status, notification_status, confirmation_status, retry_count, last_attempt_at, replied_at, error_message",
          )
          .order("created_at", { ascending: false })
          .limit(5000) as any,
      );
      if (error) throw new Error(error.message);
      const headers = [
        "Received",
        "Name",
        "Email",
        "Subject",
        "Message",
        "Status",
        "Notification",
        "Confirmation",
        "Retries",
        "Last attempt",
        "Replied at",
        "Delivery errors",
      ];
      const lines = [headers.map(csvCell).join(",")];
      for (const r of (data ?? []) as Record<string, unknown>[]) {
        lines.push(
          [
            r.created_at,
            r.name,
            r.email,
            r.subject,
            r.message,
            r.status,
            r.notification_status,
            r.confirmation_status,
            r.retry_count,
            r.last_attempt_at,
            r.replied_at,
            r.error_message,
          ]
            .map(csvCell)
            .join(","),
        );
      }
      const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contact-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const summary = useMemo(() => {
    const failed = rows.filter(
      (r) => r.notification_status === "failed" || r.confirmation_status === "failed",
    ).length;
    return { failed };
  }, [rows]);

  if (loading) {
    return (
      <Section className="pt-16">
        <div className="grid min-h-[40vh] place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Section>
    );
  }

  return (
    <Section className="pt-16">
      <SectionHeader
        as="h1"
        eyebrow="Admin"
        title="Contact enquiries"
        description="Every message submitted through the contact form, with owner-notification and requester-confirmation delivery status, automatic retries, and reply history."
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, subject, message"
            className="w-72 rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={delivery}
          onChange={(e) => { setDelivery(e.target.value); setPage(0); }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All deliveries</option>
          <option value="sent">Notified</option>
          <option value="partial">Partially sent</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={days}
          onChange={(e) => { setDays(e.target.value); setPage(0); }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="1">Last 24 hours</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="all">All time</option>
        </select>
        <Button size="sm" variant="outline" onClick={() => { void load(); void loadAnalytics(); }}>
          <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh
        </Button>
        <Button size="sm" variant="outline" onClick={() => void exportCsv()} disabled={exporting}>
          {exporting ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="mr-1 h-3.5 w-3.5" />
          )}
          Export CSV
        </Button>
        <p className="ml-auto text-xs text-muted-foreground">
          {total} enquiries{summary.failed ? ` · ${summary.failed} with delivery issues` : ""}
        </p>
      </div>

      {err && <p className="mt-3 text-xs text-destructive">{err}</p>}
      {notice && <p className="mt-3 text-xs text-primary">{notice}</p>}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BarChart3 className="h-4 w-4 text-primary" /> Enquiry volume by day
          </h2>
          <div className="mt-3 h-52">
            {trend.length === 0 ? (
              <p className="pt-16 text-center text-xs text-muted-foreground">
                No enquiries in this window.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Top subjects</h2>
          {topSubjects.length === 0 ? (
            <p className="mt-6 text-center text-xs text-muted-foreground">Nothing to summarise yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {topSubjects.map((s) => {
                const max = topSubjects[0]?.count ?? 1;
                return (
                  <li key={s.subject}>
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="truncate text-foreground">{s.subject}</span>
                      <span className="shrink-0 text-muted-foreground">{s.count}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${Math.max(6, (s.count / max) * 100)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">From</th>
              <th className="px-4 py-2">Subject</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Notified</th>
              <th className="px-4 py-2">Confirmed</th>
              <th className="px-4 py-2">Retries</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !busy && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  No enquiries match these filters.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <Fragment key={r.id}>
                <tr className="border-t border-border align-top">
                  <td className="whitespace-nowrap px-4 py-2 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-medium text-foreground">{r.name}</div>
                    <a href={`mailto:${r.email}`} className="text-xs text-primary hover:underline">
                      {r.email}
                    </a>
                  </td>
                  <td className="max-w-[18rem] px-4 py-2 text-foreground">{r.subject}</td>
                  <td className="px-4 py-2">
                    <select
                      value={r.status}
                      onChange={(e) => void updateStatus(r.id, e.target.value)}
                      className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <Badge value={r.notification_status} styles={DELIVERY_STYLES} />
                  </td>
                  <td className="px-4 py-2">
                    <Badge value={r.confirmation_status} styles={DELIVERY_STYLES} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-xs text-muted-foreground">
                    {r.retry_count ?? 0}
                    {r.next_retry_at && (
                      <div className="text-[11px]">
                        next {new Date(r.next_retry_at).toLocaleTimeString()}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    <Button size="sm" variant="ghost" onClick={() => toggleExpanded(r.id)}>
                      {expanded === r.id ? "Hide" : "View"}
                    </Button>
                  </td>
                </tr>
                {expanded === r.id && (
                  <tr className="border-t border-border bg-muted/40">
                    <td colSpan={8} className="px-4 py-4">
                      <p className="whitespace-pre-wrap text-sm text-foreground">{r.message}</p>
                      {r.error_message && (
                        <p className="mt-3 text-xs text-destructive">
                          Delivery errors: {r.error_message}
                        </p>
                      )}

                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Reply to {r.email}
                          </h3>
                          <textarea
                            rows={5}
                            value={replyDraft[r.id] ?? ""}
                            onChange={(e) =>
                              setReplyDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
                            }
                            placeholder="Write your reply — it is sent from your notification sender with contactme@dibyamishra.co.in as reply-to."
                            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          />
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() => void handleReply(r.id)}
                              disabled={actionBusy === `reply-${r.id}`}
                            >
                              {actionBusy === `reply-${r.id}` ? (
                                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="mr-1 h-3.5 w-3.5" />
                              )}
                              Send reply
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void handleRetry(r.id)}
                              disabled={actionBusy === `retry-${r.id}`}
                            >
                              {actionBusy === `retry-${r.id}` ? (
                                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <RotateCw className="mr-1 h-3.5 w-3.5" />
                              )}
                              Retry delivery
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <a href={`mailto:${r.email}?subject=Re: ${encodeURIComponent(r.subject)}`}>
                                <Mail className="mr-1 h-3.5 w-3.5" /> Open in mail app
                              </a>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void updateStatus(r.id, "replied")}
                            >
                              <CheckCheck className="mr-1 h-3.5 w-3.5" /> Mark replied
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Delivery &amp; retry history
                          </h3>
                          {!attempts[r.id] ? (
                            <p className="mt-2 text-xs text-muted-foreground">Loading history…</p>
                          ) : attempts[r.id]!.length === 0 ? (
                            <p className="mt-2 text-xs text-muted-foreground">
                              No attempts recorded for this enquiry yet.
                            </p>
                          ) : (
                            <ul className="mt-2 space-y-2">
                              {attempts[r.id]!.map((a) => (
                                <li
                                  key={a.id}
                                  className="rounded-lg border border-border bg-background px-3 py-2 text-xs"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge value={a.status} styles={DELIVERY_STYLES} />
                                    <span className="font-medium text-foreground">
                                      {KIND_LABELS[a.kind] ?? a.kind}
                                    </span>
                                    <span className="text-muted-foreground">→ {a.recipient_email}</span>
                                    <span className="ml-auto text-muted-foreground">
                                      attempt {a.attempt_no} · {a.trigger_source}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-muted-foreground">
                                    {new Date(a.created_at).toLocaleString()}
                                  </div>
                                  {a.error_message && (
                                    <div className="mt-1 text-destructive">{a.error_message}</div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-1">
        <Button
          size="sm"
          variant="outline"
          disabled={page === 0 || busy}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <span className="px-2 text-xs text-muted-foreground">Page {page + 1} / {totalPages}</span>
        <Button
          size="sm"
          variant="outline"
          disabled={page + 1 >= totalPages || busy}
          onClick={() => setPage((p) => p + 1)}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Section>
  );
}
