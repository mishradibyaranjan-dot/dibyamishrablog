import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, Settings2, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  COOKIE_CATEGORIES,
  DEFAULT_PREFS,
  useCookieConsent,
  type CookiePreferences,
} from "@/lib/cookie-consent";
import { cn } from "@/lib/utils";

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
        checked ? "border-primary bg-primary" : "border-border bg-muted",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-all",
          checked ? "left-6" : "left-0.5",
        )}
      />
    </button>
  );
}

/**
 * Cookie notice banner + privacy-first preference toggles.
 * Optional categories default to OFF; nothing is stored until a choice is made.
 */
export function CookieConsent() {
  const { hydrated, decided, prefs, save, acceptAll, rejectAll } = useCookieConsent();
  const [showPrefs, setShowPrefs] = useState(false);
  const [draft, setDraft] = useState<CookiePreferences>(DEFAULT_PREFS);

  useEffect(() => setDraft(prefs), [prefs]);

  useEffect(() => {
    const open = () => setShowPrefs(true);
    window.addEventListener("drm-open-cookie-preferences", open);
    return () => window.removeEventListener("drm-open-cookie-preferences", open);
  }, []);

  if (!hydrated) return null;
  const visible = !decided || showPrefs;
  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.aside
        key="cookie-consent"
        role="dialog"
        aria-modal={showPrefs ? true : undefined}
        aria-label="Cookie notice and preferences"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-border bg-card/95 p-5 shadow-xl backdrop-blur-xl sm:inset-x-6 sm:bottom-6"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-brand-gradient p-2 text-white">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-semibold text-foreground">
              Cookies &amp; your privacy
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              This site uses only what it needs. Strictly necessary storage keeps sign-in and
              security working; preference and analytics storage stay switched off until you allow
              them. Read the{" "}
              <Link to="/privacy" className="text-primary underline">
                Privacy Notice
              </Link>{" "}
              or{" "}
              <Link to="/terms" className="text-primary underline">
                Terms of Use
              </Link>
              .
            </p>
          </div>
          {showPrefs && decided && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close cookie preferences"
              onClick={() => setShowPrefs(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {showPrefs && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <ul className="mt-4 space-y-3 border-t border-border pt-4">
                {COOKIE_CATEGORIES.map((c) => (
                  <li key={c.id} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {c.label}
                        {c.locked && (
                          <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                            Always on
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {c.description}
                      </p>
                    </div>
                    <Toggle
                      label={`${c.label} cookies`}
                      checked={c.locked ? true : Boolean(draft[c.id])}
                      disabled={c.locked}
                      onChange={(v) => setDraft((d) => ({ ...d, [c.id]: v }))}
                    />
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={acceptAll}>
            Accept all
          </Button>
          <Button size="sm" variant="outline" onClick={rejectAll}>
            Necessary only
          </Button>
          {showPrefs ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                save(draft);
                setShowPrefs(false);
              }}
            >
              Save preferences
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setShowPrefs(true)}>
              <Settings2 className="mr-1.5 h-4 w-4" />
              Manage preferences
            </Button>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

/** Footer link that re-opens the cookie preference panel at any time. */
export function CookiePreferencesLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("drm-open-cookie-preferences"))}
    >
      Cookie Preferences
    </button>
  );
}
