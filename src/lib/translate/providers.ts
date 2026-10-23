import { normalizeLanguageCode } from "@/lib/languages";

export type ProviderId =
  | "deepl"
  | "google-cloud"
  | "microsoft"
  | "google-clients5"
  | "google"
  | "mymemory"
  | "libre";

export type ProviderResult = {
  translations: string[];
  detected?: string;
};

export type TranslateRequest = {
  texts: string[];
  source: string;
  target: string;
  signal?: AbortSignal;
};

export type Provider = {
  id: ProviderId;
  label: string;
  isConfigured: () => boolean;
  translate: (request: TranslateRequest) => Promise<ProviderResult>;
};

export class ProviderError extends Error {
  readonly provider: ProviderId;
  readonly status?: number;

  constructor(message: string, provider: ProviderId, status?: number) {
    super(message);
    this.name = "ProviderError";
    this.provider = provider;
    this.status = status;
  }
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

function requestSignal(signal: AbortSignal | undefined, timeoutMs: number) {
  const timeout = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

async function readError(response: Response, provider: ProviderId) {
  let detail = "";
  try {
    detail = (await response.text()).slice(0, 400);
  } catch {
    // تجاهل فشل قراءة النص
  }
  throw new ProviderError(`${provider} responded with ${response.status}: ${detail}`, provider, response.status);
}

function ensureTranslations(provider: ProviderId, translations: string[], expected: number) {
  if (translations.length !== expected) {
    throw new ProviderError(
      `${provider} returned ${translations.length} translations for ${expected} segments`,
      provider,
    );
  }
  return translations;
}

/* -------------------------------------------------------------------------- */
/*                               Google Translate                             */
/* -------------------------------------------------------------------------- */

type GoogleEntry = [string, string] | string;

function parseGooglePayload(payload: unknown): { translations: string[]; detected?: string } {
  if (!Array.isArray(payload)) throw new Error("Unexpected Google response");

  // الشكل القديم: [[["النص المترجم", "الأصل", ...]], null, "en", ...]
  const sentences = payload[0];
  if (Array.isArray(sentences) && Array.isArray(sentences[0]) && typeof sentences[0][0] === "string") {
    const translated = (sentences as unknown[][])
      .map((sentence) => (typeof sentence?.[0] === "string" ? sentence[0] : ""))
      .join("");
    return { translations: [translated], detected: typeof payload[2] === "string" ? payload[2] : undefined };
  }

  // الشكل الحديث: [["مرحبا", "en"], ["صباح الخير", "en"]]
  const entries = payload as GoogleEntry[];
  const translations = entries.map((entry) => {
    if (Array.isArray(entry)) return String(entry[0] ?? "");
    if (typeof entry === "string") return entry;
    return "";
  });
  const first = entries[0];
  const detected = Array.isArray(first) && typeof first[1] === "string" ? first[1] : undefined;
  return { translations, detected };
}

async function googleSingle(text: string, source: string, target: string, signal?: AbortSignal) {
  const response = await fetch("https://translate.googleapis.com/translate_a/single", {
    method: "POST",
    headers: {
      "user-agent": USER_AGENT,
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ client: "gtx", sl: source, tl: target, dt: "t", q: text }),
    signal: requestSignal(signal, 16_000),
    cache: "no-store",
  });

  if (!response.ok) await readError(response, "google");
  const payload = await response.json();
  const parsed = parseGooglePayload(payload);
  if (!parsed.translations[0] && text.trim()) {
    throw new ProviderError("Google returned an empty translation", "google");
  }
  return parsed;
}

const googleProvider: Provider = {
  id: "google",
  label: "Google Translate",
  isConfigured: () => true,
  async translate({ texts, source, target, signal }) {
    const results: string[] = [];
    let detected: string | undefined;
    for (const text of texts) {
      const result = await googleSingle(text, source, target, signal);
      results.push(result.translations[0] ?? "");
      detected ??= result.detected;
    }
    return { translations: results, detected };
  },
};

function parseClients5Payload(payload: unknown) {
  const entries = Array.isArray(payload) ? payload : [payload];
  return entries.map((entry) => {
    if (Array.isArray(entry)) {
      return { text: String(entry[0] ?? ""), detected: typeof entry[1] === "string" ? entry[1] : undefined };
    }
    if (entry && typeof entry === "object" && "value" in entry) {
      const value = (entry as { value?: unknown }).value;
      if (Array.isArray(value)) {
        return { text: String(value[0] ?? ""), detected: typeof value[1] === "string" ? value[1] : undefined };
      }
    }
    return { text: typeof entry === "string" ? entry : "", detected: undefined };
  });
}

const clients5Provider: Provider = {
  id: "google-clients5",
  label: "Google Translate (web)",
  isConfigured: () => true,
  async translate({ texts, source, target, signal }) {
    const body = new URLSearchParams({ client: "dict-chrome-ex", sl: source, tl: target });
    for (const text of texts) body.append("q", text);

    const response = await fetch("https://clients5.google.com/translate_a/t", {
      method: "POST",
      headers: {
        "user-agent": USER_AGENT,
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
      signal: requestSignal(signal, 16_000),
      cache: "no-store",
    });
    if (!response.ok) await readError(response, "google-clients5");

    const payload = await response.json();
    const parsed = parseClients5Payload(payload);
    return {
      translations: ensureTranslations(
        "google-clients5",
        parsed.map((entry) => entry.text),
        texts.length,
      ),
      detected: parsed.find((entry) => entry.detected)?.detected,
    };
  },
};

/* -------------------------------------------------------------------------- */
/*                              Google Cloud API                              */
/* -------------------------------------------------------------------------- */

const googleCloudProvider: Provider = {
  id: "google-cloud",
  label: "Google Cloud Translation",
  isConfigured: () => Boolean(process.env.GOOGLE_TRANSLATE_API_KEY),
  async translate({ texts, source, target, signal }) {
    const key = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!key) throw new ProviderError("Google Cloud key is missing", "google-cloud");
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${key}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        q: texts,
        target,
        format: "text",
        ...(source !== "auto" ? { source } : {}),
      }),
      signal: requestSignal(signal, 20_000),
      cache: "no-store",
    });
    if (!response.ok) await readError(response, "google-cloud");

    const payload = (await response.json()) as {
      data?: { translations?: { translatedText: string; detectedSourceLanguage?: string }[] };
    };
    const translations = payload.data?.translations ?? [];
    return {
      translations: ensureTranslations(
        "google-cloud",
        translations.map((entry) => entry.translatedText),
        texts.length,
      ),
      detected: translations.find((entry) => entry.detectedSourceLanguage)?.detectedSourceLanguage,
    };
  },
};

