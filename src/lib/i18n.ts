/**
 * Lightweight i18n dictionary. English is the source of truth; missing keys fall
 * back to English so a raw key is never rendered.
 */

export type LocaleId = "en" | "hi" | "ta" | "es" | "fr" | "ar";

export const LOCALES: { id: LocaleId; native: string; english: string; dir: "ltr" | "rtl" }[] = [
  { id: "en", native: "English", english: "English", dir: "ltr" },
  { id: "hi", native: "हिन्दी", english: "Hindi", dir: "ltr" },
  { id: "ta", native: "தமிழ்", english: "Tamil", dir: "ltr" },
  { id: "es", native: "Español", english: "Spanish", dir: "ltr" },
  { id: "fr", native: "Français", english: "French", dir: "ltr" },
  { id: "ar", native: "العربية", english: "Arabic", dir: "rtl" },
];

export const SPEECH_LANG: Record<LocaleId, string> = {
  en: "en-US",
  hi: "hi-IN",
  ta: "ta-IN",
  es: "es-ES",
  fr: "fr-FR",
  ar: "ar-SA",
};

export function isLocaleId(v: unknown): v is LocaleId {
  return typeof v === "string" && LOCALES.some((l) => l.id === v);
}

export function localeDir(locale: string): "ltr" | "rtl" {
  return LOCALES.find((l) => l.id === locale)?.dir ?? "ltr";
}

const en = {
  "a11y.title": "Accessibility & Preferences",
  "a11y.open": "Accessibility options",
  "a11y.theme": "Theme",
  "a11y.light": "Light",
  "a11y.dark": "Dark",
  "a11y.system": "System",
  "a11y.highContrast": "High contrast",
  "a11y.colorVision": "Colour vision",
  "a11y.none": "None",
  "a11y.readability": "Font & readability",
  "a11y.textSize": "Text size",
  "a11y.fontFamily": "Font family",
  "a11y.spacing": "Spacing",
  "a11y.normal": "Normal",
  "a11y.relaxed": "Relaxed",
  "a11y.loose": "Loose",
  "a11y.boldText": "Bold text",
  "a11y.underlineLinks": "Underline all links",
  "a11y.motion": "Motion & focus",
  "a11y.reduceMotion": "Reduce motion",
  "a11y.focusRing": "Enhanced focus ring",
  "a11y.largeCursor": "Larger cursor",
  "a11y.pauseMedia": "Pause background media",
  "a11y.language": "Language",
  "a11y.speech": "Read page aloud",
  "a11y.play": "Play",
  "a11y.pause": "Pause",
  "a11y.resume": "Resume",
  "a11y.stop": "Stop",
  "a11y.rate": "Speech rate",
  "a11y.pitch": "Pitch",
  "a11y.volume": "Volume",
  "a11y.readSelection": "Read selected text",
  "a11y.noSpeech": "Your browser does not support speech synthesis.",
  "a11y.reset": "Reset to defaults",
  "a11y.skip": "Skip to main content",
};

export type TranslationKey = keyof typeof en;

const dictionaries: Record<LocaleId, Partial<Record<TranslationKey, string>>> = {
  en,
  hi: {
    "a11y.title": "सुगम्यता और प्राथमिकताएँ",
    "a11y.open": "सुगम्यता विकल्प",
    "a11y.theme": "थीम",
    "a11y.light": "हल्का",
    "a11y.dark": "गहरा",
    "a11y.system": "सिस्टम",
    "a11y.highContrast": "उच्च कंट्रास्ट",
    "a11y.colorVision": "रंग दृष्टि",
    "a11y.none": "कोई नहीं",
    "a11y.readability": "फ़ॉन्ट और पठनीयता",
    "a11y.textSize": "पाठ का आकार",
    "a11y.language": "भाषा",
    "a11y.speech": "पेज पढ़कर सुनाएँ",
    "a11y.play": "चलाएँ",
    "a11y.pause": "रोकें",
    "a11y.stop": "बंद करें",
    "a11y.reset": "डिफ़ॉल्ट पर लौटें",
    "a11y.skip": "मुख्य सामग्री पर जाएँ",
  },
  ta: {
    "a11y.title": "அணுகல் & விருப்பங்கள்",
    "a11y.open": "அணுகல் விருப்பங்கள்",
    "a11y.theme": "தீம்",
    "a11y.language": "மொழி",
    "a11y.speech": "பக்கத்தை வாசி",
    "a11y.reset": "இயல்புநிலைக்கு மீட்டமை",
    "a11y.skip": "முதன்மை உள்ளடக்கத்திற்குச் செல்",
  },
  es: {
    "a11y.title": "Accesibilidad y preferencias",
    "a11y.open": "Opciones de accesibilidad",
    "a11y.theme": "Tema",
    "a11y.light": "Claro",
    "a11y.dark": "Oscuro",
    "a11y.system": "Sistema",
    "a11y.highContrast": "Alto contraste",
    "a11y.colorVision": "Visión del color",
    "a11y.none": "Ninguno",
    "a11y.readability": "Fuente y legibilidad",
    "a11y.textSize": "Tamaño del texto",
    "a11y.language": "Idioma",
    "a11y.speech": "Leer la página",
    "a11y.play": "Reproducir",
    "a11y.pause": "Pausar",
    "a11y.stop": "Detener",
    "a11y.reset": "Restablecer",
    "a11y.skip": "Ir al contenido principal",
  },
  fr: {
    "a11y.title": "Accessibilité et préférences",
    "a11y.open": "Options d'accessibilité",
    "a11y.theme": "Thème",
    "a11y.light": "Clair",
    "a11y.dark": "Sombre",
    "a11y.system": "Système",
    "a11y.highContrast": "Contraste élevé",
    "a11y.colorVision": "Vision des couleurs",
    "a11y.none": "Aucun",
    "a11y.readability": "Police et lisibilité",
    "a11y.textSize": "Taille du texte",
    "a11y.language": "Langue",
    "a11y.speech": "Lire la page",
    "a11y.play": "Lire",
    "a11y.pause": "Pause",
    "a11y.stop": "Arrêter",
    "a11y.reset": "Réinitialiser",
    "a11y.skip": "Aller au contenu principal",
  },
  ar: {
    "a11y.title": "إمكانية الوصول والتفضيلات",
    "a11y.open": "خيارات إمكانية الوصول",
    "a11y.theme": "المظهر",
    "a11y.light": "فاتح",
    "a11y.dark": "غامق",
    "a11y.system": "النظام",
    "a11y.highContrast": "تباين عالٍ",
    "a11y.colorVision": "رؤية الألوان",
    "a11y.none": "بدون",
    "a11y.readability": "الخط وسهولة القراءة",
    "a11y.textSize": "حجم النص",
    "a11y.language": "اللغة",
    "a11y.speech": "قراءة الصفحة",
    "a11y.play": "تشغيل",
    "a11y.pause": "إيقاف مؤقت",
    "a11y.stop": "إيقاف",
    "a11y.reset": "إعادة التعيين",
    "a11y.skip": "الانتقال إلى المحتوى الرئيسي",
  },
};

export function translate(locale: string, key: TranslationKey): string {
  const dict = isLocaleId(locale) ? dictionaries[locale] : undefined;
  return dict?.[key] ?? en[key] ?? key;
}
