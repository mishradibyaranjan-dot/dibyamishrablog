import { useState } from "react";
import { Loader2, Mail } from "lucide-react";

/**
 * Compact newsletter capture used on marketing pages. Posts to the same public
 * endpoint as the footer form.
 */
export function NewsletterCta() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="card-flashy overflow-hidden rounded-3xl glass-strong p-7 sm:p-10">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-chip-border bg-chip px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-chip-foreground">
            <Mail className="h-3.5 w-3.5" />
            Executive Briefing
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Monthly notes on AI, Cloud &amp; Engineering Leadership
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Field-tested architecture patterns, delivery playbooks, and what is
            actually working in enterprise GenAI programs. No fluff, no spam.
          </p>
        </div>

        <form
          className="flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
            const email = input?.value?.trim();
            if (!email) return;
            setStatus("sending");
            setError(null);
            try {
              const res = await fetch("/api/public/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
              if (!res.ok) {
                const b = await res.json().catch(() => ({}));
                throw new Error(b?.error ?? `Failed (${res.status})`);
              }
              setStatus("ok");
              input.value = "";
            } catch (err) {
              setStatus("error");
              setError(err instanceof Error ? err.message : "Subscription failed");
            }
          }}
        >
          <label className="text-sm font-medium text-foreground" htmlFor="newsletter-cta-email">
            Work email
          </label>
          <input
            id="newsletter-cta-email"
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
                <Loader2 className="h-4 w-4 animate-spin" /> Subscribing…
              </>
            ) : (
              "Get the briefing"
            )}
          </button>
          {status === "ok" && (
            <p className="text-xs text-muted-foreground">Thanks — you&apos;re subscribed.</p>
          )}
          {status === "error" && (
            <p className="text-xs text-destructive" role="alert">
              {error ?? "Something went wrong."}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
