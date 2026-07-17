import { useEffect, useMemo, useState } from "react";
import { GitCompare, History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listIssueVersions, getIssueVersionsForDiff } from "@/lib/newsletter.functions";

type VersionMeta = {
  id: string;
  version_no: number;
  title: string;
  summary: string;
  snapshot_reason: string;
  status_at_snapshot: string;
  created_by: string | null;
  created_at: string;
};

type VersionFull = VersionMeta & {
  body_markdown: string;
  linkedin_post: string;
  hero_emoji: string;
};

type DiffLine = { kind: "ctx" | "add" | "del"; text: string };

/** Small LCS-based line diff (Myers-style, sufficient for short newsletter drafts). */
function lineDiff(a: string, b: string): DiffLine[] {
  const A = a.split("\n");
  const B = b.split("\n");
  const n = A.length;
  const m = B.length;
  // LCS table
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      out.push({ kind: "ctx", text: A[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ kind: "del", text: A[i] });
      i++;
    } else {
      out.push({ kind: "add", text: B[j] });
      j++;
    }
  }
  while (i < n) out.push({ kind: "del", text: A[i++] });
  while (j < m) out.push({ kind: "add", text: B[j++] });
  return out;
}

export function NewsletterVersionCompare({ issueId }: { issueId: string }) {
  const [versions, setVersions] = useState<VersionMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [aId, setAId] = useState<string>("");
  const [bId, setBId] = useState<string>("");
  const [pair, setPair] = useState<{ a: VersionFull; b: VersionFull } | null>(null);
  const [comparing, setComparing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setErr(null);
    try {
      const rows = (await listIssueVersions({ data: { issueId } })) as VersionMeta[];
      setVersions(rows);
      // Default: newest (0) vs second-newest (1)
      if (rows[0]) setBId(rows[0].id);
      if (rows[1]) setAId(rows[1].id);
      else if (rows[0]) setAId(rows[0].id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    setPair(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueId]);

  const compare = async () => {
    if (!aId || !bId || aId === bId) {
      setErr("Pick two different versions to compare.");
      return;
    }
    setComparing(true);
    setErr(null);
    try {
      const res = (await getIssueVersionsForDiff({
        data: { issueId, aId, bId },
      })) as { a: VersionFull; b: VersionFull };
      // Order so 'a' is always the older version
      const [older, newer] =
        res.a.version_no <= res.b.version_no ? [res.a, res.b] : [res.b, res.a];
      setPair({ a: older, b: newer });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setComparing(false);
    }
  };

  const bodyDiff = useMemo(
    () => (pair ? lineDiff(pair.a.body_markdown, pair.b.body_markdown) : []),
    [pair],
  );
  const linkedinDiff = useMemo(
    () => (pair ? lineDiff(pair.a.linkedin_post, pair.b.linkedin_post) : []),
    [pair],
  );

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <History className="h-4 w-4 text-neon-cyan" />
        Draft versions — compare before approving
      </div>
      <p className="mb-3 text-xs text-white/60">
        Every save, submit, and approval snapshots the issue. Pick two versions to diff title,
        summary, body, and the LinkedIn post before you sign off.
      </p>

      {loading ? (
        <p className="text-xs text-white/50">
          <Loader2 className="mr-1 inline h-3 w-3 animate-spin" /> Loading versions…
        </p>
      ) : versions.length === 0 ? (
        <p className="text-xs text-white/50">
          No snapshots yet. Save the draft to create v1.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-2">
            <VersionSelect
              label="Older (A)"
              value={aId}
              onChange={setAId}
              versions={versions}
            />
            <VersionSelect
              label="Newer (B)"
              value={bId}
              onChange={setBId}
              versions={versions}
            />
            <Button
              size="sm"
              onClick={compare}
              disabled={comparing || !aId || !bId || aId === bId}
              className="bg-brand-gradient text-white shadow-neon"
            >
              {comparing ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <GitCompare className="mr-1 h-3.5 w-3.5" />
              )}
              Compare
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={refresh}
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              Refresh
            </Button>
          </div>

          {err && <p className="mt-2 text-xs text-red-400">{err}</p>}

          {pair && (
            <div className="mt-4 space-y-4">
              <div className="grid gap-2 text-[11px] text-white/70 sm:grid-cols-2">
                <VersionBadge label="A · Older" v={pair.a} />
                <VersionBadge label="B · Newer" v={pair.b} />
              </div>

              <ScalarDiff label="Title" a={pair.a.title} b={pair.b.title} />
              <ScalarDiff label="Summary" a={pair.a.summary} b={pair.b.summary} />
              <ScalarDiff label="Hero emoji" a={pair.a.hero_emoji} b={pair.b.hero_emoji} />

              <DiffBlock title="Body (Markdown)" lines={bodyDiff} />
              <DiffBlock title="LinkedIn post" lines={linkedinDiff} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function VersionSelect({
  label,
  value,
  onChange,
  versions,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  versions: VersionMeta[];
}) {
  return (
    <label className="flex flex-col text-[11px] text-white/60">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 rounded-md border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-white"
      >
        <option value="">— pick version —</option>
        {versions.map((v) => (
          <option key={v.id} value={v.id}>
            v{v.version_no} · {v.snapshot_reason} · {v.status_at_snapshot} ·{" "}
            {new Date(v.created_at).toLocaleString()}
          </option>
        ))}
      </select>
    </label>
  );
}

function VersionBadge({ label, v }: { label: string; v: VersionFull }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
      <div className="font-semibold text-white/85">{label}</div>
      <div>
        v{v.version_no} · {v.snapshot_reason} · {v.status_at_snapshot}
      </div>
      <div className="text-white/50">{new Date(v.created_at).toLocaleString()}</div>
    </div>
  );
}

function ScalarDiff({ label, a, b }: { label: string; a: string; b: string }) {
  const changed = a !== b;
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/60">
        {label}
        {changed ? (
          <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] text-yellow-300">
            changed
          </span>
        ) : (
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">
            unchanged
          </span>
        )}
      </div>
      {changed ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            − {a || <em className="text-red-300/60">(empty)</em>}
          </div>
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            + {b || <em className="text-emerald-300/60">(empty)</em>}
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
          {a || <em className="text-white/40">(empty)</em>}
        </div>
      )}
    </div>
  );
}

function DiffBlock({ title, lines }: { title: string; lines: DiffLine[] }) {
  const adds = lines.filter((l) => l.kind === "add").length;
  const dels = lines.filter((l) => l.kind === "del").length;
  const unchanged = adds === 0 && dels === 0;
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/60">
        {title}
        {unchanged ? (
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">
            unchanged
          </span>
        ) : (
          <>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300">
              +{adds}
            </span>
            <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-300">
              −{dels}
            </span>
          </>
        )}
      </div>
      <pre className="max-h-96 overflow-auto rounded-md border border-white/10 bg-black/40 p-3 font-mono text-[11px] leading-relaxed">
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              l.kind === "add"
                ? "bg-emerald-500/10 text-emerald-200"
                : l.kind === "del"
                  ? "bg-red-500/10 text-red-200"
                  : "text-white/60"
            }
          >
            <span className="mr-2 select-none text-white/40">
              {l.kind === "add" ? "+" : l.kind === "del" ? "−" : " "}
            </span>
            {l.text || " "}
          </div>
        ))}
      </pre>
    </div>
  );
}
