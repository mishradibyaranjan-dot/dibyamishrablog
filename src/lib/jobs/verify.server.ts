import { approvedDestination, canonicalApplication } from "./verification";

export async function verifyApplication(url: string, provider: string, board: string | null) {
  let target = url;
  for (let redirects = 0; redirects <= 3; redirects++) {
    if (!approvedDestination(target, provider, board, url)) return { ok: false, status: null, finalUrl: target, evidence: "Application destination is not an approved provider/board address" };
    try {
      const response = await fetch(target, { redirect: "manual", signal: AbortSignal.timeout(8000), headers: { "User-Agent": "DibyaMishraJobs/1.0 (+https://www.dibyamishra.co.in/jobs/sources)" } });
      if ([301,302,303,307,308].includes(response.status)) {
        const location = response.headers.get("location");
        await response.body?.cancel();
        if (!location) return { ok: false, status: response.status, finalUrl: target, evidence: "Redirect without a destination" };
        // Adzuna's live listing redirects onward to the employer; an active redirect is the evidence (the employer host is not fetched).
        if (provider === "adzuna") { const next = new URL(location, target); if (next.protocol === "https:" && !/adzuna\./.test(next.hostname)) return { ok: true, status: response.status, finalUrl: canonicalApplication(target), evidence: "Listed in the Adzuna API with an active redirect to the employer" }; }
        target = new URL(location, target).toString(); continue;
      }
      if (!response.ok) { await response.body?.cancel(); return { ok: false, status: response.status, finalUrl: target, evidence: `Application link returned HTTP ${response.status}` }; }
      const reader = response.body?.getReader();
      let html = "";
      if (reader) { const decoder = new TextDecoder(); while (html.length < 250_000) { const chunk = await reader.read(); if (chunk.done) break; html += decoder.decode(chunk.value, { stream: true }); } await reader.cancel(); }
      if (/job (is no longer|has been closed|not found)|position (has been filled|is no longer)|no longer accepting applications/i.test(html)) return { ok: false, status: response.status, finalUrl: target, evidence: "Provider reports the position is unavailable" };
      return { ok: true, status: response.status, finalUrl: canonicalApplication(target), evidence: "Present in the authorized provider feed; approved application link accessible with no closed-position marker" };
    } catch {
      return { ok: false, status: null, finalUrl: target, evidence: "Live application check was inconclusive or timed out" };
    }
  }
  return { ok: false, status: null, finalUrl: target, evidence: "Too many application redirects" };
}