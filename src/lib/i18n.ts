/**
 * Lightweight i18n dictionary. English is the source of truth; missing keys fall
 * back to English so a raw key is never rendered.
 */

export type LocaleId = string;

export type LocaleOption = {
  id: string;
  native: string;
  english: string;
  dir: "ltr" | "rtl";
  speech?: string;
};

const RTL_LOCALES = new Set(["ar", "dv", "he", "fa", "ps", "sd", "ug", "ur", "yi", "ku"]);

/** Languages supported by the full-page translation service. */
export const LOCALES: LocaleOption[] = [
  ["af", "Afrikaans", "Afrikaans"], ["sq", "Shqip", "Albanian"], ["am", "አማርኛ", "Amharic"],
  ["ar", "العربية", "Arabic", "ar-SA"], ["hy", "Հայերեն", "Armenian"], ["as", "অসমীয়া", "Assamese"],
  ["ay", "Aymar aru", "Aymara"], ["az", "Azərbaycan", "Azerbaijani"], ["bm", "Bamanankan", "Bambara"],
  ["eu", "Euskara", "Basque"], ["be", "Беларуская", "Belarusian"], ["bn", "বাংলা", "Bengali", "bn-IN"],
  ["bho", "भोजपुरी", "Bhojpuri"], ["bs", "Bosanski", "Bosnian"], ["bg", "Български", "Bulgarian"],
  ["ca", "Català", "Catalan"], ["ceb", "Cebuano", "Cebuano"], ["zh-CN", "简体中文", "Chinese (Simplified)", "zh-CN"],
  ["zh-TW", "繁體中文", "Chinese (Traditional)", "zh-TW"], ["co", "Corsu", "Corsican"], ["hr", "Hrvatski", "Croatian"],
  ["cs", "Čeština", "Czech"], ["da", "Dansk", "Danish"], ["dv", "ދިވެހި", "Dhivehi"],
  ["doi", "डोगरी", "Dogri"], ["nl", "Nederlands", "Dutch"], ["en", "English", "English", "en-US"],
  ["eo", "Esperanto", "Esperanto"], ["et", "Eesti", "Estonian"], ["ee", "Eʋegbe", "Ewe"],
  ["fil", "Filipino", "Filipino"], ["fi", "Suomi", "Finnish"], ["fr", "Français", "French", "fr-FR"],
  ["fy", "Frysk", "Frisian"], ["gl", "Galego", "Galician"], ["ka", "ქართული", "Georgian"],
  ["de", "Deutsch", "German", "de-DE"], ["el", "Ελληνικά", "Greek"], ["gn", "Avañe'ẽ", "Guarani"],
  ["gu", "ગુજરાતી", "Gujarati", "gu-IN"], ["ht", "Kreyòl ayisyen", "Haitian Creole"], ["ha", "Hausa", "Hausa"],
  ["haw", "ʻŌlelo Hawaiʻi", "Hawaiian"], ["he", "עברית", "Hebrew", "he-IL"], ["hi", "हिन्दी", "Hindi", "hi-IN"],
  ["hmn", "Hmoob", "Hmong"], ["hu", "Magyar", "Hungarian"], ["is", "Íslenska", "Icelandic"],
  ["ig", "Igbo", "Igbo"], ["ilo", "Ilocano", "Ilocano"], ["id", "Bahasa Indonesia", "Indonesian"],
  ["ga", "Gaeilge", "Irish"], ["it", "Italiano", "Italian", "it-IT"], ["ja", "日本語", "Japanese", "ja-JP"],
  ["jv", "Basa Jawa", "Javanese"], ["kn", "ಕನ್ನಡ", "Kannada", "kn-IN"], ["kk", "Қазақша", "Kazakh"],
  ["km", "ខ្មែរ", "Khmer"], ["rw", "Kinyarwanda", "Kinyarwanda"], ["ko", "한국어", "Korean", "ko-KR"],
  ["kri", "Krio", "Krio"], ["ku", "Kurdî", "Kurdish"], ["ky", "Кыргызча", "Kyrgyz"],
  ["lo", "ລາວ", "Lao"], ["la", "Latina", "Latin"], ["lv", "Latviešu", "Latvian"],
  ["ln", "Lingála", "Lingala"], ["lt", "Lietuvių", "Lithuanian"], ["lg", "Luganda", "Luganda"],
  ["lb", "Lëtzebuergesch", "Luxembourgish"], ["mk", "Македонски", "Macedonian"], ["mai", "मैथिली", "Maithili"],
  ["mg", "Malagasy", "Malagasy"], ["ms", "Bahasa Melayu", "Malay"], ["ml", "മലയാളം", "Malayalam", "ml-IN"],
  ["mt", "Malti", "Maltese"], ["mi", "Māori", "Māori"], ["mr", "मराठी", "Marathi", "mr-IN"],
  ["mni-Mtei", "ꯃꯤꯇꯩꯂꯣꯟ", "Meiteilon"], ["lus", "Mizo ṭawng", "Mizo"], ["mn", "Монгол", "Mongolian"],
  ["my", "မြန်မာ", "Myanmar"], ["ne", "नेपाली", "Nepali", "ne-NP"], ["no", "Norsk", "Norwegian"],
  ["ny", "Chichewa", "Nyanja"], ["or", "ଓଡ଼ିଆ", "Odia"], ["om", "Afaan Oromoo", "Oromo"],
  ["ps", "پښتو", "Pashto"], ["fa", "فارسی", "Persian", "fa-IR"], ["pl", "Polski", "Polish"],
  ["pt", "Português", "Portuguese", "pt-PT"], ["pa", "ਪੰਜਾਬੀ", "Punjabi", "pa-IN"], ["qu", "Runasimi", "Quechua"],
  ["ro", "Română", "Romanian"], ["ru", "Русский", "Russian", "ru-RU"], ["sm", "Gagana Sāmoa", "Samoan"],
  ["sa", "संस्कृतम्", "Sanskrit"], ["gd", "Gàidhlig", "Scots Gaelic"], ["nso", "Sepedi", "Sepedi"],
  ["sr", "Српски", "Serbian"], ["st", "Sesotho", "Sesotho"], ["sn", "ChiShona", "Shona"],
  ["sd", "سنڌي", "Sindhi"], ["si", "සිංහල", "Sinhala"], ["sk", "Slovenčina", "Slovak"],
  ["sl", "Slovenščina", "Slovenian"], ["so", "Soomaali", "Somali"], ["es", "Español", "Spanish", "es-ES"],
  ["su", "Basa Sunda", "Sundanese"], ["sw", "Kiswahili", "Swahili"], ["sv", "Svenska", "Swedish"],
  ["ta", "தமிழ்", "Tamil", "ta-IN"], ["tt", "Татарча", "Tatar"], ["te", "తెలుగు", "Telugu", "te-IN"],
  ["th", "ไทย", "Thai", "th-TH"], ["ti", "ትግርኛ", "Tigrinya"], ["ts", "Tsonga", "Tsonga"],
  ["tr", "Türkçe", "Turkish", "tr-TR"], ["tk", "Türkmençe", "Turkmen"], ["ak", "Twi", "Twi"],
  ["uk", "Українська", "Ukrainian"], ["ur", "اردو", "Urdu", "ur-PK"], ["ug", "ئۇيغۇرچە", "Uyghur"],
  ["uz", "Oʻzbekcha", "Uzbek"], ["vi", "Tiếng Việt", "Vietnamese", "vi-VN"], ["cy", "Cymraeg", "Welsh"],
  ["xh", "IsiXhosa", "Xhosa"], ["yi", "ייִדיש", "Yiddish"], ["yo", "Yorùbá", "Yoruba"],
  ["zu", "IsiZulu", "Zulu"],
].map(([id, native, english, speech]) => ({
  id,
  native,
  english,
  dir: RTL_LOCALES.has(id) ? "rtl" : "ltr",
  speech,
}));

