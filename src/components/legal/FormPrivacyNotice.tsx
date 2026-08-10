import { Link } from "@tanstack/react-router";
import { legalConfig } from "@/lib/legal-config";
import { cn } from "@/lib/utils";

/**
 * Short notice placed under public forms (contact, newsletter, registration).
 */
export function FormPrivacyNotice({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Information submitted through this form will be used to process your request. Please see our{" "}
      <Link to={legalConfig.privacyUrl} className="underline hover:text-foreground">
        Privacy Notice
      </Link>{" "}
      for more information.
    </p>
  );
}
