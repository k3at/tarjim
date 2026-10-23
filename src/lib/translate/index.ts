import { getLanguage, normalizeLanguageCode } from "@/lib/languages";
import { guessLanguage, getProviders, normalizeDetected, providerLabel, type ProviderError } from "./providers";

export type TranslateResult = {
  text: string;
  detectedSource: string;
  provider: string;
  characters: number;
  cached: boolean;
};

export type TranslateBatchResult = {
  translations: string[];
  detectedSource: string;
  provider: string;
  characters: number;
  cached: boolean;
};

export type TranslateOptions = {
  source: string;
  target: string;
  signal?: AbortSignal;
  maxChars?: number;
};

export class TranslationError extends Error {
  readonly code: string;
  readonly status: number;
  readonly publicMessage: string;

  constructor(code: string, status: number, publicMessage: string, message?: string) {
    super(message ?? publicMessage);
    this.name = "TranslationError";
    this.code = code;
    this.status = status;
    this.publicMessage = publicMessage;
  }
}

const CACHE_LIMIT = 700;
const cache = new Map<string, string>();

function cacheKey(source: string, target: string, text: string) {
  return `${source}\u0000${target}\u0000${text}`;
}

function readCache(source: string, target: string, text: string) {
  const key = cacheKey(source, target, text);
  const value = cache.get(key);
  if (value === undefined) return undefined;
  // تحديث ترتيب الاستخدام (LRU بسيط)
  cache.delete(key);
  cache.set(key, value);
  return value;
}

function writeCache(source: string, target: string, text: string, value: string) {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(cacheKey(source, target, text), value);
}

const LETTERS = /\p{L}/u;

function hasLetters(text: string) {
  return LETTERS.test(text);
}

type Piece = {
  text: string;
  separator: string;
};

type PreparedSegment = {
  pieces: Piece[];
  suffix: string;
};

