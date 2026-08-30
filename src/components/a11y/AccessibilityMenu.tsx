import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Accessibility, Pause, Play, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { FONT_SCALES, type ColorFilter } from "@/lib/a11y-prefs";
import { LOCALES, SPEECH_LANG, type LocaleId } from "@/lib/i18n";
import { THEMES, useTheme, type ThemeId } from "@/components/theme/ThemeProvider";

const LIGHT_THEME: ThemeId = "glacier";
const DARK_THEME: ThemeId = "cinematic";

const COLOR_FILTER_OPTIONS: { id: ColorFilter; label: string }[] = [
  { id: "none", label: "None" },
  { id: "protanopia", label: "Protanopia" },
  { id: "deuteranopia", label: "Deuteranopia" },
  { id: "tritanopia", label: "Tritanopia" },
  { id: "monochrome", label: "Monochrome" },
];

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Choices<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={String(opt.id)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              "min-h-11 rounded-md border px-3 py-1.5 text-sm transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3">
      <Label htmlFor={id} className="text-sm font-normal text-foreground">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SliderRow({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-normal text-foreground">
          {label}
        </Label>
        <span className="text-xs text-muted-foreground">{value.toFixed(2)}</span>
      </div>
      <Slider
        id={id}
        value={[value]}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        onValueChange={(v) => onChange(v[0] ?? value)}
      />
    </div>
  );
}

/** Collects readable page text for speech synthesis. */
function collectPageText(): string {
  const root = document.querySelector("main") ?? document.body;
  if (!root) return "";
  const clone = root.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll("nav, form, button, script, style, [aria-hidden='true'], [data-no-read]")
    .forEach((n) => n.remove());
  return clone.innerText.replace(/\n{2,}/g, "\n\n").trim().slice(0, 6000);
}

function useSpeech() {
  const { prefs } = useAccessibility();
  const { locale } = useTranslation();
  const [supported, setSupported] = useState(true);
  const [state, setState] = useState<"idle" | "speaking" | "paused">("idle");
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* nothing to cancel */
      }
    };
  }, []);

  const speak = (text: string) => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const lang = SPEECH_LANG[(locale as LocaleId) in SPEECH_LANG ? (locale as LocaleId) : "en"];
    u.lang = lang;
    const voice = synth
      .getVoices()
      .find((v) => v.lang === lang || v.lang.startsWith(lang.slice(0, 2)));
    if (voice) u.voice = voice;
    u.rate = prefsRef.current.speechRate;
    u.pitch = prefsRef.current.speechPitch;
    u.volume = prefsRef.current.speechVolume;
    u.onend = () => setState("idle");
    u.onerror = () => setState("idle");
    synth.speak(u);
    setState("speaking");
  };

  return {
    supported,
    state,
    readPage: () => speak(collectPageText()),
    speak,
    pause: () => {
      window.speechSynthesis.pause();
      setState("paused");
    },
    resume: () => {
      window.speechSynthesis.resume();
      setState("speaking");
    },
    stop: () => {
      window.speechSynthesis.cancel();
      setState("idle");
    },
  };
}

