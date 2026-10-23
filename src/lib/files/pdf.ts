import { isRtlLanguage } from "@/lib/languages";
import { buildTranslatedDocx } from "./docx";
import type { PreparedFile } from "./types";
import { baseName, translatedName } from "./types";
import { hasLetters } from "./utils";

const MAX_PARAGRAPH_CHARS = 1_200;

function cleanText(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitLongParagraph(paragraph: string): string[] {
  if (paragraph.length <= MAX_PARAGRAPH_CHARS) return [paragraph];

  const sentences = paragraph.split(/(?<=[.!?؟。！？؛;])\s+|\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (!sentence.trim()) continue;
    if ((current + " " + sentence).trim().length > MAX_PARAGRAPH_CHARS && current.trim()) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks.flatMap((chunk) => {
    if (chunk.length <= MAX_PARAGRAPH_CHARS) return [chunk];
    const words = chunk.split(/\s+/);
    const parts: string[] = [];
    let buffer = "";
    for (const word of words) {
      if ((buffer + " " + word).trim().length > MAX_PARAGRAPH_CHARS && buffer.trim()) {
        parts.push(buffer.trim());
        buffer = word;
      } else {
        buffer = buffer ? `${buffer} ${word}` : word;
      }
    }
    if (buffer.trim()) parts.push(buffer.trim());
    return parts;
  });
}

function splitPage(text: string): string[] {
  const cleaned = cleanText(text);
  if (!cleaned) return [];

  const paragraphs = cleaned
    .split(/\n{2,}/)
    .flatMap((paragraph) => splitLongParagraph(paragraph))
    .filter((paragraph) => hasLetters(paragraph));

  return paragraphs;
}

export function preparePdfPages(originalName: string, pages: string[], target: string): PreparedFile {
  const segments: string[] = [];
  const pageSegments: number[][] = pages.map(() => []);

  pages.forEach((page, pageIndex) => {
    for (const paragraph of splitPage(page)) {
      pageSegments[pageIndex].push(segments.length);
      segments.push(paragraph);
    }
  });

  if (!segments.length) {
    throw new Error(
      "لا يحتوي هذا الملف على نص قابل للترجمة. قد يكون PDF ممسوحاً ضوئياً (صور)؛ جرّب نسخة نصية منه.",
    );
  }

  const rtl = isRtlLanguage(target);

  return {
    kind: "pdf",
    originalName,
    outputName: translatedName(originalName, "docx"),
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extension: "pdf",
    segments,
    characters: segments.reduce((total, segment) => total + segment.length, 0),
    note: "PDF يُستخرج نصه ثم يُعاد بصيغة Word قابلة للتعديل؛ قد لا يُحفظ التصميم الأصلي.",
    async rebuild(translations) {
      const translatedPages = pageSegments.map((indexes) =>
        indexes.map((index) => translations[index] ?? "").filter(Boolean),
      );
      return buildTranslatedDocx(translatedPages, {
        rtl,
        title: `${baseName(originalName)} — ترجمة`,
        subject: "ترجمة مستخرجة من PDF",
      });
    },
  };
}
