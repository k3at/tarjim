import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import type { Document, Element } from "@xmldom/xmldom";
import { isRtlLanguage } from "@/lib/languages";
import type { PreparedFile } from "./types";
import { getExtension, translatedName } from "./types";
import { hasLetters } from "./utils";

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

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main";
const X_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";

function getLocalName(node: Element | null): string {
  if (!node) return "";
  return node.localName || node.nodeName.split(":").pop() || "";
}

function getElements(parent: Element, namespaceURI: string | null, localName: string): Element[] {
  const elements = parent.getElementsByTagNameNS(namespaceURI, localName);
  if (elements.length > 0) return Array.from(elements);
  const fallback = parent.getElementsByTagName(localName);
  if (fallback.length > 0) return Array.from(fallback);
  const prefixed = parent.getElementsByTagName(`w:${localName}`);
  if (prefixed.length > 0 && (localName === "p" || localName === "r" || localName === "t")) return Array.from(prefixed);
  return [];
}

function getFirstElement(parent: Element, namespaceURI: string | null, localName: string): Element | null {
  const elements = getElements(parent, namespaceURI, localName);
  return elements[0] ?? null;
}

function createElement(doc: Document, namespaceURI: string, localName: string, prefix: string): Element {
  try {
    return doc.createElementNS(namespaceURI, `${prefix}:${localName}`);
  } catch {
    return doc.createElement(`${prefix}:${localName}`);
  }
}

/* -------------------------------------------------------------------------- */
/*                                    DOCX                                    */
/* -------------------------------------------------------------------------- */

