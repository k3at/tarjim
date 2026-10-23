export type Language = {
  /** رمز اللغة المستخدم في محركات الترجمة */
  code: string;
  /** الاسم بالعربية */
  nameAr: string;
  /** الاسم بالإنجليزية */
  nameEn: string;
  /** الاسم بلغة أهلها */
  native: string;
  /** اتجاه الكتابة */
  rtl?: boolean;
};

/**
 * لغات مدعومة عبر Google / MyMemory / DeepL وغيرها.
 * الرموز تتبع ISO 639-1 مع استثناءات معروفة مثل zh-CN.
 */
export const LANGUAGES: Language[] = [
  { code: "ar", nameAr: "العربية", nameEn: "Arabic", native: "العربية", rtl: true },
  { code: "en", nameAr: "الإنجليزية", nameEn: "English", native: "English" },
  { code: "fr", nameAr: "الفرنسية", nameEn: "French", native: "Français" },
  { code: "es", nameAr: "الإسبانية", nameEn: "Spanish", native: "Español" },
  { code: "de", nameAr: "الألمانية", nameEn: "German", native: "Deutsch" },
  { code: "tr", nameAr: "التركية", nameEn: "Turkish", native: "Türkçe" },
  { code: "ru", nameAr: "الروسية", nameEn: "Russian", native: "Русский" },
  { code: "zh-CN", nameAr: "الصينية (المبسطة)", nameEn: "Chinese (Simplified)", native: "简体中文" },
  { code: "zh-TW", nameAr: "الصينية (التقليدية)", nameEn: "Chinese (Traditional)", native: "繁體中文" },
  { code: "ja", nameAr: "اليابانية", nameEn: "Japanese", native: "日本語" },
  { code: "ko", nameAr: "الكورية", nameEn: "Korean", native: "한국어" },
  { code: "hi", nameAr: "الهندية", nameEn: "Hindi", native: "हिन्दी" },
  { code: "ur", nameAr: "الأردية", nameEn: "Urdu", native: "اردو", rtl: true },
  { code: "fa", nameAr: "الفارسية", nameEn: "Persian", native: "فارسی", rtl: true },
  { code: "it", nameAr: "الإيطالية", nameEn: "Italian", native: "Italiano" },
  { code: "pt", nameAr: "البرتغالية", nameEn: "Portuguese", native: "Português" },
  { code: "nl", nameAr: "الهولندية", nameEn: "Dutch", native: "Nederlands" },
  { code: "pl", nameAr: "البولندية", nameEn: "Polish", native: "Polski" },
  { code: "uk", nameAr: "الأوكرانية", nameEn: "Ukrainian", native: "Українська" },
  { code: "ro", nameAr: "الرومانية", nameEn: "Romanian", native: "Română" },
  { code: "el", nameAr: "اليونانية", nameEn: "Greek", native: "Ελληνικά" },
  { code: "sv", nameAr: "السويدية", nameEn: "Swedish", native: "Svenska" },
  { code: "da", nameAr: "الدنماركية", nameEn: "Danish", native: "Dansk" },
  { code: "nb", nameAr: "النرويجية", nameEn: "Norwegian", native: "Norsk bokmål" },
  { code: "fi", nameAr: "الفنلندية", nameEn: "Finnish", native: "Suomi" },
  { code: "cs", nameAr: "التشيكية", nameEn: "Czech", native: "Čeština" },
  { code: "sk", nameAr: "السلوفاكية", nameEn: "Slovak", native: "Slovenčina" },
  { code: "hu", nameAr: "المجرية", nameEn: "Hungarian", native: "Magyar" },
  { code: "bg", nameAr: "البلغارية", nameEn: "Bulgarian", native: "Български" },
  { code: "hr", nameAr: "الكرواتية", nameEn: "Croatian", native: "Hrvatski" },
  { code: "sr", nameAr: "الصربية", nameEn: "Serbian", native: "Српски" },
  { code: "sl", nameAr: "السلوفينية", nameEn: "Slovenian", native: "Slovenščina" },
  { code: "lt", nameAr: "الليتوانية", nameEn: "Lithuanian", native: "Lietuvių" },
  { code: "lv", nameAr: "اللاتفية", nameEn: "Latvian", native: "Latviešu" },
  { code: "et", nameAr: "الإستونية", nameEn: "Estonian", native: "Eesti" },
  { code: "he", nameAr: "العبرية", nameEn: "Hebrew", native: "עברית", rtl: true },
  { code: "id", nameAr: "الإندونيسية", nameEn: "Indonesian", native: "Bahasa Indonesia" },
  { code: "ms", nameAr: "الماليزية", nameEn: "Malay", native: "Bahasa Melayu" },
  { code: "th", nameAr: "التايلاندية", nameEn: "Thai", native: "ไทย" },
  { code: "vi", nameAr: "الفيتنامية", nameEn: "Vietnamese", native: "Tiếng Việt" },
  { code: "bn", nameAr: "البنغالية", nameEn: "Bengali", native: "বাংলা" },
  { code: "ta", nameAr: "التاميلية", nameEn: "Tamil", native: "தமிழ்" },
  { code: "te", nameAr: "التيلوغوية", nameEn: "Telugu", native: "తెలుగు" },
  { code: "sw", nameAr: "السواحيلية", nameEn: "Swahili", native: "Kiswahili" },
  { code: "az", nameAr: "الأذربيجانية", nameEn: "Azerbaijani", native: "Azərbaycanca" },
  { code: "kk", nameAr: "الكازاخية", nameEn: "Kazakh", native: "Қазақша" },
  { code: "uz", nameAr: "الأوزبكية", nameEn: "Uzbek", native: "Oʻzbekcha" },
  { code: "sq", nameAr: "الألبانية", nameEn: "Albanian", native: "Shqip" },
  { code: "mk", nameAr: "المقدونية", nameEn: "Macedonian", native: "Македонски" },
  { code: "bs", nameAr: "البوسنية", nameEn: "Bosnian", native: "Bosanski" },
  { code: "ca", nameAr: "الكتالونية", nameEn: "Catalan", native: "Català" },
  { code: "gl", nameAr: "الغاليسية", nameEn: "Galician", native: "Galego" },
  { code: "is", nameAr: "الأيسلندية", nameEn: "Icelandic", native: "Íslenska" },
  { code: "ga", nameAr: "الأيرلندية", nameEn: "Irish", native: "Gaeilge" },
  { code: "mt", nameAr: "المالطية", nameEn: "Maltese", native: "Malti" },
  { code: "af", nameAr: "الأفريكانية", nameEn: "Afrikaans", native: "Afrikaans" },
  { code: "am", nameAr: "الأمهرية", nameEn: "Amharic", native: "አማርኛ" },
  { code: "ne", nameAr: "النيبالية", nameEn: "Nepali", native: "नेपाली" },
  { code: "si", nameAr: "السنهالية", nameEn: "Sinhala", native: "සිංහල" },
  { code: "km", nameAr: "الخميرية", nameEn: "Khmer", native: "ខ្មែរ" },
  { code: "lo", nameAr: "اللاوية", nameEn: "Lao", native: "ລາວ" },
  { code: "my", nameAr: "البورمية", nameEn: "Burmese", native: "မြန်မာ" },
  { code: "mn", nameAr: "المنغولية", nameEn: "Mongolian", native: "Монгол" },
  { code: "ka", nameAr: "الجورجية", nameEn: "Georgian", native: "ქართული" },
  { code: "hy", nameAr: "الأرمنية", nameEn: "Armenian", native: "Հայերեն" },
  { code: "yo", nameAr: "اليوروبا", nameEn: "Yoruba", native: "Yorùbá" },
  { code: "ig", nameAr: "الإيغبو", nameEn: "Igbo", native: "Igbo" },
  { code: "ha", nameAr: "الهوسا", nameEn: "Hausa", native: "Hausa" },
  { code: "zu", nameAr: "الزولو", nameEn: "Zulu", native: "isiZulu" },
  { code: "so", nameAr: "الصومالية", nameEn: "Somali", native: "Soomaali" },
  { code: "ps", nameAr: "الباشتو", nameEn: "Pashto", native: "پښتو", rtl: true },
  { code: "ku", nameAr: "الكردية", nameEn: "Kurdish", native: "Kurdî" },
  { code: "sd", nameAr: "السندية", nameEn: "Sindhi", native: "سنڌي", rtl: true },
  { code: "ug", nameAr: "الأويغورية", nameEn: "Uyghur", native: "ئۇيغۇرچە", rtl: true },
  { code: "ky", nameAr: "القيرغيزية", nameEn: "Kyrgyz", native: "Кыргызча" },
  { code: "tg", nameAr: "الطاجيكية", nameEn: "Tajik", native: "Тоҷикӣ" },
  { code: "be", nameAr: "البيلاروسية", nameEn: "Belarusian", native: "Беларуская" },
  { code: "lb", nameAr: "اللوكسمبورغية", nameEn: "Luxembourgish", native: "Lëtzebuergesch" },
  { code: "cy", nameAr: "الويلزية", nameEn: "Welsh", native: "Cymraeg" },
  { code: "eo", nameAr: "الإسبرانتو", nameEn: "Esperanto", native: "Esperanto" },
];

