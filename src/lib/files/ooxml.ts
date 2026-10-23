import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { isRtlLanguage } from "@/lib/languages";
import type { PreparedFile } from "./types";
import { getExtension, translatedName } from "./types";
import { decodeXml, escapeXml, hasLetters } from "./utils";

type PartPlan = {
  path: string;
  xml: string;
  segments: string[];
  rebuild: (translations: string[]) => string;
};

function isEmptyText(text: string) {
  return !hasLetters(text) && !/\d/.test(text);
}

function ensurePreserve(attributes: string) {
  return /xml:space\s*=/.test(attributes) ? attributes : `${attributes} xml:space="preserve"`;
}

/* -------------------------------------------------------------------------- */
/*                                    DOCX                                    */
/* -------------------------------------------------------------------------- */

function splitByRuns(text: string, runLengths: number[]): string[] {
  if (runLengths.length === 0) return [];
  const parts: string[] = [];
  let cursor = 0;
  for (let i = 0; i < runLengths.length; i += 1) {
    const length = runLengths[i];
    if (i === runLengths.length - 1) {
      parts.push(text.slice(cursor));
      break;
    }
    parts.push(text.slice(cursor, cursor + length));
    cursor += length;
  }
  return parts;
}

function prepareDocxPart(xml: string): PartPlan {
  const segments: string[] = [];
  const plans: {
    paragraph: string;
    segmentIndex: number;
    runs: { full: string; tAttributes: string; text: string }[];
  }[] = [];

  const runPattern = /<w:r\b[^>]*>[\s\S]*?<w:t\b([^>]*)>([\s\S]*?)<\/w:t>[\s\S]*?<\/w:r>/g;
  const textPattern = /<w:t\b([^>]*)>([\s\S]*?)<\/w:t>/g;

  for (const match of xml.matchAll(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g)) {
    const paragraph = match[0];
    const runs: { full: string; tAttributes: string; text: string }[] = [];

    for (const runMatch of paragraph.matchAll(runPattern)) {
      runs.push({
        full: runMatch[0],
        tAttributes: runMatch[1] ?? "",
        text: decodeXml(runMatch[2] ?? ""),
      });
    }

    if (!runs.length) continue;
    const joined = runs.map((entry) => entry.text).join("");
    if (isEmptyText(joined)) continue;

    plans.push({ paragraph, segmentIndex: segments.length, runs });
    segments.push(joined);
  }

  return {
    path: "",
    xml,
    segments,
    rebuild(translations) {
      let lastIndex = 0;
      let output = "";

      for (const plan of plans) {
        const paragraphIndex = xml.indexOf(plan.paragraph, lastIndex);
        if (paragraphIndex === -1) continue;
        output += xml.slice(lastIndex, paragraphIndex);
        lastIndex = paragraphIndex + plan.paragraph.length;

        const originalJoined = plan.runs.map((entry) => entry.text).join("");
        const translated = translations[plan.segmentIndex] ?? originalJoined;
        const runLengths = plan.runs.map((entry) => entry.text.length);
        const parts = splitByRuns(translated, runLengths);
        let runIndex = 0;

        const rebuiltParagraph = plan.paragraph.replace(runPattern, (fullRun) => {
          const run = plan.runs[runIndex];
          runIndex += 1;
          if (!run) return fullRun;
          const part = parts[runIndex - 1] ?? "";
          if (part.length === 0) {
            return fullRun.replace(textPattern, (full, attributes: string) => `<w:t${attributes}></w:t>`);
          }
          if (runIndex === 1) {
            return fullRun.replace(textPattern, (full, attributes: string) => `<w:t${ensurePreserve(run.tAttributes)}>${escapeXml(part)}</w:t>`);
          }
          return fullRun.replace(textPattern, (full, attributes: string) => `<w:t${ensurePreserve(run.tAttributes)}>${escapeXml(part)}</w:t>`);
        });

        output += rebuiltParagraph;
      }
      output += xml.slice(lastIndex);
      return output;
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                    PPTX                                    */
/* -------------------------------------------------------------------------- */

function preparePptxPart(xml: string, rtl: boolean): PartPlan {
  const segments: string[] = [];
  const plans: { paragraph: string; segmentIndex: number; runs: { full: string; attributes: string; text: string }[] }[] = [];
  const runPattern = /<a:r\b[^>]*>[\s\S]*?<a:t\b([^>]*)>([\s\S]*?)<\/a:t>[\s\S]*?<\/a:r>/g;
  const textPattern = /<a:t\b([^>]*)>([\s\S]*?)<\/a:t>/g;

  for (const match of xml.matchAll(/<a:p\b[^>]*>[\s\S]*?<\/a:p>/g)) {
    const paragraph = match[0];
    const runs: { full: string; attributes: string; text: string }[] = [];

    for (const runMatch of paragraph.matchAll(runPattern)) {
      runs.push({
        full: runMatch[0],
        attributes: runMatch[1] ?? "",
        text: decodeXml(runMatch[2] ?? ""),
      });
    }

    if (!runs.length) continue;
    const joined = runs.map((entry) => entry.text).join("");
    if (isEmptyText(joined)) continue;
    plans.push({ paragraph, segmentIndex: segments.length, runs });
    segments.push(joined);
  }

  return {
    path: "",
    xml,
    segments,
    rebuild(translations) {
      let lastIndex = 0;
      let output = "";

      for (const plan of plans) {
        const paragraphIndex = xml.indexOf(plan.paragraph, lastIndex);
        if (paragraphIndex === -1) continue;
        output += xml.slice(lastIndex, paragraphIndex);
        lastIndex = paragraphIndex + plan.paragraph.length;

        const originalJoined = plan.runs.map((entry) => entry.text).join("");
        const translated = translations[plan.segmentIndex] ?? originalJoined;
        const runLengths = plan.runs.map((entry) => entry.text.length);
        const parts = splitByRuns(translated, runLengths);
        let runIndex = 0;

        let paragraph = plan.paragraph.replace(runPattern, (fullRun) => {
          const run = plan.runs[runIndex];
          runIndex += 1;
          if (!run) return fullRun;
          const part = parts[runIndex - 1] ?? "";
          if (part.length === 0) {
            return fullRun.replace(textPattern, (full, attributes: string) => `<a:t${attributes}></a:t>`);
          }
          return fullRun.replace(textPattern, (full, attributes: string) => `<a:t${ensurePreserve(run.attributes)}>${escapeXml(part)}</a:t>`);
        });

        // اتجاه فقرة DrawingML للغات من اليمين إلى اليسار فقط.
        if (rtl) {
          if (/<a:pPr\b[^>]*>/.test(paragraph)) {
            paragraph = paragraph.replace(/<a:pPr\b([^>]*)>/, (full, attributes: string) => {
              if (/\brtl\s*=/.test(attributes)) {
                return `<a:pPr${attributes.replace(/\brtl\s*=\s*"[^"]*"/, 'rtl="1"')}>`;
              }
              return `<a:pPr${attributes} rtl="1">`;
            });
          } else {
            paragraph = paragraph.replace(/^<a:p\b[^>]*>/, (full) => `${full}<a:pPr rtl="1"/>`);
          }
        }

        output += paragraph;
      }

      output += xml.slice(lastIndex);
      return output;
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                    XLSX                                    */
/* -------------------------------------------------------------------------- */

function prepareXlsxPart(xml: string, containerTag: "si" | "is"): PartPlan {
  const segments: string[] = [];
  const plans: { block: string; segmentIndex: number; texts: { full: string; attributes: string; text: string }[] }[] = [];
  const blockPattern = new RegExp(`<${containerTag}\\b[^>]*>[\\s\\S]*?</${containerTag}>`, "g");
  const textPattern = /<t\b([^>]*)>([\s\S]*?)<\/t>/g;

  for (const match of xml.matchAll(blockPattern)) {
    const block = match[0];
    const texts: { full: string; attributes: string; text: string }[] = [];
    for (const textMatch of block.matchAll(textPattern)) {
      texts.push({
        full: textMatch[0],
        attributes: textMatch[1] ?? "",
        text: decodeXml(textMatch[2] ?? ""),
      });
    }
    if (!texts.length) continue;
    const joined = texts.map((entry) => entry.text).join("");
    if (isEmptyText(joined)) continue;
    plans.push({ block, segmentIndex: segments.length, texts });
    segments.push(joined);
  }

  return {
    path: "",
    xml,
    segments,
    rebuild(translations) {
      let lastIndex = 0;
      let output = "";

      for (const plan of plans) {
        const blockIndex = xml.indexOf(plan.block, lastIndex);
        if (blockIndex === -1) continue;
        output += xml.slice(lastIndex, blockIndex);
        lastIndex = blockIndex + plan.block.length;

        const originalJoined = plan.texts.map((entry) => entry.text).join("");
        const translated = translations[plan.segmentIndex] ?? originalJoined;
        const runLengths = plan.texts.map((entry) => entry.text.length);
        const parts = splitByRuns(translated, runLengths);
        let textCursor = 0;

        output += plan.block.replace(textPattern, (full, attributes: string) => {
          const index = textCursor;
          textCursor += 1;
          const part = parts[index] ?? "";
          if (part.length === 0) {
            return `<t${attributes}></t>`;
          }
          return `<t${ensurePreserve(plan.texts[index]?.attributes || attributes)}>${escapeXml(part)}</t>`;
        });
      }

      output += xml.slice(lastIndex);
      return output;
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                   Dispatch                                 */
/* -------------------------------------------------------------------------- */

const MIME: Record<string, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export function prepareOfficeFile(originalName: string, bytes: Uint8Array, target: string): PreparedFile {
  const extension = getExtension(originalName);
  let files: Record<string, Uint8Array>;

  try {
    files = unzipSync(bytes);
  } catch {
    throw new Error("تعذّر فتح الملف. تأكد أنه ملف Office صالح غير تالف.");
  }

  const plans: PartPlan[] = [];
  const rtl = isRtlLanguage(target);

  if (extension === "docx") {
    const paths = Object.keys(files).filter((path) =>
      /^word\/(document|header\d*|footer\d*|footnotes|endnotes)\.xml$/.test(path),
    );
    for (const path of paths) {
      const plan = prepareDocxPart(strFromU8(files[path]));
      plan.path = path;
      plans.push(plan);
    }
    if (rtl) {
      for (const plan of plans) {
        plan.rebuild = ((original) => (translations: string[]) => applyDocxBidi(original(translations)))(plan.rebuild);
      }
    }
  } else if (extension === "pptx") {
    const paths = Object.keys(files).filter((path) =>
      /^ppt\/(slides\/slide\d+\.xml|notesSlides\/notesSlide\d+\.xml)$/.test(path),
    );
    for (const path of paths) {
      const plan = preparePptxPart(strFromU8(files[path]), rtl);
      plan.path = path;
      plans.push(plan);
    }
  } else if (extension === "xlsx") {
    if (files["xl/sharedStrings.xml"]) {
      const plan = prepareXlsxPart(strFromU8(files["xl/sharedStrings.xml"]), "si");
      plan.path = "xl/sharedStrings.xml";
      plans.push(plan);
    }
    for (const path of Object.keys(files).filter((entry) => /^xl\/worksheets\/sheet\d+\.xml$/.test(entry))) {
      const xml = strFromU8(files[path]);
      if (!/<is\b/.test(xml)) continue;
      const plan = prepareXlsxPart(xml, "is");
      plan.path = path;
      plans.push(plan);
    }
  } else {
    throw new Error("صيغة Office غير مدعومة.");
  }

  if (!plans.some((plan) => plan.segments.length)) {
    throw new Error("لم نعثر على نص قابل للترجمة داخل الملف.");
  }

  const segments: string[] = [];
  const offsets: number[] = [];
  for (const plan of plans) {
    offsets.push(segments.length);
    segments.push(...plan.segments);
  }

  return {
    kind: "ooxml",
    originalName,
    outputName: translatedName(originalName),
    mime: MIME[extension] ?? "application/octet-stream",
    extension,
    segments,
    characters: segments.reduce((total, segment) => total + segment.length, 0),
    note: rtl ? "حُفظ الملف الأصلي مع ضبط اتجاه الفقرات للعربية." : "حُفظ تنسيق الملف الأصلي قدر الإمكان.",
    async rebuild(translations) {
      plans.forEach((plan, index) => {
        const offset = offsets[index];
        const local = translations.slice(offset, offset + plan.segments.length);
        files[plan.path] = strToU8(plan.rebuild(local));
      });
      const zipped = zipSync(files, { level: 6 });
      return new Blob([zipped], { type: MIME[extension] ?? "application/octet-stream" });
    },
  };
}

function applyDocxBidi(xml: string) {
  return xml.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, (paragraph) => {
    if (/<w:bidi\s*\/>/.test(paragraph)) return paragraph;
    if (/<w:pPr\b[^>]*>/.test(paragraph)) {
      return paragraph.replace(/<w:pPr\b([^>]*)>/, (full, attributes: string) => `<w:pPr${attributes}><w:bidi/>`);
    }
    return paragraph.replace(/^<w:p\b[^>]*>/, (full) => `${full}<w:pPr><w:bidi/></w:pPr>`);
  });
}
