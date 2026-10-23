import { NextResponse } from "next/server";
import { extractText } from "unpdf";
import { MAX_PDF_BYTES, getExtension } from "@/lib/files/types";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const limit = rateLimit(getClientIp(request), {
    namespace: "pdf-extract",
    requests: 1,
    maxRequests: 12,
    maxCharacters: 0,
    windowMs: 10 * 60_000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "بلغت حد استخراج ملفات PDF مؤقتاً. حاول بعد قليل.",
        code: "RATE_LIMITED",
        retryAfter: limit.retryAfter,
      },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "تعذّر قراءة الملف المرسل.", code: "BAD_REQUEST" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "لم يصل ملف PDF.", code: "BAD_REQUEST" }, { status: 400 });
  }

  if (getExtension(file.name) !== "pdf") {
    return NextResponse.json({ error: "الملف ليس بصيغة PDF.", code: "BAD_REQUEST" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "الملف فارغ.", code: "BAD_REQUEST" }, { status: 400 });
  }

  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json(
      { error: "حجم ملف PDF أكبر من الحد المسموح (10 ميجابايت).", code: "FILE_TOO_LARGE" },
      { status: 413 },
    );
  }

  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const result = await extractText(buffer, { mergePages: false });
    const pages = Array.isArray(result.text) ? result.text : [result.text];

    return NextResponse.json(
      {
        pages: pages.map((page) => page.replace(/\u0000/g, "")),
        totalPages: result.totalPages,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    console.error("[api/pdf/extract] failed", error);
    return NextResponse.json(
      {
        error: "تعذّر قراءة هذا الملف. تأكد أنه PDF صالح وغير محمي بكلمة مرور.",
        code: "PDF_PARSE_FAILED",
      },
      { status: 422 },
    );
  }
}
