import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, type ThemeId } from "./ThemeProvider";

const DARK_THEME: ThemeId = "midnight";
const LIGHT_THEME: ThemeId = "light";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme !== "light";
  const next = isDark ? LIGHT_THEME : DARK_THEME;

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(next)}
      className="gap-1.5 text-foreground/80 hover:bg-foreground/10"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden text-xs font-medium sm:inline">
        {isDark ? "Light" : "Dark"}
      </span>
    </Button>
  );
}
