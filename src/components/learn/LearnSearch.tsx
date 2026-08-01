import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, FileText, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  LEARN_TOPICS,
  searchLearn,
  type LearnTopic,
} from "@/lib/learn-catalog";

/**
 * Full-text search across Learn modules and repository documents, with
 * topic filtering. Module hits jump to the matching tab.
 */
export function LearnSearch({
  onOpenModule,
  completedModules,
}: {
  onOpenModule: (key: string) => void;
  completedModules: Record<string, boolean>;
}) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<LearnTopic | "all">("all");

  const hits = useMemo(() => searchLearn(query, topic), [query, topic]);
  const active = query.trim().length > 0 || topic !== "all";

  return (
    <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-[0_20px_60px_-45px_rgba(37,99,235,0.5)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules and white papers — e.g. RAG, kanban, multi-tenant…"
            aria-label="Search Learn modules and repository documents"
            className="pl-9"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(["all", ...LEARN_TOPICS] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopic(t)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              topic === t
                ? "border-border bg-primary text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-border"
            }`}
          >
            {t === "all" ? "All topics" : t}
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-4 space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {hits.length} result{hits.length === 1 ? "" : "s"}
          </p>
          {hits.length === 0 && (
            <p className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
              No matches. Try a broader term or a different topic.
            </p>
          )}
          <ul className="grid gap-2 md:grid-cols-2">
            {hits.map((hit) => (
              <li key={`${hit.kind}-${hit.key}`}>
                {hit.kind === "module" ? (
                  <button
                    type="button"
                    onClick={() => onOpenModule(hit.key)}
                    className="flex h-full w-full flex-col items-start rounded-2xl border border-border bg-card p-4 text-left transition hover:border-border hover:shadow-sm"
                  >
                    <ResultHead
                      icon={<BookOpen className="h-3.5 w-3.5" />}
                      badge={hit.badge}
                      done={!!completedModules[hit.key]}
                    />
                    <span className="mt-2 font-semibold text-foreground">{hit.title}</span>
                    <span className="mt-1 text-sm text-muted-foreground">{hit.snippet}</span>
                  </button>
                ) : (
                  <Link
                    to="/repository"
                    className="flex h-full w-full flex-col items-start rounded-2xl border border-border bg-card p-4 text-left transition hover:border-border hover:shadow-sm"
                  >
                    <ResultHead icon={<FileText className="h-3.5 w-3.5" />} badge={hit.badge} done={false} />
                    <span className="mt-2 font-semibold text-foreground">{hit.title}</span>
                    <span className="mt-1 text-sm text-muted-foreground">{hit.snippet}</span>
                    <span className="mt-2 text-xs font-medium text-primary">Open in Repository →</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="pt-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setQuery("");
                setTopic("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultHead({ icon, badge, done }: { icon: React.ReactNode; badge: string; done: boolean }) {
  return (
    <span className="flex w-full items-center justify-between gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {badge}
      </span>
      {done && <CheckCircle2 className="h-4 w-4 text-success" aria-label="Completed" />}
    </span>
  );
}

export default LearnSearch;
