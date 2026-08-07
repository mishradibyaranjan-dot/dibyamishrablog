import { useState } from "react";
import { Download, Loader2, Lock, Sparkles } from "lucide-react";

interface LeadMagnetProps {
  /** Short eyebrow label above the headline. */
  eyebrow?: string;
  title: string;
  description: string;
  /** What the reader unlocks — rendered as a checklist. */
  includes?: string[];
  /** Where to send the reader after they subscribe. */
  downloadHref: string;
  downloadLabel?: string;
  /** Tag stored with the subscription so sources can be attributed. */
  source: string;
}

/**
 * Email-gated lead magnet. Subscribes the reader to the executive briefing and
 * then reveals the download link. Purely presentational + the existing public
 * newsletter endpoint — no new backend surface.
 */
export function LeadMagnet({
  eyebrow = "Free download",
  title,
  description,
  includes = [],
  downloadHref,
  downloadLabel = "Download the playbook (PDF)",
  source,
}: LeadMagnetProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "unlocked" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="card-flashy overflow-hidden rounded-3xl glass-strong p-7 sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-chip-border bg-chip px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-chip-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">{description}</p>

          {includes.length > 0 && (
            <ul className="mt-5 space-y-2">
              {includes.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gradient" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {status === "unlocked" ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-chip-border bg-chip p-5">
            <p className="text-sm font-semibold text-foreground">You&apos;re in — here it is.</p>
            <p className="text-sm text-muted-foreground">
              The briefing will land in your inbox monthly. Download your copy below.
            </p>
            <a
              href={downloadHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4" /> {downloadLabel}
            </a>
          </div>
        ) : (
          <form
            className="flex flex-col gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem("email") as HTMLInputElement | null;
              const email = input?.value?.trim();
              if (!email) return;
              setStatus("sending");
              setError(null);
              try {
                const res = await fetch("/api/public/newsletter", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, source }),
                });
                if (!res.ok) {
                  const body = await res.json().catch(() => ({}));
                  throw new Error(body?.error ?? `Failed (${res.status})`);
                }
                setStatus("unlocked");
              } catch (err) {
                setStatus("error");
                setError(err instanceof Error ? err.message : "Something went wrong.");
              }
            }}
          >
            <label className="text-sm font-medium text-foreground" htmlFor={`lead-${source}`}>
              Work email
            </label>
            <input
              id={`lead-${source}`}
              name="email"
              type="email"
              required
              disabled={status === "sending"}
              placeholder="you@company.com"
              className="min-h-11 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {status === "sending" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Unlocking…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Unlock the download
                </>
              )}
            </button>
            <p className="text-xs text-muted-foreground">
              One monthly briefing. No spam, unsubscribe any time.
            </p>
            {status === "error" && (
              <p className="text-xs text-destructive" role="alert">
                {error ?? "Something went wrong."}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
