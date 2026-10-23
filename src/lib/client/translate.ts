export type TranslationMeta = {
  detectedSource: string;
  provider: string;
  characters: number;
  cached: boolean;
};

export type ClientTranslationError = Error & {
  code?: string;
  status?: number;
  retryAfter?: number;
};

const MAX_BATCH_CHARS = 15_000;
const MAX_BATCH_SEGMENTS = 40;

function createError(message: string, status?: number, code?: string, retryAfter?: number): ClientTranslationError {
  const error = new Error(message) as ClientTranslationError;
  error.status = status;
  error.code = code;
  error.retryAfter = retryAfter;
  return error;
}

async function readError(response: Response) {
  let payload: { error?: string; code?: string; retryAfter?: number } = {};
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    // تجاهل
  }
  throw createError(
    payload.error ?? "تعذّرت الترجمة الآن. حاول مرة أخرى.",
    response.status,
    payload.code,
    payload.retryAfter ?? (Number(response.headers.get("retry-after") ?? 0) || undefined),
  );
}

function groupSegments(segments: string[]) {
  const groups: { segments: string[]; start: number }[] = [];
  let current: string[] = [];
  let start = 0;
  let size = 0;

  segments.forEach((segment, index) => {
    if (current.length && (size + segment.length > MAX_BATCH_CHARS || current.length >= MAX_BATCH_SEGMENTS)) {
      groups.push({ segments: current, start });
      current = [];
      start = index;
      size = 0;
    }
    current.push(segment);
    size += segment.length;
  });
  if (current.length) groups.push({ segments: current, start });
  return groups;
}

export async function translateSegmentsClient(
  segments: string[],
  options: {
    source: string;
    target: string;
    signal?: AbortSignal;
    onProgress?: (completed: number, total: number) => void;
  },
): Promise<{ translations: string[]; meta: TranslationMeta }> {
  const groups = groupSegments(segments);
  const translations: string[] = [];
  let meta: TranslationMeta | undefined;

  for (let index = 0; index < groups.length; index += 1) {
    const group = groups[index];
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        segments: group.segments,
        source: options.source,
        target: options.target,
      }),
      signal: options.signal,
    });

    if (!response.ok) await readError(response);

    const payload = (await response.json()) as {
      translations?: string[];
      detectedSource?: string;
      provider?: string;
      characters?: number;
      cached?: boolean;
    };

    if (!Array.isArray(payload.translations) || payload.translations.length !== group.segments.length) {
      throw createError("وصل رد غير مكتمل من خدمة الترجمة. حاول مرة أخرى.", 502, "BAD_RESPONSE");
    }

    translations.push(...payload.translations);
    meta ??= {
      detectedSource: payload.detectedSource ?? options.source,
      provider: payload.provider ?? "google",
      characters: payload.characters ?? 0,
      cached: Boolean(payload.cached),
    };
    options.onProgress?.(Math.min(index + 1, groups.length), groups.length);
  }

  return {
    translations,
    meta:
      meta ??
      ({
        detectedSource: options.source,
        provider: "identity",
        characters: 0,
        cached: true,
      } satisfies TranslationMeta),
  };
}

export async function translateTextClient(
  text: string,
  options: { source: string; target: string; signal?: AbortSignal },
): Promise<{ translation: string; meta: TranslationMeta }> {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, source: options.source, target: options.target }),
    signal: options.signal,
  });

  if (!response.ok) await readError(response);

  const payload = (await response.json()) as {
    translation?: string;
    detectedSource?: string;
    provider?: string;
    characters?: number;
    cached?: boolean;
  };

  if (typeof payload.translation !== "string") {
    throw createError("وصل رد غير مكتمل من خدمة الترجمة. حاول مرة أخرى.", 502, "BAD_RESPONSE");
  }

  return {
    translation: payload.translation,
    meta: {
      detectedSource: payload.detectedSource ?? options.source,
      provider: payload.provider ?? "google",
      characters: payload.characters ?? text.length,
      cached: Boolean(payload.cached),
    },
  };
}
