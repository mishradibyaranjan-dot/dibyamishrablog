import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { localeDir, translate, type LocaleId, type TranslationKey } from "@/lib/i18n";

type Ctx = {
  locale: string;
  dir: "ltr" | "rtl";
  setLocale: (locale: LocaleId) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<Ctx>({
  locale: "en",
  dir: "ltr",
  setLocale: () => {},
  t: (key) => translate("en", key),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { prefs, setPref } = useAccessibility();
  const locale = prefs.locale;
  const dir = localeDir(locale);

  // Keep the document language/direction in sync with the chosen locale.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dir;
  }, [locale, dir]);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      dir,
      setLocale: (next) => setPref("locale", next),
      t: (key) => translate(locale, key),
    }),
    [locale, dir, setPref],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  return useContext(LanguageContext);
}