export const SPEECH_LANG: Record<string, string> = Object.fromEntries(
  LOCALES.map((locale) => [locale.id, locale.speech ?? locale.id]),
);

export function isLocaleId(v: unknown): v is LocaleId {
  return typeof v === "string" && LOCALES.some((locale) => locale.id === v);
}

export function localeDir(locale: string): "ltr" | "rtl" {
  return LOCALES.find((item) => item.id === locale)?.dir ?? "ltr";
}

const en = {
  "a11y.title": "Accessibility & Preferences",
  "a11y.open": "Accessibility options",
  "a11y.short": "Access",
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

const dictionaries: Record<string, Partial<Record<TranslationKey, string>>> = {
  en,
  hi: {
    "a11y.title": "सुगम्यता और प्राथमिकताएँ",
    "a11y.open": "सुगम्यता विकल्प",
  "a11y.short": "एक्सेस",
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
  "a11y.short": "அணுகல்",
    "a11y.theme": "தீம்",
    "a11y.language": "மொழி",
    "a11y.speech": "பக்கத்தை வாசி",
    "a11y.reset": "இயல்புநிலைக்கு மீட்டமை",
    "a11y.skip": "முதன்மை உள்ளடக்கத்திற்குச் செல்",
  },
  es: {
    "a11y.title": "Accesibilidad y preferencias",
    "a11y.open": "Opciones de accesibilidad",
  "a11y.short": "Acceso",
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
  "a11y.short": "Access",
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
    "a11y.short": "وصول",
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