/** Speaks the current selection when "read selected text" is enabled. */
export function SelectionReader() {
  const { prefs } = useAccessibility();
  const { speak } = useSpeech();
  useEffect(() => {
    if (!prefs.readOnSelection) return;
    const onUp = () => {
      const text = window.getSelection()?.toString().trim();
      if (text && text.length > 1) speak(text.slice(0, 1200));
    };
    document.addEventListener("mouseup", onUp);
    document.addEventListener("keyup", onUp);
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("keyup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.readOnSelection]);
  return null;
}

function MenuBody() {
  const { prefs, setPref, reset, reduceMotion } = useAccessibility();
  const { t, locale, setLocale } = useTranslation();
  const { theme, setTheme } = useTheme();
  const speech = useSpeech();

  const themeMode = prefs.themeMode;
  const colorThemes = useMemo(() => THEMES.filter((x) => x.mode === (theme === DARK_THEME || THEMES.find((th) => th.id === theme)?.mode === "dark" ? "dark" : "light")), [theme]);

  const applyThemeMode = (mode: "light" | "dark" | "system") => {
    setPref("themeMode", mode);
    if (mode === "light") setTheme(LIGHT_THEME);
    else if (mode === "dark") setTheme(DARK_THEME);
    else {
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(dark ? DARK_THEME : LIGHT_THEME);
    }
  };

  return (
    <div className="space-y-5">
      <Group title={t("a11y.theme")}>
        <Choices
          label={t("a11y.theme")}
          value={themeMode}
          options={[
            { id: "light" as const, label: t("a11y.light") },
            { id: "dark" as const, label: t("a11y.dark") },
            { id: "system" as const, label: t("a11y.system") },
          ]}
          onChange={applyThemeMode}
        />
        <Toggle
          id="a11y-contrast"
          label={t("a11y.highContrast")}
          checked={prefs.highContrast}
          onChange={(v) => setPref("highContrast", v)}
        />
        <Choices
          label="Colour theme"
          value={theme}
          options={colorThemes.map((x) => ({ id: x.id as ThemeId, label: x.label }))}
          onChange={(id) => setTheme(id)}
        />
      </Group>

      <Separator />

      <Group title={t("a11y.colorVision")}>
        <Choices
          label={t("a11y.colorVision")}
          value={prefs.colorFilter}
          options={COLOR_FILTER_OPTIONS.map((o) => ({
            ...o,
            label: o.id === "none" ? t("a11y.none") : o.label,
          }))}
          onChange={(v) => setPref("colorFilter", v)}
        />
      </Group>

      <Separator />

      <Group title={t("a11y.readability")}>
        <Choices
          label={t("a11y.textSize")}
          value={prefs.fontScale}
          options={FONT_SCALES.map((s) => ({ id: s, label: `${Math.round(s * 100)}%` }))}
          onChange={(v) => setPref("fontScale", v)}
        />
        <Choices
          label={t("a11y.fontFamily")}
          value={prefs.fontFamily}
          options={[
            { id: "system" as const, label: t("a11y.system") },
            { id: "sans" as const, label: "Sans" },
            { id: "serif" as const, label: "Serif" },
            { id: "dyslexic" as const, label: "Dyslexia-friendly" },
          ]}
          onChange={(v) => setPref("fontFamily", v)}
        />
        <Choices
          label={t("a11y.spacing")}
          value={prefs.spacing}
          options={[
            { id: "normal" as const, label: t("a11y.normal") },
            { id: "relaxed" as const, label: t("a11y.relaxed") },
            { id: "loose" as const, label: t("a11y.loose") },
          ]}
          onChange={(v) => setPref("spacing", v)}
        />
        <Toggle
          id="a11y-bold"
          label={t("a11y.boldText")}
          checked={prefs.boldText}
          onChange={(v) => setPref("boldText", v)}
        />
        <Toggle
          id="a11y-links"
          label={t("a11y.underlineLinks")}
          checked={prefs.underlineLinks}
          onChange={(v) => setPref("underlineLinks", v)}
        />
      </Group>

      <Separator />

      <Group title={t("a11y.motion")}>
        <Toggle
          id="a11y-motion"
          label={t("a11y.reduceMotion")}
          checked={reduceMotion}
          onChange={(v) => setPref("reduceMotion", v)}
        />
        <Toggle
          id="a11y-focus"
          label={t("a11y.focusRing")}
          checked={prefs.focusRing}
          onChange={(v) => setPref("focusRing", v)}
        />
        <Toggle
          id="a11y-cursor"
          label={t("a11y.largeCursor")}
          checked={prefs.largeCursor}
          onChange={(v) => setPref("largeCursor", v)}
        />
        <Toggle
          id="a11y-media"
          label={t("a11y.pauseMedia")}
          checked={prefs.pauseMedia}
          onChange={(v) => setPref("pauseMedia", v)}
        />
      </Group>

      <Separator />

      <Group title={t("a11y.language")}>
        <Choices
          label={t("a11y.language")}
          value={locale}
          options={LOCALES.map((l) => ({ id: l.id as string, label: l.native }))}
          onChange={(id) => setLocale(id as LocaleId)}
        />
      </Group>

      <Separator />

      <Group title={t("a11y.speech")}>
        {!speech.supported ? (
          <p className="text-sm text-muted-foreground">{t("a11y.noSpeech")}</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="min-h-11" onClick={speech.readPage}>
                <Play className="h-4 w-4" aria-hidden="true" />
                <span>{t("a11y.play")}</span>
              </Button>
              {speech.state === "paused" ? (
                <Button size="sm" variant="outline" className="min-h-11" onClick={speech.resume}>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  <span>{t("a11y.resume")}</span>
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="min-h-11" onClick={speech.pause}>
                  <Pause className="h-4 w-4" aria-hidden="true" />
                  <span>{t("a11y.pause")}</span>
                </Button>
              )}
              <Button size="sm" variant="outline" className="min-h-11" onClick={speech.stop}>
                <Square className="h-4 w-4" aria-hidden="true" />
                <span>{t("a11y.stop")}</span>
              </Button>
            </div>
            <SliderRow
              id="a11y-rate"
              label={t("a11y.rate")}
              value={prefs.speechRate}
              min={0.5}
              max={1.5}
              step={0.05}
              onChange={(v) => setPref("speechRate", v)}
            />
            <SliderRow
              id="a11y-pitch"
              label={t("a11y.pitch")}
              value={prefs.speechPitch}
              min={0.5}
              max={1.5}
              step={0.05}
              onChange={(v) => setPref("speechPitch", v)}
            />
            <SliderRow
              id="a11y-volume"
              label={t("a11y.volume")}
              value={prefs.speechVolume}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => setPref("speechVolume", v)}
            />
            <Toggle
              id="a11y-selection"
              label={t("a11y.readSelection")}
              checked={prefs.readOnSelection}
              onChange={(v) => setPref("readOnSelection", v)}
            />
          </>
        )}
      </Group>

      <Separator />

      <Button variant="outline" className="min-h-11 w-full" onClick={reset}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        <span>{t("a11y.reset")}</span>
      </Button>
    </div>
  );
}

export function AccessibilityMenu({ className }: { className?: string }) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const trigger = (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("a11y.open")}
      className={cn("min-h-11 min-w-11 text-foreground", className)}
    >
      <Accessibility className="h-5 w-5" aria-hidden="true" />
    </Button>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t("a11y.title")}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-8">
            <MenuBody />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="max-h-[80vh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto"
        aria-label={t("a11y.title")}
      >
        <h2 className="mb-3 text-sm font-semibold text-foreground">{t("a11y.title")}</h2>
        <MenuBody />
      </PopoverContent>
    </Popover>
  );
}
