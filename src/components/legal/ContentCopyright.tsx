import { Link } from "@tanstack/react-router";
import { legalConfig, copyrightLine } from "@/lib/legal-config";
import { cn } from "@/lib/utils";

/**
 * Subtle ownership line for original long-form material (articles, research,
 * learning modules, whitepapers, case studies, diagrams).
 */
export function ContentCopyright({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      {copyrightLine()} Original content by {legalConfig.ownerName} — please do not reproduce
      without permission.{" "}
      <Link to="/copyright" className="underline hover:text-foreground">
        Copyright &amp; Content Use
      </Link>
    </p>
  );
}