export const POPULAR_LANGUAGE_CODES = [
  "ar",
  "en",
  "fr",
  "es",
  "de",
  "tr",
  "ru",
  "zh-CN",
  "ja",
  "hi",
  "ur",
  "fa",
] as const;

export const POPULAR_LANGUAGES = POPULAR_LANGUAGE_CODES.map(
  (code) => LANGUAGES.find((language) => language.code === code)!,
);

const languageByCode = new Map(LANGUAGES.map((language) => [language.code, language]));

/** توحيد الرموز التي تعيدها المحركات (iw → he، zh → zh-CN…). */
export function normalizeLanguageCode(code?: string | null): string | undefined {
  if (!code) return undefined;
  const clean = code.trim();
  if (!clean) return undefined;
  if (clean === "auto") return "auto";
  const aliases: Record<string, string> = {
    iw: "he",
    in: "id",
    ji: "yi",
    jw: "jv",
    mo: "ro",
    tl: "fil",
    zh: "zh-CN",
    "zh-cn": "zh-CN",
    "zh-tw": "zh-TW",
    "pt-br": "pt",
    "pt-pt": "pt",
    nb: "nb",
    no: "nb",
  };
  const normalized = aliases[clean.toLowerCase()] ?? clean;
  return languageByCode.has(normalized) ? normalized : normalized;
}

export function getLanguage(code?: string | null): Language | undefined {
  if (!code) return undefined;
  return languageByCode.get(normalizeLanguageCode(code) ?? code);
}

export function languageName(code?: string | null, fallback = "لغة غير معروفة") {
  return getLanguage(code)?.nameAr ?? fallback;
}

export function isRtlLanguage(code?: string | null) {
  return Boolean(getLanguage(code)?.rtl);
}

export const RTL_LANGUAGE_CODES = new Set(
  LANGUAGES.filter((language) => language.rtl).map((language) => language.code),
);
