import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";

/**
 * Lightweight math-based CAPTCHA fallback used to slow automated abuse
 * after repeated failed submissions. No external service / key required.
 */

function keyFor(name: string) {
  return `captcha:fail:${name}`;
}

function readFailures(name: string): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(keyFor(name));
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function useCaptchaGate(name: string, threshold = 3) {
  const [failures, setFailures] = useState(0);
  const [verified, setVerified] = useState(false);

  // Hydrate after mount to avoid SSR mismatch.
  useEffect(() => {
    setFailures(readFailures(name));
  }, [name]);

  const recordFailure = useCallback(() => {
    setFailures((prev) => {
      const next = prev + 1;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(keyFor(name), String(next));
      }
      return next;
    });
    setVerified(false);
  }, [name]);

  const reset = useCallback(() => {
    setFailures(0);
    setVerified(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(keyFor(name));
    }
  }, [name]);

  const required = failures >= threshold;

  return {
    required,
    verified,
    failures,
    threshold,
    recordFailure,
    reset,
    markVerified: () => setVerified(true),
    canSubmit: !required || verified,
  };
}

type MathCaptchaProps = {
  onSolved: () => void;
  onFailed?: () => void;
  verified: boolean;
};

/** Simple, accessible math CAPTCHA. */
export function MathCaptcha({ onSolved, onFailed, verified }: MathCaptchaProps) {
  const [seed, setSeed] = useState(0);
  const [answer, setAnswer] = useState("");
  const [err, setErr] = useState<string | null>(null);

  // Regenerate after hydration so SSR/client agree on initial (0,0).
  useEffect(() => {
    setSeed((s) => s + 1);
  }, []);

  const challenge = useMemo(() => {
    // Deterministic per-seed, but effectively random for the user.
    const a = 1 + ((seed * 9301 + 49297) % 9);
    const b = 1 + ((seed * 233280 + 12345) % 9);
    return { a, b, sum: a + b };
  }, [seed]);

  const regenerate = () => {
    setSeed((s) => s + 1);
    setAnswer("");
    setErr(null);
  };

  const check = () => {
    const n = parseInt(answer.trim(), 10);
    if (!Number.isFinite(n)) {
      setErr("Enter a number");
      onFailed?.();
      return;
    }
    if (n === challenge.sum) {
      setErr(null);
      onSolved();
    } else {
      setErr("Incorrect — try again");
      onFailed?.();
      regenerate();
    }
  };

  if (verified) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
        <ShieldCheck className="h-4 w-4" /> Verified — you may submit
      </div>
    );
  }

  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
      <p className="mb-2 text-xs font-medium text-amber-900">
        Security check — please answer to continue.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-800" aria-live="polite">
          {challenge.a} + {challenge.b} =
        </span>
        <input
          type="number"
          inputMode="numeric"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              check();
            }
          }}
          aria-label="CAPTCHA answer"
          className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
        <button
          type="button"
          onClick={check}
          className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
        >
          Verify
        </button>
        <button
          type="button"
          onClick={regenerate}
          aria-label="New challenge"
          className="rounded-md border border-slate-300 bg-white p-1 text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}
