import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Mail,
  CheckCheck,
} from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

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
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = async () => {
    if (!isAdmin) return;
    setBusy(true);
    setErr(null);
    const from = page * PAGE_SIZE;
    let query = supabase
      .from("contact_enquiries")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (status) query = query.eq("status", status);
    if (delivery) query = query.eq("notification_status", delivery);
    if (days !== "all") {
      const since = new Date(Date.now() - Number(days) * 86400000).toISOString();
      query = query.gte("created_at", since);
    }
    if (debounced) {
      const esc = debounced.replace(/[%,]/g, " ");
      query = query.or(
        `name.ilike.%${esc}%,email.ilike.%${esc}%,subject.ilike.%${esc}%,message.ilike.%${esc}%`,
      );
    }

    const { data, error, count } = await query;
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setRows((data ?? []) as Row[]);
    setTotal(count ?? 0);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, page, status, delivery, days, debounced]);

  const updateStatus = async (id: string, next: string) => {
    const { error } = await supabase.from("contact_enquiries").update({ status: next }).eq("id", id);
    if (error) {
      setErr(error.message);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
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
        description="Every message submitted through the contact form, with owner-notification and requester-confirmation delivery status."
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
        <Button size="sm" variant="outline" onClick={() => void load()}>
          <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh
        </Button>
        <p className="ml-auto text-xs text-muted-foreground">
          {total} enquiries{summary.failed ? ` · ${summary.failed} with delivery issues` : ""}
        </p>
      </div>

      {err && <p className="mt-3 text-xs text-destructive">{err}</p>}

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
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !busy && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No enquiries match these filters.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <>
                <tr key={r.id} className="border-t border-border align-top">
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
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    >
                      {expanded === r.id ? "Hide" : "View"}
                    </Button>
                  </td>
                </tr>
                {expanded === r.id && (
                  <tr key={`${r.id}-detail`} className="border-t border-border bg-muted/40">
                    <td colSpan={7} className="px-4 py-4">
                      <p className="whitespace-pre-wrap text-sm text-foreground">{r.message}</p>
                      {r.error_message && (
                        <p className="mt-3 text-xs text-destructive">
                          Delivery errors: {r.error_message}
                        </p>
                      )}
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={`mailto:${r.email}?subject=Re: ${encodeURIComponent(r.subject)}`}>
                            <Mail className="mr-1 h-3.5 w-3.5" /> Reply
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => void updateStatus(r.id, "replied")}>
                          <CheckCheck className="mr-1 h-3.5 w-3.5" /> Mark replied
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
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
