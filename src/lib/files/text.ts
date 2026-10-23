import type { PreparedFile } from "./types";
import { getExtension, translatedName } from "./types";
import {
  addSegment,
  createProtector,
  decodeEntities,
  decodeTextFile,
  escapeAttribute,
  escapeText,
  escapeXml,
  hasLetters,
} from "./utils";

type Part = string | { index: number; escape?: "html" | "xml" | "attribute" | "xmlAttribute" };

type ProcessorResult = {
  segments: string[];
  rebuild: (translations: string[]) => string;
};

function makeBuilder(prefix = "", suffix = "") {
  const segments: string[] = [];
  const parts: Part[] = [];

  return {
    literal(value: string) {
      if (!value) return;
      const last = parts[parts.length - 1];
      if (typeof last === "string") parts[parts.length - 1] = last + value;
      else parts.push(value);
    },
    translatable(value: string, escape?: Extract<Part, object>["escape"]) {
      if (!hasLetters(value)) {
        this.literal(value);
        return;
      }
      parts.push({ index: segments.length, escape });
      segments.push(value);
    },
    build(translations: string[]) {
      const body = parts
        .map((part) => {
          if (typeof part === "string") return part;
          const value = translations[part.index] ?? "";
          switch (part.escape) {
            case "html":
              return escapeText(value);
            case "xml":
              return escapeXml(value);
            case "attribute":
              return escapeAttribute(value);
            case "xmlAttribute":
              return escapeXml(value).replace(/"/g, "&quot;");
            default:
              return value;
          }
        })
        .join("");
      return prefix + body + suffix;
    },
    get segments() {
      return segments;
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                  Plain text                                */
/* -------------------------------------------------------------------------- */

function preparePlain(text: string, builder = makeBuilder()): ProcessorResult {
  const parts = text.split(/(\r?\n[ \t]*\r?\n)/);
  for (const part of parts) {
    if (!part) continue;
    if (/^\r?\n[ \t]*\r?\n$/.test(part)) builder.literal(part);
    else builder.translatable(part);
  }
  return { segments: builder.segments, rebuild: (translations) => builder.build(translations) };
}

/* -------------------------------------------------------------------------- */
/*                            Key/value configuration                         */
/* -------------------------------------------------------------------------- */

function prepareKeyValue(text: string, mode: "yaml" | "ini"): ProcessorResult {
  const lines = text.split(/(\r?\n)/);
  const segments: string[] = [];
  let output = "";

  for (let index = 0; index < lines.length; index += 2) {
    const line = lines[index] ?? "";
    const newline = lines[index + 1] ?? "";

    if (!line.trim() || /^\s*[#;!]/.test(line)) {
      output += line + newline;
      continue;
    }

    let prefix = "";
    let value = "";

    if (mode === "yaml") {
      const listMatch = line.match(/^(\s*-\s+)(.*)$/);
      const keyMatch = line.match(/^(\s*[^#\s][^:]*:\s*)(.*)$/);
      if (listMatch) {
        prefix = listMatch[1];
        value = listMatch[2];
      } else if (keyMatch) {
        prefix = keyMatch[1];
        value = keyMatch[2];
      } else {
        value = line;
      }
    } else {
      const match = line.match(/^([^=:#\s][^=:]*[=:]\s*)(.*)$/);
      if (match) {
        prefix = match[1];
        value = match[2];
      } else {
        value = line;
      }
    }

    const inlineComment = mode === "yaml" ? value.match(/^(\s*[^#]*?)(\s+#.*)$/) : null;
    const mainValue = inlineComment ? inlineComment[1] : value;
    const comment = inlineComment ? inlineComment[2] : "";

    if (hasLetters(mainValue) && !/^[|>][-+]?$/.test(mainValue.trim())) {
      const segmentIndex = segments.length;
      segments.push(mainValue);
      output += prefix;
      // نبني الناتج لاحقاً؛ نحتفظ بالفهرس في مصفوفة مؤقتة.
      output += `\u0000${segmentIndex}\u0000`;
      output += comment + newline;
    } else {
      output += line + newline;
    }
  }

  return {
    segments,
    rebuild: (translations) =>
      output.replace(/\u0000(\d+)\u0000/g, (match, index: string) => translations[Number(index)] ?? match),
  };
}

/* -------------------------------------------------------------------------- */
/*                                  Markdown                                  */
/* -------------------------------------------------------------------------- */

function prepareMarkdown(text: string): ProcessorResult {
  const protector = createProtector();

  let masked = protector.protect(text, /```[\s\S]*?```|~~~[\s\S]*?~~~/g);
  masked = protector.protect(masked, /`[^`\n]+`/g);
  masked = protector.protect(masked, /<[^>\n]+>/g);
  masked = protector.protect(masked, /https?:\/\/[^\s)>\]}"']+/g);
  masked = protector.protect(masked, /!\[[^\]]*\]\([^)]*\)/g);

  const paragraphs = masked.split(/(\r?\n[ \t]*\r?\n)/);
  const segments: string[] = [];
  const indexes = new Map<number, number>();

  paragraphs.forEach((paragraph, index) => {
    if (!paragraph || /^\r?\n[ \t]*\r?\n$/.test(paragraph)) return;
    if (!hasLetters(paragraph.replace(/\[\[\[\d+\]\]\]/g, ""))) return;
    indexes.set(index, segments.length);
    segments.push(paragraph);
  });

  return {
    segments,
    rebuild: (translations) => {
      const rebuilt = paragraphs
        .map((paragraph, index) => {
          const segmentIndex = indexes.get(index);
          if (segmentIndex === undefined) return paragraph;
          return translations[segmentIndex] ?? paragraph;
        })
        .join("");
      return protector.restore(rebuilt);
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                  HTML / XML                                */
/* -------------------------------------------------------------------------- */

const SKIP_TAGS = new Set(["script", "style", "pre", "code", "textarea", "svg", "math"]);

function prepareMarkup(text: string, mode: "html" | "xml"): ProcessorResult {
  const builder = makeBuilder();
  const tokenPattern = /(<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<[^>]+>)/g;
  let lastIndex = 0;
  const skipStack: string[] = [];

  const tagEscape = mode === "html" ? "attribute" : "xmlAttribute";
  const textEscape = mode === "html" ? "html" : "xml";

  function processText(value: string) {
    if (!value) return;
    if (skipStack.length > 0) {
      builder.literal(value);
      return;
    }
    const decoded = decodeEntities(value);
    builder.translatable(decoded, textEscape);
  }

  function processTag(tag: string) {
    if (tag.startsWith("<!--") || tag.startsWith("<![CDATA[")) {
      builder.literal(tag);
      return;
    }

    const nameMatch = tag.match(/^<\/?\s*([a-zA-Z][\w:-]*)/);
    const name = nameMatch?.[1]?.toLowerCase();
    const isClosing = /^<\//.test(tag);
    const isSelfClosing = /\/\s*>$/.test(tag) || /^<!doctype/i.test(tag);

    if (skipStack.length > 0) {
      if (isClosing && name && name === skipStack[skipStack.length - 1]) skipStack.pop();
      builder.literal(tag);
      return;
    }

    if (name && SKIP_TAGS.has(name) && !isClosing && !isSelfClosing) {
      skipStack.push(name);
      builder.literal(tag);
      return;
    }

    if (isClosing) {
      builder.literal(tag);
      return;
    }

    const isMetaDescription =
      mode === "html" && /^<meta\b/i.test(tag) && /\bname\s*=\s*["']description["']/i.test(tag);
    const attributeNames = isMetaDescription
      ? "title|alt|placeholder|aria-label|content"
      : "title|alt|placeholder|aria-label";
    const attributePattern = new RegExp(`(\\s(?:${attributeNames})\\s*=\\s*)(["'])([\\s\\S]*?)\\2`, "gi");

    let cursor = 0;
    for (const match of tag.matchAll(attributePattern)) {
      const index = match.index ?? 0;
      builder.literal(tag.slice(cursor, index) + match[1] + match[2]);
      builder.translatable(decodeEntities(match[3]), tagEscape);
      builder.literal(match[2]);
      cursor = index + match[0].length;
    }
    builder.literal(tag.slice(cursor));
  }

  for (const match of text.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    processText(text.slice(lastIndex, index));
    processTag(match[0]);
    lastIndex = index + match[0].length;
  }
  processText(text.slice(lastIndex));

  return { segments: builder.segments, rebuild: (translations) => builder.build(translations) };
}

/* -------------------------------------------------------------------------- */
/*                               Subtitles (SRT)                              */
/* -------------------------------------------------------------------------- */

function prepareSubtitles(text: string, mode: "srt" | "vtt"): ProcessorResult {
  const newline = text.includes("\r\n") ? "\r\n" : "\n";
  const trailing = text.endsWith(newline);
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const protector = createProtector();
  const segments: string[] = [];
  const rebuilders: ((translations: string[]) => string)[] = [];

  for (const block of blocks) {
    if (!block.trim()) continue;
    const lines = block.split("\n");

    if (mode === "vtt" && /^(WEBVTT|NOTE|STYLE|REGION)\b/i.test(lines[0] ?? "")) {
      rebuilders.push(() => block);
      continue;
    }

    const timeIndex = lines.findIndex((line) => line.includes("-->"));
    if (timeIndex === -1) {
      rebuilders.push(() => block);
      continue;
    }

    const header = lines.slice(0, timeIndex + 1);
    const bodyLines = lines.slice(timeIndex + 1);
    const body = bodyLines.join("\n");

    if (!hasLetters(body)) {
      rebuilders.push(() => block);
      continue;
    }

    let masked = protector.protect(body, /<[^>]+>/g);
    masked = protector.protect(masked, /\{\\[^}]+\}/g);
    const segmentIndex = segments.length;
    segments.push(masked);
    rebuilders.push((translations) => {
      const translated = protector.restore(translations[segmentIndex] ?? body);
      return [...header, ...translated.split("\n")].join("\n");
    });
  }

  return {
    segments,
    rebuild: (translations) => rebuilders.map((rebuild) => rebuild(translations)).join(newline + newline) + (trailing ? newline : ""),
  };
}

/* -------------------------------------------------------------------------- */
/*                                    JSON                                    */
/* -------------------------------------------------------------------------- */

function isTranslatableValue(value: string) {
  if (!hasLetters(value)) return false;
  if (/^(https?:\/\/|mailto:|tel:|\/|\.{0,2}\/)/i.test(value.trim())) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return false;
  if (/^[\d\s.,:+\-()/]+$/.test(value)) return false;
  if (/^\d{4}-\d{2}-\d{2}/.test(value.trim())) return false;
  return true;
}

function prepareJson(text: string): ProcessorResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("ملف JSON غير صالح. تحقق من صياغته ثم حاول مجدداً.");
  }

  const segments: string[] = [];

  function collect(value: unknown) {
    if (typeof value === "string") {
      if (isTranslatableValue(value)) segments.push(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }
    if (value && typeof value === "object") {
      Object.values(value).forEach(collect);
    }
  }
  collect(data);

  const indentMatch = text.match(/\n([ \t]+)"/);
  const indent = indentMatch?.[1] ?? 2;
  const trailing = /\r?\n$/.test(text);

  return {
    segments,
    rebuild: (translations) => {
      let cursor = 0;
      function rebuild(value: unknown): unknown {
        if (typeof value === "string") {
          if (!isTranslatableValue(value)) return value;
          const translated = translations[cursor] ?? value;
          cursor += 1;
          return translated;
        }
        if (Array.isArray(value)) return value.map(rebuild);
        if (value && typeof value === "object") {
          return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, rebuild(entry)]));
        }
        return value;
      }
      let output = JSON.stringify(rebuild(data), null, indent);
      if (text.includes("\r\n")) output = output.replace(/\n/g, "\r\n");
      return output + (trailing ? (text.includes("\r\n") ? "\r\n" : "\n") : "");
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                CSV / TSV                                   */
/* -------------------------------------------------------------------------- */

function parseDelimited(text: string, delimiter: string): { rows: string[][]; newline: string; trailing: boolean } {
  const newline = text.includes("\r\n") ? "\r\n" : "\n";
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"' && field === "") {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }

  const trailing = /(\r?\n)$/.test(text);
  return { rows, newline, trailing };
}

function serializeCell(value: string, delimiter: string) {
  if (value.includes(delimiter) || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function prepareDelimited(text: string, delimiter: string): ProcessorResult {
  const { rows, newline, trailing } = parseDelimited(text, delimiter);
  const segments: string[] = [];
  const cellIndexes = new Map<string, number>();

  rows.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      if (!isTranslatableValue(cell) || /^[=+@]/.test(cell.trim())) return;
      cellIndexes.set(`${rowIndex}:${cellIndex}`, segments.length);
      segments.push(cell);
    });
  });

  return {
    segments,
    rebuild: (translations) =>
      rows
        .map((row, rowIndex) =>
          row
            .map((cell, cellIndex) => {
              const segmentIndex = cellIndexes.get(`${rowIndex}:${cellIndex}`);
              const value = segmentIndex === undefined ? cell : (translations[segmentIndex] ?? cell);
              return serializeCell(value, delimiter);
            })
            .join(delimiter),
        )
        .join(newline) + (trailing ? newline : ""),
  };
}

/* -------------------------------------------------------------------------- */
/*                                  Dispatch                                  */
/* -------------------------------------------------------------------------- */

const MIME_TYPES: Record<string, string> = {
  txt: "text/plain;charset=utf-8",
  text: "text/plain;charset=utf-8",
  md: "text/markdown;charset=utf-8",
  markdown: "text/markdown;charset=utf-8",
  csv: "text/csv;charset=utf-8",
  tsv: "text/tab-separated-values;charset=utf-8",
  json: "application/json;charset=utf-8",
  html: "text/html;charset=utf-8",
  htm: "text/html;charset=utf-8",
  xml: "application/xml;charset=utf-8",
  srt: "application/x-subrip;charset=utf-8",
  vtt: "text/vtt;charset=utf-8",
  yaml: "application/yaml;charset=utf-8",
  yml: "application/yaml;charset=utf-8",
  ini: "text/plain;charset=utf-8",
  properties: "text/plain;charset=utf-8",
  log: "text/plain;charset=utf-8",
  rst: "text/plain;charset=utf-8",
};

export function prepareTextFile(originalName: string, bytes: Uint8Array): PreparedFile {
  const extension = getExtension(originalName);
  const { text, encoding } = decodeTextFile(bytes);

  let result: ProcessorResult;
  switch (extension) {
    case "srt":
      result = prepareSubtitles(text, "srt");
      break;
    case "vtt":
      result = prepareSubtitles(text, "vtt");
      break;
    case "json":
      result = prepareJson(text);
      break;
    case "html":
    case "htm":
      result = prepareMarkup(text, "html");
      break;
    case "xml":
      result = prepareMarkup(text, "xml");
      break;
    case "csv":
      result = prepareDelimited(text, ",");
      break;
    case "tsv":
      result = prepareDelimited(text, "\t");
      break;
    case "md":
    case "markdown":
      result = prepareMarkdown(text);
      break;
    case "yaml":
    case "yml":
      result = prepareKeyValue(text, "yaml");
      break;
    case "ini":
    case "properties":
      result = prepareKeyValue(text, "ini");
      break;
    default:
      result = preparePlain(text);
  }

  // بعض برامج الجداول تحتاج BOM ليقرأ العربية بشكل صحيح.
  const prefix = extension === "csv" || extension === "tsv" ? "\uFEFF" : "";
  const trailingNewline = text.match(/(\r?\n)$/)?.[1] ?? "";

  return {
    kind: "text",
    originalName,
    outputName: translatedName(originalName),
    mime: MIME_TYPES[extension] ?? "text/plain;charset=utf-8",
    extension,
    segments: result.segments,
    characters: result.segments.reduce((total, segment) => total + segment.length, 0),
    note:
      encoding === "windows-1256"
        ? "تم قراءة الملف بترميز Windows-1256؛ سيُحفظ الناتج بترميز UTF-8."
        : undefined,
    async rebuild(translations) {
      let output = prefix + result.rebuild(translations);
      if (trailingNewline && !output.endsWith("\n")) output += trailingNewline;
      return new Blob([output], { type: MIME_TYPES[extension] ?? "text/plain;charset=utf-8" });
    },
  };
}

export { addSegment };
