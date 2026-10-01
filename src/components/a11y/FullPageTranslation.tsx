import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { LOCALES } from "@/lib/i18n";
import { useTranslation } from "@/contexts/LanguageContext";

const SCRIPT_ID = "drm-google-translate-script";
const ELEMENT_ID = "google_translate_element";
const CALLBACK = "drmGoogleTranslateReady";
const INCLUDED_LANGUAGES = LOCALES.filter((locale) => locale.id !== "en")
  .map((locale) => locale.id)
  .join(",");

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
          elementId: string,
        ) => void;
      };
    };
    drmGoogleTranslateReady?: () => void;
  }
}

function applyWidgetLanguage(locale: string): boolean {
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!select) return false;
  select.value = locale === "en" ? "" : locale;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

/** Loads translation only when requested and keeps translated content current after navigation. */
export function FullPageTranslation() {
  const { locale, setTranslationStatus } = useTranslation();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const previousLocale = useRef("en");

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;

    if (locale === "en") {
      setTranslationStatus("idle");
      if (previousLocale.current !== "en" && document.querySelector(".goog-te-combo")) {
        applyWidgetLanguage("en");
        window.setTimeout(() => window.location.reload(), 80);
      }
      previousLocale.current = locale;
      return;
    }

    previousLocale.current = locale;
    setTranslationStatus("loading");
    let cancelled = false;
    let attempts = 0;
    let retryTimer: number | undefined;

    const selectLanguage = () => {
      if (cancelled) return;
      if (applyWidgetLanguage(locale)) {
        setTranslationStatus("ready");
        return;
      }
      attempts += 1;
      if (attempts >= 30) {
        setTranslationStatus("error");
        return;
      }
      retryTimer = window.setTimeout(selectLanguage, 200);
    };

    window[CALLBACK] = () => {
      const TranslateElement = window.google?.translate?.TranslateElement;
      if (!TranslateElement || document.querySelector(".goog-te-combo")) {
        selectLanguage();
        return;
      }
      new TranslateElement(
        { pageLanguage: "en", includedLanguages: INCLUDED_LANGUAGES, autoDisplay: false },
        ELEMENT_ID,
      );
      selectLanguage();
    };

    const existing = document.getElementById(SCRIPT_ID);
    if (window.google?.translate?.TranslateElement) {
      window[CALLBACK]?.();
    } else if (!existing) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = `https://translate.google.com/translate_a/element.js?cb=${CALLBACK}`;
      script.async = true;
      script.onerror = () => setTranslationStatus("error");
      document.head.appendChild(script);
    } else {
      selectLanguage();
    }

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [locale, pathname, setTranslationStatus]);

  return <div id={ELEMENT_ID} className="translation-widget" aria-hidden="true" />;
}
