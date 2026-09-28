import { Check, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/contexts/LanguageContext";
import { LOCALES, type LocaleId } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useTranslation();
  const selected = LOCALES.find((item) => item.id === locale) ?? LOCALES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Language: ${selected.english}`}
          title="Choose language"
          className="min-h-11 w-full justify-center gap-2 text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Languages className="h-4 w-4" aria-hidden="true" />
          <span className={cn("text-xs font-medium", compact && "sr-only")}>{selected.native}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[120] w-56">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        {LOCALES.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onSelect={() => setLocale(item.id as LocaleId)}
            className="min-h-11 gap-3"
            aria-current={locale === item.id ? "true" : undefined}
          >
            <span className="flex-1 text-sm text-foreground">
              {item.native} <span className="text-muted-foreground">({item.english})</span>
            </span>
            {locale === item.id && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}