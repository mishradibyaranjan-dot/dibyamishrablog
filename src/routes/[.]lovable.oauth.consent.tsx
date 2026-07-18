import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase;

function pickRedirect(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;
  const url = d.redirect_url ?? d.redirect_to;
  return typeof url === "string" ? url : undefined;
}
function pickClient(data: unknown): { name?: string; redirect_uri?: string } | null {
  if (!data || typeof data !== "object") return null;
  const c = (data as Record<string, unknown>).client;
  return c && typeof c === "object" ? (c as { name?: string; redirect_uri?: string }) : null;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Authorize app — Dibya Ranjan Mishra" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { redirect: next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await sb.auth.oauth.getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = pickRedirect(data);
    if (immediate && !pickClient(data)) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-lg p-8 text-slate-900">
      <h1 className="text-xl font-bold">Authorization error</h1>
      <p className="mt-3 text-sm text-slate-600">
        Could not load this authorization request: {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState<"approve" | "deny" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(approve ? "approve" : "deny");
    setError(null);
    const { data, error } = approve
      ? await sb.auth.oauth.approveAuthorization(authorization_id)
      : await sb.auth.oauth.denyAuthorization(authorization_id);
    if (error) {
      setBusy(null);
      setError(error.message);
      return;
    }
    const target = pickRedirect(data);
    if (!target) {
      setBusy(null);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "an app";
  const redirectUri = details?.client?.redirect_uri;

  return (
    <main className="mx-auto max-w-lg p-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">
          Connect {clientName} to Dibya Ranjan Mishra
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          This will let <span className="font-semibold text-slate-900">{clientName}</span> call this
          site's MCP tools as you — reading published newsletters, your profile, and your recent
          page visits. It does not bypass this app's permissions or backend policies.
        </p>

        {redirectUri && (
          <p className="mt-3 truncate text-xs text-slate-500" title={redirectUri}>
            Redirect: <code>{redirectUri}</code>
          </p>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            disabled={busy !== null}
            onClick={() => decide(true)}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {busy === "approve" ? "Approving…" : "Approve"}
          </button>
          <button
            disabled={busy !== null}
            onClick={() => decide(false)}
            className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
          >
            {busy === "deny" ? "Cancelling…" : "Cancel connection"}
          </button>
        </div>
      </div>
    </main>
  );
}
