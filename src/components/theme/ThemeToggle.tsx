import { useEffect, useState } from "react";
import { Check, Moon, Palette, RotateCcw, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DEFAULT_CUSTOM_COLORS, THEMES, themeMode, useTheme, type ThemeId } from "./ThemeProvider";

const DARK_THEME: ThemeId = "midnight";
const LIGHT_THEME: ThemeId = "glacier";


function Swatches({ colors }: { colors: readonly string[] }) {
  return (
    <span aria-hidden className="flex shrink-0 items-center -space-x-1">
      {colors.map((c) => (
        <span
          key={c}
          className="h-3.5 w-3.5 rounded-full border border-border/70"
          style={{ backgroundColor: c }}
        />
      ))}
    </span>
  );
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, customColors, setCustomColors, resetCustomColors } = useTheme();
  const [primary, setPrimary] = useState(customColors?.primary ?? DEFAULT_CUSTOM_COLORS.primary);
  const [accent, setAccent] = useState(customColors?.accent ?? DEFAULT_CUSTOM_COLORS.accent);
  const isDark = themeMode(theme) === "dark";
  const quickNext = isDark ? LIGHT_THEME : DARK_THEME;

  const dark = THEMES.filter((t) => t.mode === "dark");
  const light = THEMES.filter((t) => t.mode === "light");

  useEffect(() => {
    setPrimary(customColors?.primary ?? DEFAULT_CUSTOM_COLORS.primary);
    setAccent(customColors?.accent ?? DEFAULT_CUSTOM_COLORS.accent);
  }, [customColors]);

  const updateColor = (kind: "primary" | "accent", value: string) => {
    if (kind === "primary") setPrimary(value);
    else setAccent(value);
    const nextPrimary = kind === "primary" ? value : primary;
    const nextAccent = kind === "accent" ? value : accent;
    if (/^#[0-9a-f]{6}$/i.test(nextPrimary) && /^#[0-9a-f]{6}$/i.test(nextAccent)) {
      setCustomColors({ primary: nextPrimary, accent: nextAccent });
    }
  };

  const group = (label: string, items: readonly (typeof THEMES)[number][]) => (
    <>
      <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </DropdownMenuLabel>
      {items.map((t) => (
        <DropdownMenuItem
          key={t.id}
          onSelect={() => setTheme(t.id)}
          className="gap-2.5"
          aria-current={theme === t.id ? "true" : undefined}
        >
          <Swatches colors={t.swatches} />
          <span className={cn("flex-1 text-sm", theme === t.id && "font-semibold text-primary")}>
            {t.label}
          </span>
          {theme === t.id && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      ))}
    </>
  );

  return (
    <div className="contents">
      <Button
        variant="ghost"
        size="sm"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => setTheme(quickNext)}
        className={cn(
          "min-h-11 justify-center gap-1.5 text-foreground/80 hover:bg-foreground/10",
          compact ? "w-11 px-0" : "w-full",
        )}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span className={cn("text-xs font-medium", compact && "sr-only")}>{isDark ? "Light" : "Dark"}</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Choose a colour theme"
            title="Choose a colour theme"
            className={cn(
              "min-h-11 justify-center gap-1.5 text-foreground/80 hover:bg-foreground/10",
              compact ? "w-11 px-0" : "w-full px-2",
            )}
          >
            <Palette className="h-4 w-4" />
            <span className={cn("text-xs font-medium", compact && "sr-only")}>Themes</span>
          </Button>
        </DropdownMenuTrigger>
         <DropdownMenuContent align="end" className="z-[120] w-[min(19rem,calc(100vw-1rem))]">
          {group("Dark themes", dark)}
          <DropdownMenuSeparator />
          {group("Light themes", light)}
           <DropdownMenuSeparator />
           <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
             Custom brand colours
           </DropdownMenuLabel>
           <div
             className="space-y-3 px-2 pb-2"
             onPointerDown={(event) => event.stopPropagation()}
             onKeyDown={(event) => event.stopPropagation()}
           >
             <ColorField label="Primary" value={primary} onChange={(value) => updateColor("primary", value)} />
             <ColorField label="Accent" value={accent} onChange={(value) => updateColor("accent", value)} />
             <div className="flex items-center justify-between gap-3">
               <span className="text-xs text-muted-foreground">Text contrast adjusts automatically.</span>
               <Button
                 type="button"
                 variant="ghost"
                 size="sm"
                 className="h-9 shrink-0 gap-1.5 px-2"
                 onClick={resetCustomColors}
                 disabled={!customColors}
               >
                 <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                 Reset
               </Button>
             </div>
           </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid grid-cols-[2.75rem_1fr] items-center gap-2 text-xs font-medium text-foreground">
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`${label} colour picker`}
        className="h-10 w-11 cursor-pointer rounded-md border border-input bg-background p-1"
      />
      <span className="space-y-1">
        <span className="block">{label}</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} hexadecimal colour`}
          maxLength={7}
          spellCheck={false}
          className="h-9 w-full rounded-md border border-input bg-background px-2 font-mono text-xs uppercase text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </span>
    </label>
  );
}
