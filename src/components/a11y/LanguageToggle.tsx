import { useMemo, useState } from "react";
import { Check, Languages, LoaderCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/contexts/LanguageContext";
import { LOCALES } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, translationStatus } = useTranslation();
  const [query, setQuery] = useState("");
  const selected = LOCALES.find((item) => item.id === locale) ?? LOCALES.find((item) => item.id === "en") ?? LOCALES[0];
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return LOCALES;
    return LOCALES.filter((item) =>
      `${item.native} ${item.english} ${item.id}`.toLocaleLowerCase().includes(needle),
    );
  }, [query]);

  if (!selected) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Language: ${selected.english}`}
          title="Choose language"
          className={cn(
            "min-h-11 justify-center gap-2 text-foreground hover:bg-accent hover:text-accent-foreground",
            compact ? "w-11 px-0" : "w-full",
          )}
        >
           {translationStatus === "loading" ? (
             <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
           ) : (
             <Languages className="h-4 w-4" aria-hidden="true" />
           )}
          <span className={cn("text-xs font-medium", compact && "sr-only")}>{selected.native}</span>
        </Button>
      </DropdownMenuTrigger>
       <DropdownMenuContent align="end" className="z-[120] w-[min(22rem,calc(100vw-1rem))] p-1.5">
         <DropdownMenuLabel className="flex items-center justify-between">
           <span>Language</span>
           <span className="text-xs font-normal text-muted-foreground">{LOCALES.length} available</span>
         </DropdownMenuLabel>
         <div className="relative mb-1 px-1" onKeyDown={(event) => event.stopPropagation()}>
           <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
           <Input
             value={query}
             onChange={(event) => setQuery(event.target.value)}
             placeholder="Search languages"
             aria-label="Search languages"
             className="h-10 bg-background pl-9"
           />
         </div>
         <div className="max-h-[min(60vh,28rem)] overflow-y-auto">
         {filtered.map((item) => (
          <DropdownMenuItem
            key={item.id}
             onSelect={() => {
               setLocale(item.id);
               setQuery("");
             }}
            className="min-h-11 gap-3"
            aria-current={locale === item.id ? "true" : undefined}
          >
            <span className="flex-1 text-sm text-foreground">
              {item.native} <span className="text-muted-foreground">({item.english})</span>
            </span>
            {locale === item.id && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
         {filtered.length === 0 && (
           <p className="px-3 py-6 text-center text-sm text-muted-foreground">No language found.</p>
         )}
         </div>
         {translationStatus === "error" && (
           <p role="alert" className="border-t border-border px-2 py-2 text-xs text-danger">
             Translation is temporarily unavailable. Please try again.
           </p>
         )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}