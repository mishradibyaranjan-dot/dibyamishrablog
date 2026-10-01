import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useTranslation } from "@/contexts/LanguageContext";

const TRANSLATABLE_SELECTOR = "h1,h2,h3,h4,h5,h6,p,li,a,button,label,th,td,figcaption,blockquote,option,span,[role='menuitem']";
const SKIP_SELECTOR = "[translate='no'],[data-no-translate],code,pre,kbd,samp,script,style,textarea,input,select,.translation-widget";
const MAX_BATCH_CHARS = 2800;
const cache = new Map<string, string>();
const originalText = new WeakMap<Text, string>();
const translatedAs = new WeakMap<Text, { locale: string; text: string }>();

/** Collects text nodes not yet translated into `locale` (new or re-rendered by React). */
function eligibleTextNodes(locale: string): Text[] {
  const nodes: Text[] = [];
  const seen = new Set<Text>();
  document.querySelectorAll<HTMLElement>(TRANSLATABLE_SELECTOR).forEach((element) => {
    if (element.closest(SKIP_SELECTOR)) return;
    element.childNodes.forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      const text = node as Text;
      if (seen.has(text)) return;
      seen.add(text);
      const current = text.textContent ?? "";
      const done = translatedAs.get(text);
      if (done && done.text === current && done.locale === locale) return;
      // React replaced translated text with fresh English: treat it as the new source.
      if (done && done.text !== current) originalText.set(text, current);
      const value = current.trim();
      if (value.length < 2 || !/[A-Za-z]/.test(value) || /^(https?:\/\/|\S+@\S+)$/.test(value)) return;
      if (!originalText.has(text)) originalText.set(text, current);
      nodes.push(text);
    });
  });
  return nodes;
}

function restoreEnglish() {
  document.querySelectorAll<HTMLElement>(TRANSLATABLE_SELECTOR).forEach((element) => {
    element.childNodes.forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      const text = node as Text;
      const done = translatedAs.get(text);
      const original = originalText.get(text);
      if (done && original !== undefined && done.text === text.textContent) text.textContent = original;
      translatedAs.delete(text);
    });
  });
}

async function translateText(text: string, locale: string, signal: AbortSignal): Promise<string> {
  const key = `${locale}:${text}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const params = new URLSearchParams({ client: "gtx", sl: "en", tl: locale, dt: "t", q: text });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`, {
    signal,
    referrerPolicy: "no-referrer",
  });
  if (!response.ok) throw new Error(`Translation failed (${response.status})`);
  const payload = (await response.json()) as unknown;
  const segments = Array.isArray(payload) && Array.isArray(payload[0]) ? payload[0] : [];
  const translated = segments
    .map((segment) => (Array.isArray(segment) && typeof segment[0] === "string" ? segment[0] : ""))
    .join("");
  if (!translated) throw new Error("Translation returned no text");
  cache.set(key, translated);
  return translated;
}

function batches(nodes: Text[]): Text[][] {
  const result: Text[][] = [];
  let current: Text[] = [];
  let size = 0;
  nodes.forEach((node) => {
    const length = (originalText.get(node) ?? node.textContent ?? "").length;
    if (current.length && size + length > MAX_BATCH_CHARS) {
      result.push(current);
      current = [];
      size = 0;
    }
    current.push(node);
    size += length;
  });
  if (current.length) result.push(current);
  return result;
}

async function translateNodes(nodes: Text[], locale: string, signal: AbortSignal) {
  for (const group of batches(nodes)) {
    const source = group.map((node) => originalText.get(node) ?? node.textContent ?? "");
    const separator = "\n⟪DRM_BREAK⟫\n";
    const translated = await translateText(source.join(separator), locale, signal);
    if (signal.aborted) return;
    let parts = translated.split(/\s*⟪DRM_BREAK⟫\s*/);
    if (parts.length !== group.length) {
      parts = [];
      for (const text of source) parts.push(await translateText(text, locale, signal));
    }
    group.forEach((node, index) => {
      const original = originalText.get(node) ?? "";
      // Skip nodes React changed while the request was in flight; the next pass handles them.
      if (node.textContent !== original && !translatedAs.has(node)) return;
      const leading = original.match(/^\s*/)?.[0] ?? "";
      const trailing = original.match(/\s*$/)?.[0] ?? "";
      const next = `${leading}${parts[index]?.trim() ?? original.trim()}${trailing}`;
      node.textContent = next;
      translatedAs.set(node, { locale, text: next });
    });
  }
}

/** Translates visible text after a visitor selects a language, including content that loads later. */
export function FullPageTranslation() {
  const { locale, setTranslationStatus } = useTranslation();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const translatedLocale = useRef("en");

  useEffect(() => {
    const controller = new AbortController();
    let running = false;
    let pending = false;
    let debounce: number | undefined;
    let observer: MutationObserver | undefined;

    const pass = async (initial: boolean) => {
      if (running) {
        pending = true;
        return;
      }
      running = true;
      try {
        const nodes = eligibleTextNodes(locale);
        if (nodes.length || initial) {
          if (initial) setTranslationStatus("loading");
          await translateNodes(nodes, locale, controller.signal);
        }
        if (controller.signal.aborted) return;
        translatedLocale.current = locale;
        if (initial) setTranslationStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn("Page translation unavailable", error);
        setTranslationStatus("error");
      } finally {
        running = false;
        if (pending && !controller.signal.aborted) {
          pending = false;
          void pass(false);
        }
      }
    };

    const timer = window.setTimeout(async () => {
      restoreEnglish();
      if (locale === "en") {
        translatedLocale.current = "en";
        setTranslationStatus("idle");
        return;
      }
      await pass(true);
      if (controller.signal.aborted) return;
      observer = new MutationObserver(() => {
        window.clearTimeout(debounce);
        debounce = window.setTimeout(() => void pass(false), 250);
      });
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }, pathname ? 180 : 0);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(debounce);
      observer?.disconnect();
      controller.abort();
    };
  }, [locale, pathname, setTranslationStatus]);

  return <span className="sr-only" aria-live="polite">{translatedLocale.current !== "en" ? "Page translated" : ""}</span>;
}
