import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, ShieldAlert, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { refreshBlockedDomains } from "@/lib/blocked-domains";

export const Route = createFileRoute("/_authenticated/admin/blocked-domains")({
  head: () => ({
    meta: [
      { title: "Blocked email domains — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BlockedDomainsAdmin,
});

type Row = {
  id: string;
  domain: string;
  reason: string | null;
  created_at: string;
  created_by: string | null;
};

const PAGE_SIZE = 20;

// RFC-lite domain validation: labels 1-63 chars, ASCII letters/digits/hyphens,
// at least one dot, TLD >= 2 chars.
const DOMAIN_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

function normalizeDomain(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@/, "").replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

function BlockedDomainsAdmin() {
  const { isAdmin, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [newDomain, setNewDomain] = useState("");
  const [newReason, setNewReason] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = async () => {
    if (!isAdmin) return;
    setBusy(true);
    setErr(null);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase
      .from("blocked_email_domains")
      .select("id, domain, reason, created_at, created_by", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    const search = q.trim().toLowerCase();
    if (search) query = query.ilike("domain", `%${search}%`);
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
  }, [isAdmin, page]);

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    const domain = normalizeDomain(newDomain);
    if (!DOMAIN_RE.test(domain)) {
      setErr("Enter a valid domain, e.g. example.com");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("blocked_email_domains")
      .insert({ domain, reason: newReason.trim() || null });
    setBusy(false);
    if (error) {
      setErr(error.message.includes("duplicate") ? "That domain is already blocked." : error.message);
      return;
    }
    setInfo(`Blocked ${domain}`);
    setNewDomain("");
    setNewReason("");
    void refreshBlockedDomains(true);
    setPage(0);
    void load();
  };

  const remove = async (row: Row) => {
    if (!confirm(`Unblock ${row.domain}?`)) return;
    setBusy(true);
    setErr(null);
    const { error } = await supabase.from("blocked_email_domains").delete().eq("id", row.id);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setInfo(`Removed ${row.domain}`);
    void refreshBlockedDomains(true);
    void load();
  };

  const showing = useMemo(() => {
    if (total === 0) return "0";
    const from = page * PAGE_SIZE + 1;
    const to = Math.min(total, (page + 1) * PAGE_SIZE);
    return `${from}–${to} of ${total}`;
  }, [page, total]);

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
          <p className="mt-1 text-sm text-amber-800">You need admin access to manage blocked domains.</p>
        </div>
      </Section>
    );
  }

  return (
    <Section className="pt-16">
      <SectionHeader
        as="h1"
        eyebrow="Admin"
        title="Blocked email domains"
        description="Add or remove spam and disposable email domains. Changes take effect immediately across sign-up, sign-in, contact, and newsletter forms."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        {/* Add form */}
        <form onSubmit={addDomain} className="card-flashy space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Block a domain</h3>
          <div>
            <label className="text-xs font-medium text-slate-600" htmlFor="new-domain">Domain</label>
            <input
              id="new-domain"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="example.com"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600" htmlFor="new-reason">Reason (optional)</label>
            <input
              id="new-reason"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Spam signups"
              maxLength={200}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          {err && <p className="text-xs text-red-600">{err}</p>}
          {info && <p className="text-xs text-emerald-600">{info}</p>}
          <Button type="submit" disabled={busy} className="w-full bg-slate-900 text-white hover:bg-slate-800">
            {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
            Block domain
          </Button>
        </form>

        {/* List + search + pagination */}
        <div className="card-flashy rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Blocked list</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { setPage(0); void load(); }
                  }}
                  placeholder="Search domain…"
                  className="w-48 rounded-md border border-slate-300 bg-white py-1.5 pl-7 pr-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <Button size="sm" variant="outline" onClick={() => { setPage(0); void load(); }} className="border-slate-300">
                Search
              </Button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-3">Domain</th>
                  <th className="py-2 pr-3">Reason</th>
                  <th className="py-2 pr-3">Added</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && !busy && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-slate-500">
                      No blocked domains found.
                    </td>
                  </tr>
                )}
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-medium text-slate-900">{row.domain}</td>
                    <td className="py-2 pr-3 text-slate-600">{row.reason ?? "—"}</td>
                    <td className="py-2 pr-3 text-xs text-slate-500">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => void remove(row)}
                        disabled={busy}
                        aria-label={`Remove ${row.domain}`}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
            <p className="text-xs text-slate-500">Showing {showing}</p>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0 || busy}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="border-slate-300"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <span className="px-2 text-xs text-slate-600">
                Page {page + 1} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page + 1 >= totalPages || busy}
                onClick={() => setPage((p) => p + 1)}
                className="border-slate-300"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
