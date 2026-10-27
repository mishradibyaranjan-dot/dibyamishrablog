import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/layout/Section";
import { JobsHero } from "@/components/jobs/JobsDirectory";
import { jobsHead } from "@/components/jobs/jobs-head";
import { listSources } from "@/lib/jobs/jobs.functions";

const LABEL: Record<string, string> = {
  connected: "Connected", pending_credentials: "Pending credentials", api_restricted: "API access restricted",
  not_supported: "Not supported", unavailable: "Temporarily unavailable",
};

export const Route = createFileRoute("/jobs/sources")({
  loader: () => listSources(),
  head: () => jobsHead("/jobs/sources", "Job Sources & Integration Status — Verified Jobs", "Every job source we use, its official feed, and its live connection status — including boards we cannot yet connect.", [{ name: "Sources", path: "/jobs/sources" }]),
  errorComponent: () => <Section>Could not load sources.</Section>,
  component: Page,
});

function Page() {
  const sources = Route.useLoaderData();
  return (
    <Section className="pt-14">
      <JobsHero title="Job Sources" subtitle="We only use official, documented feeds. Boards that need a partnership are listed honestly as not yet connected." />
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase"><tr><th className="p-3">Source</th><th className="p-3">Feed</th><th className="p-3">Status</th><th className="p-3">Last synced</th><th className="p-3">Notes</th></tr></thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.name} className="border-t border-border">
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3 capitalize">{s.provider === "partner" ? "—" : s.provider}</td>
                <td className="p-3">{LABEL[s.status] ?? s.status}</td>
                <td className="p-3">{s.last_synced_at ? new Date(s.last_synced_at).toLocaleString() : "—"}</td>
                <td className="p-3 text-muted-foreground">{s.terms_note}{s.provider !== "partner" ? ` · checked every ${s.poll_minutes} min` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Remote OK listings are provided by <a className="text-primary underline" href="https://remoteok.com" target="_blank" rel="noopener">Remote OK</a>.</p>
    </Section>
  );
}