function splitLongLine(line: string, maxChars: number): string[] {
  if (line.length <= maxChars) return [line];

  const chunks: string[] = [];
  let current = "";

  // نفضّل التقسيم عند علامات الجمل، ثم الكلمات، ثم الأحرف كحل أخير.
  const tokens = line.split(/(\s+)/);
  for (const token of tokens) {
    if (!token) continue;
    if (!/\s+/.test(token) && token.length > maxChars) {
      if (current.trim()) {
        chunks.push(current.trim());
        current = "";
      }
      for (let index = 0; index < token.length; index += maxChars) {
        chunks.push(token.slice(index, index + maxChars));
      }
      continue;
    }
    if ((current + token).length > maxChars && current.trim()) {
      chunks.push(current.trim());
      current = token.trimStart();
    } else {
      current += token;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [line];
}

/**
 * يقسّم النص إلى أجزاء صغيرة مع الحفاظ على الأسطر الفارغة والمسافات الطرفية.
 * كل جزء يترجم منفصلاً ثم يُعاد تجميعه بنفس الفواصل.
 */
function splitSegment(text: string, maxChars: number): PreparedSegment {
  if (text.length <= maxChars) {
    return { pieces: hasLetters(text) ? [{ text, separator: "" }] : [], suffix: text };
  }

  if (!hasLetters(text)) return { pieces: [], suffix: text };

  const pieces: Piece[] = [];
  let pendingPrefix = "";

  const tokens = text.split(/(\n)/);
  for (const token of tokens) {
    if (!token) continue;
    if (token === "\n") {
      pendingPrefix += "\n";
      continue;
    }
    if (!token.trim() || !hasLetters(token)) {
      pendingPrefix += token;
      continue;
    }

    const chunks = splitLongLine(token, maxChars);
    chunks.forEach((chunk, chunkIndex) => {
      pieces.push({ text: chunk, separator: chunkIndex === 0 ? pendingPrefix : " " });
      if (chunkIndex === 0) pendingPrefix = "";
    });
  }

  if (!pieces.length) return { pieces: [], suffix: text };
  return { pieces, suffix: pendingPrefix };
}

type GroupResult = {
  translations: string[];
  detected?: string;
  provider: string;
};

async function translateGroup(
  texts: string[],
  source: string,
  target: string,
  signal: AbortSignal | undefined,
  preferred: { index: number },
): Promise<GroupResult> {
  const providers = getProviders();
  if (!providers.length) {
    throw new TranslationError(
      "NO_PROVIDER",
      503,
      "خدمة الترجمة غير مهيأة حالياً. أضف مفتاح ترجمة في إعدادات الخادم أو حاول لاحقاً.",
    );
  }

  const errors: ProviderError[] = [];

  for (let offset = 0; offset < providers.length; offset += 1) {
    if (signal?.aborted) throw signal.reason ?? new DOMException("Aborted", "AbortError");
    const index = (preferred.index + offset) % providers.length;
    const provider = providers[index];
    try {
      const result = await provider.translate({ texts, source, target, signal });
      preferred.index = index;
      return {
        translations: result.translations,
        detected: result.detected,
        provider: provider.id,
      };
    } catch (error) {
      if (signal?.aborted) throw error;
      errors.push(error as ProviderError);
      console.warn(`[translate] provider ${provider.id} failed:`, (error as Error).message);
    }
  }

  const quotaExceeded = errors.some((error) => error.status === 429);
  throw new TranslationError(
    quotaExceeded ? "QUOTA_EXCEEDED" : "PROVIDERS_UNAVAILABLE",
    503,
    quotaExceeded
      ? "بلغنا الحد المجاني لمحركات الترجمة مؤقتاً. حاول بعد قليل أو استخدم نصاً أقصر."
      : "تعذّر الوصول إلى خدمة الترجمة الآن. تحقق من الاتصال وحاول مرة أخرى.",
    errors.map((error) => error.message).join(" | "),
  );
}

function groupTexts(texts: string[], maxChars = 1600, maxItems = 6) {
  const groups: string[][] = [];
  let current: string[] = [];
  let size = 0;

  for (const text of texts) {
    if (current.length && (size + text.length > maxChars || current.length >= maxItems)) {
      groups.push(current);
      current = [];
      size = 0;
    }
    current.push(text);
    size += text.length;
  }
  if (current.length) groups.push(current);
  return groups;
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, task: (item: T, index: number) => Promise<R>) {
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await task(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function translateSegments(
  input: string[],
  options: TranslateOptions,
): Promise<TranslateBatchResult> {
  const target = normalizeLanguageCode(options.target) ?? options.target;
  const source = options.source === "auto" ? "auto" : (normalizeLanguageCode(options.source) ?? options.source);
  const characters = input.reduce((total, text) => total + text.length, 0);

  if (!getLanguage(target)) {
    throw new TranslationError("INVALID_TARGET", 400, "لغة الهدف غير مدعومة.");
  }
  if (source !== "auto" && !getLanguage(source)) {
    throw new TranslationError("INVALID_SOURCE", 400, "لغة المصدر غير مدعومة.");
  }

  if (source !== "auto" && source === target) {
    return {
      translations: input,
      detectedSource: source,
      provider: "identity",
      characters,
      cached: true,
    };
  }

  const prepared = input.map((text) => splitSegment(text, options.maxChars ?? 1400));

  // اجمع الأجزاء الفريدة لتقليل عدد الطلبات.
  const uniqueTexts: string[] = [];
  const uniqueIndex = new Map<string, number>();
  for (const segment of prepared) {
    for (const piece of segment.pieces) {
      if (!uniqueIndex.has(piece.text)) {
        uniqueIndex.set(piece.text, uniqueTexts.length);
        uniqueTexts.push(piece.text);
      }
    }
  }

  const translatedPieces = new Array<string>(uniqueTexts.length);
  let cacheHits = 0;
  const pending: string[] = [];
  const pendingIndexes: number[] = [];

  uniqueTexts.forEach((text, index) => {
    const cached = readCache(source, target, text);
    if (cached !== undefined) {
      translatedPieces[index] = cached;
      cacheHits += 1;
    } else {
      pending.push(text);
      pendingIndexes.push(index);
    }
  });

  const pendingPosition = new Map(pending.map((text, index) => [text, index]));
  let detected = source !== "auto" ? source : undefined;
  let usedProvider = "identity";

  if (pending.length) {
    const groups = groupTexts(pending);
    const preferred = { index: 0 };
    const providerIds = new Set<string>();

    await mapWithConcurrency(groups, 3, async (group) => {
      const result = await translateGroup(group, source, target, options.signal, preferred);
      providerIds.add(result.provider);
      detected ??= result.detected;
      result.translations.forEach((translation, groupIndex) => {
        const position = pendingPosition.get(group[groupIndex]);
        if (position === undefined) return;
        const globalIndex = pendingIndexes[position];
        translatedPieces[globalIndex] = translation;
        writeCache(source, target, group[groupIndex], translation);
      });
    });

    usedProvider = Array.from(providerIds)[0] ?? "identity";
  }

  // إعادة تجميع كل مقطع مع فواصله الأصلية.
  const translations = prepared.map((segment) => {
    if (!segment.pieces.length) return segment.suffix;
    let output = "";
    for (const piece of segment.pieces) {
      const index = uniqueIndex.get(piece.text);
      const translated = index === undefined ? piece.text : (translatedPieces[index] ?? piece.text);
      output += piece.separator + translated;
    }
    return output + segment.suffix;
  });

  detected = normalizeDetected(detected) ?? (source === "auto" ? guessLanguage(input.join(" ")) : source);

  return {
    translations,
    detectedSource: detected,
    provider: usedProvider,
    characters,
    cached: cacheHits > 0 && pending.length === 0,
  };
}

export async function translateText(text: string, options: TranslateOptions): Promise<TranslateResult> {
  const result = await translateSegments([text], options);
  return {
    text: result.translations[0] ?? "",
    detectedSource: result.detectedSource,
    provider: result.provider,
    characters: result.characters,
    cached: result.cached,
  };
}

export function providerName(id: string) {
  if (id === "identity") return "بدون تغيير";
  return providerLabel(id);
}

export function isTranslationError(error: unknown): error is TranslationError {
  return error instanceof TranslationError;
}
