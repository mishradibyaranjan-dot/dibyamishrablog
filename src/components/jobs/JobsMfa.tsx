import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const errorMessage = (e: unknown, fallback: string) => e && typeof e === "object" && "message" in e && typeof e.message === "string" && e.message !== "{}" ? e.message : fallback;

export function JobsMfa({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);
  const [factorId, setFactorId] = useState("");
  const [qr, setQr] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const check = async () => {
    const [level, factors] = await Promise.all([supabase.auth.mfa.getAuthenticatorAssuranceLevel(), supabase.auth.mfa.listFactors()]);
    if (level.error || factors.error) { setError("Could not check two-step verification. Please reload."); setChecked(true); return; }
    setReady(level.data?.currentLevel === "aal2");
    setFactorId(factors.data?.totp.find((f) => f.status === "verified")?.id ?? "");
    setChecked(true);
  };
  useEffect(() => { void check(); }, []);
  if (ready) return <>{children}</>;
  if (!checked) return <p role="status" className="p-8">Checking two-step verification…</p>;
  return <section className="mx-auto max-w-md space-y-4 px-6 py-16">
    <ShieldCheck className="h-8 w-8 text-primary" /><h1 className="font-display text-2xl font-semibold">Verify administrator access</h1>
    {!factorId ? <Button disabled={busy} onClick={async () => {
      setBusy(true); setError("");
      try {
        const list = await supabase.auth.mfa.listFactors();
        if (list.error) throw list.error;
        for (const f of list.data.all.filter((f) => f.factor_type === "totp" && f.status === "unverified")) await supabase.auth.mfa.unenroll({ factorId: f.id });
        const r = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Jobs administrator" });
        if (r.error) throw r.error;
        setFactorId(r.data.id); setQr(r.data.totp.qr_code);
      } catch (e) { setError(errorMessage(e, "Authenticator setup requires a fresh sign-in. Sign out and sign in again, then retry.")); } finally { setBusy(false); }
    }}>Set up authenticator</Button> : <>
      {qr && <><p className="text-muted-foreground">Scan with your authenticator app, then enter its six-digit code.</p><img src={qr} alt="Authenticator setup QR code" className="h-56 w-56" /></>}
      <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setError(""); try {
        const r = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
        if (r.error) throw r.error;
        setQr(""); setCode(""); await check();
      } catch (e) { setError(errorMessage(e, "Verification failed. Check the code and try again.")); } finally { setBusy(false); } }}>
        <label className="block space-y-2">Authenticator code<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="w-full rounded border border-input bg-background px-3 py-2" /></label>
        <Button disabled={busy} type="submit">{busy ? "Verifying…" : "Verify"}</Button>
      </form>
    </>}{error && <p role="alert" className="text-destructive">{error}</p>}
  </section>;
}