import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import {
  listSecurityEvents,
  listIpBlocks,
  unblockIp,
} from "@/lib/security-events.functions";

export const Route = createFileRoute("/_authenticated/admin/security-events")({
  head: () => ({
    meta: [
      { title: "Security Events — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SecurityEventsAdmin,
});

const SEVERITIES = ["all", "critical", "medium", "low"] as const;
type SeverityFilter = (typeof SEVERITIES)[number];

function SecurityEventsAdmin() {
  const [page, setPage] = useState(0);
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [eventType, setEventType] = useState("");
  const qc = useQueryClient();

  const eventsQ = useQuery({
    queryKey: ["security-events", page, severity, eventType],
    queryFn: () =>
      listSecurityEvents({
        data: {
          page,
          pageSize: 50,
          severity,
          eventType: eventType.trim() || undefined,
        },
      }),
  });

  const blocksQ = useQuery({
    queryKey: ["ip-blocks"],
    queryFn: () => listIpBlocks(),
  });

  const unblock = useMutation({
    mutationFn: (ip: string) => unblockIp({ data: { ip } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ip-blocks"] });
      qc.invalidateQueries({ queryKey: ["security-events"] });
    },
  });

  const summary = eventsQ.data?.summary ?? { low: 0, medium: 0, critical: 0 };
  const totalPages = Math.max(1, Math.ceil((eventsQ.data?.count ?? 0) / 50));

  return (
    <Section className="pt-20 lg:pt-28">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header>
          <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Security events
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Failed logins, scanner probes, IP blocks and other security signals from the last 24
            hours + full history.
          </p>
        </header>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Critical (24h)" value={summary.critical} tone="critical" />
          <Stat label="Medium (24h)" value={summary.medium} tone="medium" />
          <Stat label="Low (24h)" value={summary.low} tone="low" />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {SEVERITIES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSeverity(s);
                  setPage(0);
                }}
                className={`rounded-full px-3 py-1 text-xs ${
                  severity === s
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 text-slate-700"
                }`}
              >
                {s}
              </button>
            ))}
            <input
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value);
                setPage(0);
              }}
              placeholder="Filter by event_type…"
              className="ml-auto rounded-md border border-slate-200 px-3 py-1 text-xs"
            />
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">Severity</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">IP</th>
                  <th className="py-2 pr-3">User</th>
                  <th className="py-2 pr-3">Target</th>
                  <th className="py-2 pr-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(eventsQ.data?.rows ?? []).map((r) => (
                  <tr key={r.id as string}>
                    <td className="py-2 pr-3 font-mono">
                      {new Date(r.created_at as string).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3">
                      <SeverityChip s={r.severity as SeverityFilter} />
                    </td>
                    <td className="py-2 pr-3">{r.event_type as string}</td>
                    <td className="py-2 pr-3 font-mono">{(r.ip_address as string) ?? "—"}</td>
                    <td className="py-2 pr-3">{(r.user_email as string) ?? "—"}</td>
                    <td className="py-2 pr-3">{(r.target_path as string) ?? "—"}</td>
                    <td className="py-2 pr-3 text-slate-500">
                      {(r.action_taken as string) ?? "—"}
                    </td>
                  </tr>
                ))}
                {(eventsQ.data?.rows.length ?? 0) === 0 && !eventsQ.isLoading && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      No events match the filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page {page + 1} / {totalPages} · {eventsQ.data?.count ?? 0} events
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-slate-900">Active IP blocks</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2 pr-3">IP</th>
                  <th className="py-2 pr-3">Reason</th>
                  <th className="py-2 pr-3">Severity</th>
                  <th className="py-2 pr-3">Blocked</th>
                  <th className="py-2 pr-3">Expires</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(blocksQ.data?.rows ?? []).map((b) => (
                  <tr key={b.id as string}>
                    <td className="py-2 pr-3 font-mono">{b.ip_address as string}</td>
                    <td className="py-2 pr-3">{b.reason as string}</td>
                    <td className="py-2 pr-3">
                      <SeverityChip s={b.severity as SeverityFilter} />
                    </td>
                    <td className="py-2 pr-3 font-mono">
                      {new Date(b.created_at as string).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 font-mono">
                      {b.expires_at
                        ? new Date(b.expires_at as string).toLocaleString()
                        : "never"}
                    </td>
                    <td className="py-2 pr-3">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={unblock.isPending}
                        onClick={() => unblock.mutate(b.ip_address as string)}
                      >
                        Unblock
                      </Button>
                    </td>
                  </tr>
                ))}
                {(blocksQ.data?.rows.length ?? 0) === 0 && !blocksQ.isLoading && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No active blocks.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "low" | "medium" | "critical";
}) {
  const color =
    tone === "critical"
      ? "text-red-600"
      : tone === "medium"
        ? "text-orange-600"
        : "text-sky-600";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`mt-1 font-display text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function SeverityChip({ s }: { s: SeverityFilter }) {
  const cls =
    s === "critical"
      ? "bg-red-100 text-red-700"
      : s === "medium"
        ? "bg-orange-100 text-orange-700"
        : "bg-sky-100 text-sky-700";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{s}</span>;
}
