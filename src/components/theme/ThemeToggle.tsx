import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { THEMES, useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const active = THEMES.find((t) => t.id === theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Change theme"
          className="gap-1.5 text-foreground/80 hover:bg-foreground/10"
        >
          <span className="relative inline-flex">
            <Palette className="h-4 w-4" />
            {active && (
              <span
                className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-1 ring-black/30"
                style={{ background: active.swatches[0] }}
              />
            )}
          </span>
          <span className="hidden text-xs font-medium sm:inline">
            {active?.label ?? "Theme"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2">
              <span className="flex -space-x-1">
                {t.swatches.map((c) => (
                  <span
                    key={c}
                    className="h-3.5 w-3.5 rounded-full ring-1 ring-black/20"
                    style={{ background: c }}
                  />
                ))}
              </span>
              <span className="text-sm">{t.label}</span>
            </span>
            {theme === t.id && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
