import { useTranslation } from "@/contexts/LanguageContext";

/** First focusable element on every page: jumps straight to <main>. */
export function SkipToContent() {
  const { t } = useTranslation();
  return (
    <a
      href="#main-content"
      className="sr-only rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100]"
    >
      {t("a11y.skip")}
    </a>
  );
}

/** Polite live region other components can announce into. */
export function LiveAnnouncer() {
  return (
    <div id="a11y-live-region" aria-live="polite" aria-atomic="true" className="sr-only" />
  );
}

export function announce(message: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById("a11y-live-region");
  if (el) el.textContent = message;
}