function prepareDocxPart(xml: string): PartPlan {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  const doc = parser.parseFromString(xml, "text/xml");

  const segments: string[] = [];
  const plans: {
    paragraph: Element;
    segmentIndex: number;
    runs: { element: Element; tElement: Element; text: string }[];
  }[] = [];

  const root = doc.documentElement;
  const paragraphs = root ? getElements(root, W_NS, "p") : [];
  for (const paragraph of paragraphs) {
    const runs = getElements(paragraph, W_NS, "r");
    const runData: { element: Element; tElement: Element; text: string }[] = [];

    for (const run of runs) {
      const tElement = getFirstElement(run, W_NS, "t");
      if (!tElement) continue;
      const text = tElement.textContent ?? "";
      if (text.length === 0 && tElement.childNodes.length === 0) continue;
      runData.push({ element: run, tElement, text });
    }

    if (runData.length === 0) continue;
    const joined = runData.map((entry) => entry.text).join("");
    if (isEmptyText(joined)) continue;

    plans.push({ paragraph, segmentIndex: segments.length, runs: runData });
    segments.push(joined);
  }

  return {
    path: "",
    xml,
    segments,
    rebuild(translations) {
      for (const plan of plans) {
        const originalJoined = plan.runs.map((entry) => entry.text).join("");
        const translated = translations[plan.segmentIndex] ?? originalJoined;
        const runLengths = plan.runs.map((entry) => entry.text.length);
        const parts = splitByRuns(translated, runLengths);

        for (let i = 0; i < plan.runs.length; i += 1) {
          const run = plan.runs[i];
          const part = parts[i] ?? "";
          if (part.length === 0) {
            run.tElement.textContent = "";
            continue;
          }
          run.tElement.textContent = part;
          if (!run.tElement.getAttribute("xml:space")) {
            run.tElement.setAttribute("xml:space", "preserve");
          }
        }
      }
      return serializer.serializeToString(doc);
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                    PPTX                                    */
/* -------------------------------------------------------------------------- */

function preparePptxPart(xml: string, rtl: boolean): PartPlan {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  const doc = parser.parseFromString(xml, "text/xml");

  const segments: string[] = [];
  const plans: {
    paragraph: Element;
    segmentIndex: number;
    runs: { element: Element; tElement: Element; text: string }[];
  }[] = [];

  const root = doc.documentElement;
  const paragraphs = root ? getElements(root, A_NS, "p") : [];
  for (const paragraph of paragraphs) {
    const runs = getElements(paragraph, A_NS, "r");
    const runData: { element: Element; tElement: Element; text: string }[] = [];

    for (const run of runs) {
      const tElement = getFirstElement(run, A_NS, "t");
      if (!tElement) continue;
      const text = tElement.textContent ?? "";
      if (text.length === 0 && tElement.childNodes.length === 0) continue;
      runData.push({ element: run, tElement, text });
    }

    if (runData.length === 0) continue;
    const joined = runData.map((entry) => entry.text).join("");
    if (isEmptyText(joined)) continue;

    plans.push({ paragraph, segmentIndex: segments.length, runs: runData });
    segments.push(joined);
  }

  return {
    path: "",
    xml,
    segments,
    rebuild(translations) {
      for (const plan of plans) {
        const originalJoined = plan.runs.map((entry) => entry.text).join("");
        const translated = translations[plan.segmentIndex] ?? originalJoined;
        const runLengths = plan.runs.map((entry) => entry.text.length);
        const parts = splitByRuns(translated, runLengths);

        for (let i = 0; i < plan.runs.length; i += 1) {
          const run = plan.runs[i];
          const part = parts[i] ?? "";
          if (part.length === 0) {
            run.tElement.textContent = "";
            continue;
          }
          run.tElement.textContent = part;
          if (!run.tElement.getAttribute("xml:space")) {
            run.tElement.setAttribute("xml:space", "preserve");
          }
        }

        if (rtl) {
          let pPr = getFirstElement(plan.paragraph, A_NS, "pPr");
          if (!pPr) {
            pPr = createElement(doc, A_NS, "pPr", "a");
            if (plan.paragraph.firstChild) {
              plan.paragraph.insertBefore(pPr, plan.paragraph.firstChild as Element);
            } else {
              plan.paragraph.appendChild(pPr);
            }
          }
          pPr.setAttribute("rtl", "1");
        }
      }
      return serializer.serializeToString(doc);
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                    XLSX                                    */
/* -------------------------------------------------------------------------- */

function prepareXlsxPart(xml: string, containerTag: "si" | "is"): PartPlan {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  const doc = parser.parseFromString(xml, "text/xml");

  const segments: string[] = [];
  const plans: {
    container: Element;
    segmentIndex: number;
    texts: Element[];
  }[] = [];

  const root = doc.documentElement;
  const containers = root ? getElements(root, X_NS, containerTag) : [];
  for (const container of containers) {
    const tElements = getElements(container, X_NS, "t");
    if (tElements.length === 0) continue;
    const texts = tElements.map((tElement) => tElement.textContent ?? "");
    const joined = texts.join("");
    if (isEmptyText(joined)) continue;
    plans.push({ container, segmentIndex: segments.length, texts: tElements });
    segments.push(joined);
  }

  return {
    path: "",
    xml,
    segments,
    rebuild(translations) {
      for (const plan of plans) {
        const originalJoined = plan.texts.map((tElement) => tElement.textContent ?? "").join("");
        const translated = translations[plan.segmentIndex] ?? originalJoined;
        const runLengths = plan.texts.map((tElement) => (tElement.textContent ?? "").length);
        const parts = splitByRuns(translated, runLengths);

        for (let i = 0; i < plan.texts.length; i += 1) {
          const tElement = plan.texts[i];
          const part = parts[i] ?? "";
          if (part.length === 0) {
            tElement.textContent = "";
            continue;
          }
          tElement.textContent = part;
          if (!tElement.getAttribute("xml:space")) {
            tElement.setAttribute("xml:space", "preserve");
          }
        }
      }
      return serializer.serializeToString(doc);
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
      try {
        const plan = prepareDocxPart(strFromU8(files[path]));
        if (plan.segments.length === 0) continue;
        plan.path = path;
        plans.push(plan);
      } catch {
        // تجاهل الأجزاء التي يصعب تحليلها والمحاولة بأجزاء أخرى
      }
    }
    if (rtl) {
      for (const plan of plans) {
        plan.rebuild = ((original) => (translations: string[]) => applyDocxBidi(original(translations)))(plan.rebuild);
      }
    }
  } else if (extension === "pptx") {
    const paths = Object.keys(files).filter((path) =>
      /^ppt\/(slides\/slide\d+\.xml|notesSlides\/notesSlide\d+\.xml|handoutMaster\d*\.xml)$/.test(path),
    );
    for (const path of paths) {
      try {
        const plan = preparePptxPart(strFromU8(files[path]), rtl);
        if (plan.segments.length === 0) continue;
        plan.path = path;
        plans.push(plan);
      } catch {
        // تجاهل
      }
    }
  } else if (extension === "xlsx") {
    if (files["xl/sharedStrings.xml"]) {
      try {
        const plan = prepareXlsxPart(strFromU8(files["xl/sharedStrings.xml"]), "si");
        if (plan.segments.length > 0) {
          plan.path = "xl/sharedStrings.xml";
          plans.push(plan);
        }
      } catch {
        // تجاهل
      }
    }
    for (const path of Object.keys(files).filter((entry) => /^xl\/worksheets\/sheet\d+\.xml$/.test(entry))) {
      try {
        const xml = strFromU8(files[path]);
        if (!/<is\b/.test(xml) && !/<t\b/.test(xml)) continue;
        if (/<is\b/.test(xml)) {
          const plan = prepareXlsxPart(xml, "is");
          if (plan.segments.length > 0) {
            plan.path = path;
            plans.push(plan);
          }
        }
      } catch {
        // تجاهل
      }
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
    note: rtl ? "حُفظ الملف الأصلي مع الحفاظ على التنسيق وضبط اتجاه الفقرات للعربية." : "حُفظ تنسيق الملف الأصلي قدر الإمكان.",
    async rebuild(translations) {
      plans.forEach((plan, index) => {
        const offset = offsets[index];
        const local = translations.slice(offset, offset + plan.segments.length);
        files[plan.path] = strToU8(plan.rebuild(local));
      });
      const zipped = zipSync(files, { level: 6 });
      return new Blob([zipped.buffer.slice(zipped.byteOffset, zipped.byteOffset + zipped.byteLength)], { type: MIME[extension] ?? "application/octet-stream" });
    },
  };
}

function applyDocxBidi(xml: string) {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  const doc = parser.parseFromString(xml, "text/xml");
  const root = doc.documentElement;
  const paragraphs = root ? getElements(root, W_NS, "p") : [];

  for (const paragraph of paragraphs) {
    if (getFirstElement(paragraph, W_NS, "bidi")) continue;
    let pPr = getFirstElement(paragraph, W_NS, "pPr");
    if (!pPr) {
      pPr = createElement(doc, W_NS, "pPr", "w");
      if (paragraph.firstChild && paragraph.firstChild.nodeType === 1) {
        paragraph.insertBefore(pPr, paragraph.firstChild as Element);
      } else if (paragraph.firstChild) {
        paragraph.insertBefore(pPr, paragraph.firstChild);
      } else {
        paragraph.appendChild(pPr);
      }
    }
    const bidi = createElement(doc, W_NS, "bidi", "w");
    pPr.appendChild(bidi);
  }

  return serializer.serializeToString(doc);
}
