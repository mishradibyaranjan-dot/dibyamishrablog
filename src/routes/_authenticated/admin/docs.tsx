import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  Download,
  FileText,
  ShieldAlert,
  RefreshCw,
  PackageOpen,
} from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { listEngineeringDocs, getEngineeringDoc } from "@/lib/docs-suite.functions";
import type { DocMeta } from "@/lib/docs-suite.types";

const SUPER_ADMIN_EMAIL = "mishra.dibyaranjan@gmail.com";

export const Route = createFileRoute("/_authenticated/admin/docs")({
  head: () => ({
    meta: [
      { title: "Engineering documentation — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EngineeringDocsPage,
});

const CATEGORY_ORDER = ["Requirements", "Design", "Quality", "Operations"] as const;

function saveText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function EngineeringDocsPage() {
  const { user, isAdmin, loading, authReady } = useAuth();
  const fetchList = useServerFn(listEngineeringDocs);
  const fetchDoc = useServerFn(getEngineeringDoc);

  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [previewBusy, setPreviewBusy] = useState(false);
  const [bundling, setBundling] = useState(false);

  const isSuperAdmin =
    !!user?.email && user.email.trim().toLowerCase() === SUPER_ADMIN_EMAIL && isAdmin;

  const load = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetchList({});
      setDocs(res.docs);
    } catch {
      setErr("Unable to load the documentation index.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (authReady && isSuperAdmin) void load();
    else if (authReady) setBusy(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, isSuperAdmin]);

  const openDoc = async (id: string, title: string) => {
    setActiveId(id);
    setActiveTitle(title);
    setPreviewBusy(true);
    setBody("");
    try {
      const res = await fetchDoc({ data: { id } });
      setBody(res.content);
    } catch {
      setBody("Unable to load this document.");
    } finally {
      setPreviewBusy(false);
    }
  };

  const downloadOne = async (id: string) => {
    try {
      const res = await fetchDoc({ data: { id } });
      saveText(res.filename, res.content);
    } catch {
      setErr("Download failed. Please retry.");
    }
  };

  const downloadAll = async () => {
    setBundling(true);
    setErr(null);
    try {
      const parts: string[] = [
        "# Engineering Documentation Suite",
        "",
        "Confidential — Super Admin only. Do not distribute.",
        "",
        "## Contents",
        "",
        ...docs.map((d, i) => `${i + 1}. ${d.title} (${d.category})`),
        "",
      ];
      for (const d of docs) {
        const res = await fetchDoc({ data: { id: d.id } });
        parts.push("---", "", res.content, "");
      }
      saveText("Engineering-Documentation-Suite.md", parts.join("\n"));
    } catch {
      setErr("Bundle download failed. Please retry.");
    } finally {
      setBundling(false);
    }
  };

  if (loading || !authReady) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Section>
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-destructive" />
          <h1 className="text-lg font-semibold text-foreground">Restricted area</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The engineering documentation suite is available to the site owner only.
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <SectionHeader
        as="h1"
        eyebrow="Confidential"
        title="Engineering documentation suite"
        description="BRD, SRS, HLD, LLD, architecture diagrams, test strategy, user guide and release notes. Visible and downloadable by the site owner only."
      />

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Button onClick={downloadAll} disabled={bundling || busy || docs.length === 0}>
          {bundling ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PackageOpen className="mr-2 h-4 w-4" />
          )}
          Download full suite
        </Button>
        <Button variant="outline" onClick={load} disabled={busy}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
        <span className="text-xs text-muted-foreground">
          {docs.length} documents · Markdown
        </span>
      </div>

      {err && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {err}
        </div>
      )}

      {busy ? (
        <div className="grid min-h-[30vh] place-items-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="space-y-8">
            {CATEGORY_ORDER.map((cat) => {
              const group = docs.filter((d) => d.category === cat);
              if (group.length === 0) return null;
              return (
                <div key={cat}>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {cat}
                  </h2>
                  <div className="space-y-3">
                    {group.map((d) => (
                      <div
                        key={d.id}
                        className={`rounded-2xl border p-4 transition-colors ${
                          activeId === d.id
                            ? "border-primary bg-accent/40"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-foreground">{d.title}</h3>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              {d.summary}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => void openDoc(d.id, d.title)}
                              >
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void downloadOne(d.id)}
                              >
                                <Download className="mr-2 h-3.5 w-3.5" /> Download
                              </Button>
                              <span className="text-[11px] text-muted-foreground">
                                {(d.bytes / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <h2 className="truncate text-sm font-semibold text-foreground">
                  {activeTitle || "Select a document"}
                </h2>
                {activeId && (
                  <Button size="sm" variant="outline" onClick={() => void downloadOne(activeId)}>
                    <Download className="mr-2 h-3.5 w-3.5" /> Save
                  </Button>
                )}
              </div>
              <div className="max-h-[70vh] overflow-auto p-4">
                {previewBusy ? (
                  <div className="space-y-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="h-3 w-full animate-pulse rounded bg-muted" />
                    ))}
                  </div>
                ) : body ? (
                  <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-foreground">
                    {body}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Choose a document on the left to read it here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
