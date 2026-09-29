import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, CornerDownLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchAll, SEARCH_SECTIONS, type GlobalHit, type SearchSection } from "@/lib/search-index";
import { cn } from "@/lib/utils";

/**
 * Site-wide search across Research/Blog, Case Studies, Projects, Expertise and
 * Learn. Opens with the header button or Cmd/Ctrl+K.
 */
export function GlobalSearch({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<SearchSection | "all">("all");
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hits = useMemo(() => {
    const all = searchAll(query);
    return section === "all" ? all : all.filter((h) => h.section === section);
  }, [query, section]);

  const grouped = useMemo(() => {
    const map = new Map<SearchSection, GlobalHit[]>();
    for (const h of hits) {
      const list = map.get(h.section) ?? [];
      list.push(h);
      map.set(h.section, list);
    }
    return Array.from(map.entries());
  }, [hits]);

  const go = (hit: GlobalHit) => {
    setOpen(false);
    setQuery("");
    navigate({
      to: hit.to,
      params: hit.params,
      hash: hit.hash,
    } as never);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search the site"
        title="Search the site (⌘K)"
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
          compact ? "w-11 px-0" : "w-full",
        )}
      >
        <Search className="h-4 w-4" />
        <span className={cn(compact && "sr-only")}>Search</span>
        {!compact && (
          <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium xl:inline">
            ⌘K
          </kbd>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0">
          <div className="border-b border-border p-4">
            <DialogTitle className="sr-only">Search the site</DialogTitle>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search research, case studies, projects, expertise, learn…"
                className="pl-9"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(["all", ...SEARCH_SECTIONS] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSection(s)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    section === s
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[55vh] overflow-y-auto p-2">
            {query.trim() === "" && (
              <p className="p-4 text-sm text-muted-foreground">
                Start typing to search articles, case studies, projects, capabilities and Learn modules.
              </p>
            )}
            {query.trim() !== "" && hits.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No matches for “{query}”.</p>
            )}
            {grouped.map(([sec, list]) => (
              <div key={sec} className="mb-2">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {sec}
                </p>
                <ul>
                  {list.map((hit) => (
                    <li key={hit.id}>
                      <button
                        type="button"
                        onClick={() => go(hit)}
                        className="group flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent"
                      >
                        <span className="flex w-full items-center justify-between gap-3">
                          <span className="font-medium text-foreground">{hit.title}</span>
                          <CornerDownLeft className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                        </span>
                        <span className="line-clamp-2 text-sm text-muted-foreground">
                          {hit.description}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default GlobalSearch;