/* -------------------------------------------------------------------------- */
/*                                   DeepL                                    */
/* -------------------------------------------------------------------------- */

const DEEPL_SOURCE: Record<string, string> = { en: "EN", ar: "AR", he: "HE", "zh-CN": "ZH", "zh-TW": "ZH" };
const DEEPL_TARGET: Record<string, string> = {
  en: "EN-GB",
  pt: "PT-PT",
  "zh-CN": "ZH-HANS",
  "zh-TW": "ZH-HANT",
};

function deeplTarget(target: string) {
  return DEEPL_TARGET[target] ?? target.toUpperCase();
}

const deeplProvider: Provider = {
  id: "deepl",
  label: "DeepL",
  isConfigured: () => Boolean(process.env.DEEPL_API_KEY),
  async translate({ texts, source, target, signal }) {
    const key = process.env.DEEPL_API_KEY;
    if (!key) throw new ProviderError("DeepL key is missing", "deepl");

    const endpoint =
      process.env.DEEPL_API_URL ?? (key.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com");
    const body = new URLSearchParams();
    for (const text of texts) body.append("text", text);
    body.set("target_lang", deeplTarget(target));
    if (source !== "auto") body.set("source_lang", DEEPL_SOURCE[source] ?? source.toUpperCase());

    const response = await fetch(`${endpoint}/v2/translate`, {
      method: "POST",
      headers: {
        authorization: `DeepL-Auth-Key ${key}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
      signal: requestSignal(signal, 20_000),
      cache: "no-store",
    });
    if (!response.ok) await readError(response, "deepl");

    const payload = (await response.json()) as {
      translations?: { text: string; detected_source_language?: string }[];
    };
    const translations = payload.translations ?? [];
    return {
      translations: ensureTranslations(
        "deepl",
        translations.map((entry) => entry.text),
        texts.length,
      ),
      detected: translations[0]?.detected_source_language?.toLowerCase(),
    };
  },
};

/* -------------------------------------------------------------------------- */
/*                              Microsoft Azure                               */
/* -------------------------------------------------------------------------- */

const MS_SOURCE: Record<string, string> = { "zh-CN": "zh-Hans", "zh-TW": "zh-Hant" };
const MS_TARGET: Record<string, string> = { "zh-CN": "zh-Hans", "zh-TW": "zh-Hant" };

const microsoftProvider: Provider = {
  id: "microsoft",
  label: "Microsoft Translator",
  isConfigured: () => Boolean(process.env.MICROSOFT_TRANSLATOR_KEY),
  async translate({ texts, source, target, signal }) {
    const key = process.env.MICROSOFT_TRANSLATOR_KEY;
    if (!key) throw new ProviderError("Microsoft key is missing", "microsoft");

    const url = new URL("https://api.cognitive.microsofttranslator.com/translate");
    url.searchParams.set("api-version", "3.0");
    url.searchParams.set("to", MS_TARGET[target] ?? target);
    if (source !== "auto") url.searchParams.set("from", MS_SOURCE[source] ?? source);

    const headers: Record<string, string> = {
      "Ocp-Apim-Subscription-Key": key,
      "content-type": "application/json",
    };
    if (process.env.MICROSOFT_TRANSLATOR_REGION) {
      headers["Ocp-Apim-Subscription-Region"] = process.env.MICROSOFT_TRANSLATOR_REGION;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(texts.map((text) => ({ Text: text }))),
      signal: requestSignal(signal, 20_000),
      cache: "no-store",
    });
    if (!response.ok) await readError(response, "microsoft");

    const payload = (await response.json()) as {
      translations?: { text: string }[];
      detectedLanguage?: { language?: string };
    }[];

    return {
      translations: ensureTranslations(
        "microsoft",
        payload.map((item) => item.translations?.[0]?.text ?? ""),
        texts.length,
      ),
      detected: payload.find((item) => item.detectedLanguage?.language)?.detectedLanguage?.language,
    };
  },
};

/* -------------------------------------------------------------------------- */
/*                                 MyMemory                                   */
/* -------------------------------------------------------------------------- */

/** تخمين لغة المصدر عندما لا تدعمها خدمة الاحتياط الكشف التلقائي. */
export function guessLanguage(text: string): string {
  const sample = text.slice(0, 600);
  const tests: [RegExp, string][] = [
    [/[\u0600-\u06FF]/u, "ar"],
    [/[\u0590-\u05FF]/u, "he"],
    [/[\u0400-\u04FF]/u, "ru"],
    [/[\u0370-\u03FF]/u, "el"],
    [/[\u3040-\u30FF]/u, "ja"],
    [/[\uAC00-\uD7AF]/u, "ko"],
    [/[\u4E00-\u9FFF]/u, "zh-CN"],
    [/[\u0900-\u097F]/u, "hi"],
    [/[\u0980-\u09FF]/u, "bn"],
    [/[\u0E00-\u0E7F]/u, "th"],
    [/[\u10A0-\u10FF]/u, "ka"],
    [/[\u0530-\u058F]/u, "hy"],
  ];
  for (const [pattern, code] of tests) {
    if (pattern.test(sample)) return code;
  }
  return "en";
}

function splitByBytes(text: string, maxBytes: number): string[] {
  const encoder = new TextEncoder();
  if (encoder.encode(text).length <= maxBytes) return [text];

  const chunks: string[] = [];
  let current = "";
  for (const char of text) {
    const next = current + char;
    if (encoder.encode(next).length > maxBytes) {
      if (current) chunks.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

const myMemoryProvider: Provider = {
  id: "mymemory",
  label: "MyMemory",
  isConfigured: () => true,
  async translate({ texts, source, target, signal }) {
    const results: string[] = [];
    let detected: string | undefined;

    for (const text of texts) {
      const resolvedSource = source === "auto" ? guessLanguage(text) : source;
      if (resolvedSource === target) {
        results.push(text);
        detected ??= resolvedSource;
        continue;
      }

      const translatedChunks: string[] = [];
      for (const chunk of splitByBytes(text, 460)) {
        const url = new URL("https://api.mymemory.translated.net/get");
        url.searchParams.set("q", chunk);
        url.searchParams.set("langpair", `${resolvedSource}|${target}`);
        if (process.env.MYMEMORY_EMAIL) url.searchParams.set("de", process.env.MYMEMORY_EMAIL);

        const response = await fetch(url, {
          headers: { "user-agent": USER_AGENT, accept: "application/json" },
          signal: requestSignal(signal, 16_000),
          cache: "no-store",
        });
        if (!response.ok) await readError(response, "mymemory");

        const payload = (await response.json()) as {
          responseData?: { translatedText?: string };
          responseStatus?: number | string;
          responseDetails?: string;
          quotaFinished?: boolean;
        };

        const translated = payload.responseData?.translatedText ?? "";
        const status = Number(payload.responseStatus ?? 200);
        if (
          payload.quotaFinished ||
          status === 429 ||
          status === 403 ||
          /MYMEMORY WARNING|QUOTA|LIMIT EXCEEDED/i.test(translated) ||
          /MYMEMORY WARNING|QUOTA/i.test(payload.responseDetails ?? "")
        ) {
          throw new ProviderError("MyMemory quota exhausted", "mymemory", 429);
        }
        if (!translated) throw new ProviderError("MyMemory returned an empty translation", "mymemory");
        translatedChunks.push(translated);
      }

      results.push(translatedChunks.join(" "));
      detected ??= resolvedSource;
    }

    return { translations: results, detected };
  },
};

/* -------------------------------------------------------------------------- */
/*                                LibreTranslate                              */
/* -------------------------------------------------------------------------- */

const libreProvider: Provider = {
  id: "libre",
  label: "LibreTranslate",
  isConfigured: () => Boolean(process.env.LIBRETRANSLATE_URL),
  async translate({ texts, source, target, signal }) {
    const base = process.env.LIBRETRANSLATE_URL;
    if (!base) throw new ProviderError("LibreTranslate URL is missing", "libre");

    const results: string[] = [];
    let detected: string | undefined;
    for (const text of texts) {
      const response = await fetch(`${base.replace(/\/$/, "")}/translate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          q: text,
          source,
          target,
          format: "text",
          ...(process.env.LIBRETRANSLATE_API_KEY ? { api_key: process.env.LIBRETRANSLATE_API_KEY } : {}),
        }),
        signal: requestSignal(signal, 20_000),
        cache: "no-store",
      });
      if (!response.ok) await readError(response, "libre");
      const payload = (await response.json()) as {
        translatedText?: string;
        detectedLanguage?: { language?: string } | string;
      };
      if (!payload.translatedText) {
        throw new ProviderError("LibreTranslate returned an empty translation", "libre");
      }
      results.push(payload.translatedText);
      if (typeof payload.detectedLanguage === "string") detected ??= payload.detectedLanguage;
      else detected ??= payload.detectedLanguage?.language;
    }
    return { translations: results, detected };
  },
};

