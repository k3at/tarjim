import { NextResponse } from "next/server";
import { getLanguage } from "@/lib/languages";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isTranslationError, translateSegments } from "@/lib/translate";

export const maxDuration = 60;

const MAX_TEXT_CHARS = 5_000;
const MAX_BATCH_CHARS = 20_000;
const MAX_SEGMENTS = 60;

type Payload = {
  text?: unknown;
  segments?: unknown;
  source?: unknown;
  target?: unknown;
};

function badRequest(message: string) {
  return NextResponse.json({ error: message, code: "BAD_REQUEST" }, { status: 400 });
}

export async function POST(request: Request) {
  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return badRequest("تعذّر قراءة الطلب. أرسل بيانات صحيحة بصيغة JSON.");
  }

  const source = typeof payload.source === "string" ? payload.source : "auto";
  const target = typeof payload.target === "string" ? payload.target : "";

  if (!target) return badRequest("اختر لغة الهدف أولاً.");
  if (target === "auto") return badRequest("لغة الهدف يجب أن تكون لغة محددة.");
  if (!getLanguage(target)) return badRequest("لغة الهدف غير مدعومة.");
  if (source !== "auto" && !getLanguage(source)) return badRequest("لغة المصدر غير مدعومة.");

  let segments: string[];
  let singleText = false;

  if (typeof payload.text === "string") {
    singleText = true;
    segments = [payload.text];
  } else if (Array.isArray(payload.segments) && payload.segments.every((item) => typeof item === "string")) {
    segments = payload.segments as string[];
  } else {
    return badRequest("أرسل نصاً (text) أو قائمة مقاطع (segments).");
  }

  if (!segments.length) return badRequest("لا يوجد نص للترجمة.");
  if (segments.length > MAX_SEGMENTS) {
    return badRequest(`عدد المقاطع كبير جداً. الحد الأقصى ${MAX_SEGMENTS} مقطعاً.`);
  }

  const totalChars = segments.reduce((total, segment) => total + segment.length, 0);
  if (totalChars === 0) return badRequest("النص فارغ.");
  if (singleText && totalChars > MAX_TEXT_CHARS) {
    return badRequest(`النص أطول من الحد المسموح (${MAX_TEXT_CHARS.toLocaleString("ar-EG")} حرف).`);
  }
  if (!singleText && totalChars > MAX_BATCH_CHARS) {
    return badRequest(`حجم النص كبير جداً. أرسل دفعات أصغر من ${MAX_BATCH_CHARS.toLocaleString("ar-EG")} حرف.`);
  }

  const limit = rateLimit(getClientIp(request), {
    namespace: "translate",
    characters: totalChars,
    requests: 1,
    maxCharacters: 120_000,
    maxRequests: 80,
    windowMs: 10 * 60_000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "بلغت حد الاستخدام المجاني مؤقتاً. انتظر قليلاً ثم حاول مجدداً.",
        code: "RATE_LIMITED",
        retryAfter: limit.retryAfter,
      },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  try {
    const result = await translateSegments(segments, {
      source,
      target,
      signal: request.signal,
      maxChars: 1_400,
    });

    return NextResponse.json(
      {
        translation: singleText ? result.translations[0] : undefined,
        translations: result.translations,
        detectedSource: result.detectedSource,
        provider: result.provider,
        characters: result.characters,
        cached: result.cached,
      },
      {
        headers: {
          "cache-control": "no-store",
          "x-ratelimit-remaining": String(limit.remainingCharacters),
        },
      },
    );
  } catch (error) {
    if (request.signal.aborted) {
      return NextResponse.json({ error: "أُلغي الطلب.", code: "ABORTED" }, { status: 499 });
    }

    if (isTranslationError(error)) {
      return NextResponse.json(
        { error: error.publicMessage, code: error.code },
        { status: error.status, headers: { "cache-control": "no-store" } },
      );
    }

    console.error("[api/translate] unexpected error", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء الترجمة. حاول مرة أخرى.", code: "INTERNAL" },
      { status: 500 },
    );
  }
}
