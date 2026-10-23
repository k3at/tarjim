import { prepareOfficeFile } from "./ooxml";
import { preparePdfPages } from "./pdf";
import { prepareTextFile } from "./text";
import {
  MAX_FILE_BYTES,
  MAX_FILE_CHARACTERS,
  OFFICE_EXTENSIONS,
  PDF_EXTENSIONS,
  TEXT_EXTENSIONS,
  getExtension,
  isSupportedExtension,
  type PreparedFile,
} from "./types";

export class FilePreparationError extends Error {
  readonly code: string;

  constructor(message: string, code = "FILE_ERROR") {
    super(message);
    this.name = "FilePreparationError";
    this.code = code;
  }
}

async function extractPdf(file: File, signal?: AbortSignal): Promise<string[]> {
  const form = new FormData();
  form.set("file", file);

  const response = await fetch("/api/pdf/extract", {
    method: "POST",
    body: form,
    signal,
  });

  if (!response.ok) {
    let message = "تعذّر استخراج النص من ملف PDF. حاول مرة أخرى.";
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) message = payload.error;
    } catch {
      // تجاهل
    }
    throw new FilePreparationError(message, "PDF_EXTRACT_FAILED");
  }

  const payload = (await response.json()) as { pages?: string[] };
  if (!Array.isArray(payload.pages)) {
    throw new FilePreparationError("وصل رد غير مكتمل من خدمة قراءة PDF.", "PDF_EXTRACT_FAILED");
  }
  return payload.pages;
}

export async function prepareFile(file: File, target: string, signal?: AbortSignal): Promise<PreparedFile> {
  const extension = getExtension(file.name);

  if (!isSupportedExtension(extension)) {
    throw new FilePreparationError("صيغة الملف غير مدعومة. راجع قائمة الصيغ المتاحة.", "UNSUPPORTED");
  }

  if (file.size === 0) {
    throw new FilePreparationError("الملف فارغ.", "EMPTY");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new FilePreparationError("حجم الملف أكبر من الحد المسموح (12 ميجابايت).", "TOO_LARGE");
  }

  if ((PDF_EXTENSIONS as readonly string[]).includes(extension)) {
    const pages = await extractPdf(file, signal);
    return preparePdfPages(file.name, pages, target);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  let prepared: PreparedFile;
  if ((OFFICE_EXTENSIONS as readonly string[]).includes(extension)) {
    prepared = prepareOfficeFile(file.name, bytes, target);
  } else if ((TEXT_EXTENSIONS as readonly string[]).includes(extension)) {
    prepared = prepareTextFile(file.name, bytes);
  } else {
    throw new FilePreparationError("صيغة الملف غير مدعومة.", "UNSUPPORTED");
  }

  if (!prepared.segments.length) {
    throw new FilePreparationError("لم نعثر على نص قابل للترجمة داخل الملف.", "NO_TEXT");
  }

  if (prepared.characters > MAX_FILE_CHARACTERS) {
    throw new FilePreparationError(
      `حجم النص داخل الملف يتجاوز الحد المجاني (${MAX_FILE_CHARACTERS.toLocaleString("ar-EG")} حرف).`,
      "TOO_LARGE",
    );
  }

  return prepared;
}

export type { PreparedFile };