/* -------------------------------------------------------------------------- */
/*                                  Registry                                  */
/* -------------------------------------------------------------------------- */

const ALL_PROVIDERS: Provider[] = [
  deeplProvider,
  googleCloudProvider,
  microsoftProvider,
  clients5Provider,
  googleProvider,
  myMemoryProvider,
  libreProvider,
];

const aliases: Record<string, ProviderId[]> = {
  google: ["google"],
  "google-web": ["google"],
  gtx: ["google"],
  clients5: ["google-clients5"],
  "google-clients5": ["google-clients5"],
  "google-cloud": ["google-cloud"],
  deepl: ["deepl"],
  microsoft: ["microsoft"],
  mymemory: ["mymemory"],
  libre: ["libre"],
  libretranslate: ["libre"],
};

let cachedProviders: Provider[] | undefined;

export function getProviders(): Provider[] {
  if (cachedProviders) return cachedProviders;

  const configured = ALL_PROVIDERS.filter((provider) => provider.isConfigured());
  const order = process.env.TRANSLATION_PROVIDERS?.split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);

  if (order?.length) {
    const selected: Provider[] = [];
    for (const name of order) {
      for (const id of aliases[name] ?? []) {
        const provider = configured.find((entry) => entry.id === id);
        if (provider && !selected.includes(provider)) selected.push(provider);
      }
    }
    if (selected.length) {
      cachedProviders = selected;
      return selected;
    }
  }

  cachedProviders = configured;
  return configured;
}

export function providerLabel(id: string) {
  return ALL_PROVIDERS.find((provider) => provider.id === id)?.label ?? id;
}

export function normalizeDetected(code?: string) {
  return normalizeLanguageCode(code);
}

export function buildLangPair(source: string, target: string) {
  return `${source}:${target}`;
}
