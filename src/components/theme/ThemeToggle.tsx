import { Check, Moon, Palette, Sun } from "lucide-react";
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
import { THEMES, themeMode, useTheme, type ThemeId } from "./ThemeProvider";

const DARK_THEME: ThemeId = "midnight";
const LIGHT_THEME: ThemeId = "light";

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

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = themeMode(theme) === "dark";
  const quickNext = isDark ? LIGHT_THEME : DARK_THEME;

  const dark = THEMES.filter((t) => t.mode === "dark");
  const light = THEMES.filter((t) => t.mode === "light");

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
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="sm"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => setTheme(quickNext)}
        className="gap-1.5 text-foreground/80 hover:bg-foreground/10"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span className="hidden text-xs font-medium sm:inline">{isDark ? "Light" : "Dark"}</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Choose a colour theme"
            title="Choose a colour theme"
            className="px-2 text-foreground/80 hover:bg-foreground/10"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          {group("Dark themes", dark)}
          <DropdownMenuSeparator />
          {group("Light themes", light)}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
