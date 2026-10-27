import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

/**
 * Subtle call-to-action shown once the reader has scrolled roughly halfway
 * through a long-form article. Dismissible and never re-shown after dismissal
 * within the page view.
 */
export function ScrollDepthCta() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => {
      if (dismissed) return;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const depth = (window.scrollY + window.innerHeight * 0.5) / scrollable;
      setVisible(depth >= 0.5);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  // Portaled to <body>: page-transition wrappers use transforms, which would
  // otherwise trap `position: fixed` inside the page container.
  if (!mounted || !visible || dismissed) return null;

  return createPortal(
    <div
      role="complementary"
      aria-label="Related services"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-lg transition-all duration-300"
    >
      <div className="card-flashy rounded-2xl glass-strong p-5 shadow-lg">
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="pr-8 text-sm font-semibold text-foreground">
          Applying this idea inside your organization?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm" className="bg-brand-gradient text-white">
            <Link
              to="/case-studies"
              onClick={() => trackEvent("case_study_view", { source: "scroll_depth_cta" })}
            >
              Explore Related Case Study
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link
              to="/contact"
              onClick={() => trackEvent("advisory_cta_click", { source: "scroll_depth_cta" })}
            >
              Discuss the Architecture
            </Link>
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
