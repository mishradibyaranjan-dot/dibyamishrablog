import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin/spam-audit")({
  head: () => ({
    meta: [
      { title: "Spam audit log — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SpamAuditPage,
});

type Row = {
  id: string;
  action_type: string;
  email: string | null;
  domain: string | null;
  reason: string | null;
  actor_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const PAGE_SIZE = 25;

const ACTION_LABELS: Record<string, { label: string; className: string }> = {
  blocked_login_attempt: { label: "Blocked login", className: "bg-red-50 text-red-700 border-red-200" },
  blocklist_add: { label: "Domain added", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  blocklist_remove: { label: "Domain removed", className: "bg-amber-50 text-amber-700 border-amber-200" },
  blocklist_update: { label: "Domain updated", className: "bg-blue-50 text-blue-700 border-blue-200" },
};

function SpamAuditPage() {
  const { isAdmin, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = async () => {
    if (!isAdmin) return;
    setBusy(true);
    setErr(null);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase
      .from("spam_audit_log")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (filter) query = query.eq("action_type", filter);
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
  }, [isAdmin, page, filter]);

  if (loading) {
    return (
      <Section className="pt-16">
        <div className="grid min-h-[40vh] place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      </Section>
    );
  }

  if (!isAdmin) {
    return (
      <Section className="pt-16">
        <div className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-amber-600" />
          <h2 className="mt-3 text-lg font-semibold text-amber-900">Admin only</h2>
          <p className="mt-1 text-sm text-amber-800">You need admin access to view the spam audit log.</p>
        </div>
      </Section>
    );
  }

  return (
    <Section className="pt-16">
      <SectionHeader
        as="h1"
        eyebrow="Admin"
        title="Spam audit log"
        description="Every blocked spam-domain login attempt and admin change to the blocked email domains list."
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(0); }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All actions</option>
          <option value="blocked_login_attempt">Blocked login attempts</option>
          <option value="blocklist_add">Blocklist adds</option>
          <option value="blocklist_remove">Blocklist removes</option>
          <option value="blocklist_update">Blocklist updates</option>
        </select>
        <Button size="sm" variant="outline" onClick={() => void load()} className="border-slate-300">
          <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh
        </Button>
        <p className="ml-auto text-xs text-slate-500">{total} entries</p>
      </div>

      {err && <p className="mt-3 text-xs text-red-600">{err}</p>}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Domain</th>
              <th className="px-4 py-2">Reason</th>
              <th className="px-4 py-2">Actor</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !busy && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                  No audit entries yet.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const meta = ACTION_LABELS[r.action_type] ?? { label: r.action_type, className: "bg-slate-100 text-slate-700 border-slate-200" };
              return (
                <tr key={r.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-2 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.className}`}>
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-700">{r.email ?? "—"}</td>
                  <td className="px-4 py-2 font-medium text-slate-900">{r.domain ?? "—"}</td>
                  <td className="px-4 py-2 text-slate-600">{r.reason ?? "—"}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-slate-500">
                    {r.actor_id ? r.actor_id.slice(0, 8) + "…" : "system"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-1">
        <Button size="sm" variant="outline" disabled={page === 0 || busy} onClick={() => setPage((p) => Math.max(0, p - 1))} className="border-slate-300">
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <span className="px-2 text-xs text-slate-600">Page {page + 1} / {totalPages}</span>
        <Button size="sm" variant="outline" disabled={page + 1 >= totalPages || busy} onClick={() => setPage((p) => p + 1)} className="border-slate-300">
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Section>
  );
}
