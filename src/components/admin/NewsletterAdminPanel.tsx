import { useEffect, useState } from "react";
import { Mail, Sparkles, Send, Copy, Loader2, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateNewsletterDraft,
  saveNewsletterIssue,
  listAllIssues,
  publishNewsletterIssue,
  submitForApproval,
  approveNewsletterIssue,
} from "@/lib/newsletter.functions";
import { NewsletterVersionCompare } from "./NewsletterVersionCompare";

type IssueRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body_markdown?: string;
  linkedin_post?: string;
  hero_emoji?: string;
  status: string;
  approved_at: string | null;
  approved_by: string | null;
  published_at: string | null;
  linkedin_posted_at: string | null;
  emails_sent_at: string | null;
  created_at: string;
};

export function NewsletterAdminPanel() {
  const [issues, setIssues] = useState<IssueRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [approving, setApproving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [id, setId] = useState<string | undefined>();
  const [status, setStatus] = useState<string>("draft");
  const [approvedAt, setApprovedAt] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [emoji, setEmoji] = useState("📰");
  const [topicHint, setTopicHint] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listAllIssues();
      setIssues(data as IssueRow[]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const loadIssue = (it: IssueRow) => {
    setId(it.id);
    setStatus(it.status);
    setApprovedAt(it.approved_at);
    setTitle(it.title);
    setSummary(it.summary);
    setBody(it.body_markdown ?? "");
    setLinkedin(it.linkedin_post ?? "");
    setEmoji(it.hero_emoji ?? "📰");
    setMsg(`Loaded "${it.title}" (${it.status}).`);
    setErr(null);
  };

  const doGenerate = async () => {
    setErr(null);
    setMsg(null);
    setGenerating(true);
    try {
      const draft = await generateNewsletterDraft({ data: { topicHint: topicHint || undefined } });
      setId(undefined);
      setStatus("draft");
      setApprovedAt(null);
      setTitle(draft.title);
      setSummary(draft.summary);
      setBody(draft.body_markdown);
      setLinkedin(draft.linkedin_post);
      setMsg("Draft generated. Review, save, then submit for approval.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  const doSave = async () => {
    setErr(null);
    setMsg(null);
    setSaving(true);
    try {
      const row = await saveNewsletterIssue({
        data: { id, title, summary, body_markdown: body, linkedin_post: linkedin, hero_emoji: emoji },
      });
      const r = row as IssueRow;
      setId(r.id);
      setStatus(r.status);
      setApprovedAt(r.approved_at);
      setMsg("Saved. Any edits reset approval — submit again for approval when ready.");
      refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const doSubmit = async () => {
    if (!id) return setErr("Save the issue first.");
    setErr(null);
    setMsg(null);
    setApproving(true);
    try {
      await submitForApproval({ data: { id } });
      setStatus("pending_approval");
      setApprovedAt(null);
      setMsg("Submitted for approval. Click Approve to sign off.");
      refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setApproving(false);
    }
  };

  const doApprove = async () => {
    if (!id) return setErr("Save the issue first.");
    setErr(null);
    setMsg(null);
    setApproving(true);
    try {
      await approveNewsletterIssue({ data: { id } });
      setStatus("approved");
      setApprovedAt(new Date().toISOString());
      setMsg("Approved & signed off by you. Ready to publish.");
      refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setApproving(false);
    }
  };

  const doPublish = async (sendEmails: boolean, postToLinkedIn: boolean) => {
    if (!id) return setErr("Save the issue first.");
    if (!approvedAt && status !== "approved" && status !== "published") {
      return setErr("Approval required. Click Approve & sign-off first.");
    }
    setErr(null);
    setMsg(null);
    setPublishing(true);
    try {
      const r = (await publishNewsletterIssue({ data: { id, sendEmails, postToLinkedIn } })) as {
        emailsQueued: number;
        emailErrors: number;
        linkedInPosted: boolean;
        linkedInError?: string;
      };
      const parts = [
        `Published.`,
        sendEmails ? `Emails queued: ${r.emailsQueued} (errors: ${r.emailErrors}).` : "",
        postToLinkedIn
          ? r.linkedInPosted
            ? "LinkedIn: posted."
            : `LinkedIn: NOT posted — ${r.linkedInError ?? "unknown"}.`
          : "",
      ]
        .filter(Boolean)
        .join(" ");
      setStatus("published");
      setMsg(parts);
      refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setPublishing(false);
    }
  };

  const copyLi = async () => {
    try {
      await navigator.clipboard.writeText(linkedin);
      setMsg("LinkedIn text copied.");
    } catch {
      setErr("Copy failed");
    }
  };

  const isApproved = !!approvedAt && (status === "approved" || status === "published");

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <Mail className="h-4 w-4 text-neon-cyan" />
        Newsletter — Compose · Approve · Publish
      </div>
      <p className="mb-4 text-xs text-white/60">
        Nothing goes out until you sign off. Drafts (including the monthly AI-generated one) sit in
        <span className="mx-1 rounded bg-yellow-500/20 px-1.5 py-0.5 font-semibold text-yellow-300">pending_approval</span>
        until you click <span className="font-semibold text-emerald-300">Approve</span>. Only then can this panel email subscribers or post to LinkedIn.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={topicHint}
              onChange={(e) => setTopicHint(e.target.value)}
              placeholder="Optional topic hint (e.g. 'agentic RAG in retail')"
              className="flex-1 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40"
            />
            <Button size="sm" onClick={doGenerate} disabled={generating} className="bg-brand-gradient text-white shadow-neon">
              {generating ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1 h-3.5 w-3.5" />}
              Generate with AI
            </Button>
          </div>

          {id && (
            <div className="mb-2 flex flex-wrap items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/70">
              <StatusPill status={status} />
              {approvedAt ? (
                <span className="inline-flex items-center gap-1 text-emerald-300">
                  <ShieldCheck className="h-3 w-3" /> Signed off {new Date(approvedAt).toLocaleString()}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-yellow-300">
                  <Clock className="h-3 w-3" /> Awaiting your sign-off
                </span>
              )}
            </div>
          )}

          <label className="mt-2 block text-xs text-white/60">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
          />
          <div className="mt-2 grid grid-cols-[1fr_80px] gap-2">
            <div>
              <label className="block text-xs text-white/60">Summary</label>
              <input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60">Emoji</label>
              <input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
                className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-center text-lg text-white"
              />
            </div>
          </div>

          <label className="mt-2 block text-xs text-white/60">
            Body (Markdown — use ## H2 and "- " bullets)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 font-mono text-xs text-white"
          />

          <label className="mt-2 block text-xs text-white/60">LinkedIn post</label>
          <textarea
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            rows={6}
            className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs text-white"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={doSave} disabled={saving || !title || !body} variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
              {saving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
              {id ? "Update draft" : "Save draft"}
            </Button>
            <Button size="sm" onClick={doSubmit} disabled={approving || !id || isApproved} variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
              Submit for approval
            </Button>
            <Button size="sm" onClick={doApprove} disabled={approving || !id || isApproved} className="bg-emerald-500 text-white hover:bg-emerald-600">
              {approving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="mr-1 h-3.5 w-3.5" />}
              Approve & sign off
            </Button>
            <Button
              size="sm"
              onClick={() => doPublish(true, true)}
              disabled={publishing || !id || !isApproved}
              className="bg-brand-gradient text-white shadow-neon disabled:opacity-40"
              title={isApproved ? "Publish, email subscribers, post to LinkedIn" : "Approve the issue first"}
            >
              {publishing ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1 h-3.5 w-3.5" />}
              Publish + Email + LinkedIn
            </Button>
            <Button size="sm" onClick={() => doPublish(true, false)} disabled={publishing || !id || !isApproved} variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
              Publish + Email only
            </Button>
            <Button size="sm" onClick={copyLi} disabled={!linkedin} variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
              <Copy className="mr-1 h-3.5 w-3.5" /> Copy LinkedIn
            </Button>
          </div>
          {msg && <p className="mt-3 text-xs text-emerald-400">{msg}</p>}
          {err && <p className="mt-3 text-xs text-red-400">{err}</p>}
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">
            Recent issues
          </div>
          <div className="max-h-[560px] space-y-2 overflow-y-auto pr-2">
            {loading && <p className="text-xs text-white/50">Loading…</p>}
            {!loading && issues.length === 0 && <p className="text-xs text-white/50">No issues yet.</p>}
            {issues.map((it) => (
              <div key={it.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/80">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-white">{it.title}</div>
                    <div className="mt-0.5 truncate text-white/50">/{it.slug}</div>
                  </div>
                  <StatusPill status={it.status} />
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-white/50">
                  {it.approved_at && <span className="text-emerald-300">✓ Approved</span>}
                  {it.published_at && <span>· Pub {new Date(it.published_at).toLocaleDateString()}</span>}
                  {it.emails_sent_at && <span>· Emailed</span>}
                  {it.linkedin_posted_at && <span>· LinkedIn ✓</span>}
                </div>
                <button onClick={() => loadIssue(it)} className="mt-2 text-[11px] text-neon-cyan hover:underline">
                  Load into composer →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-white/10 text-white/70",
    pending_approval: "bg-yellow-500/20 text-yellow-300",
    approved: "bg-emerald-500/20 text-emerald-300",
    published: "bg-brand-gradient text-white",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[status] ?? "bg-white/10 text-white/70"}`}>
      {status}
    </span>
  );
}
