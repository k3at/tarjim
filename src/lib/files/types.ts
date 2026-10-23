export type PreparedFile = {
  kind: "text" | "ooxml" | "pdf";
  originalName: string;
  outputName: string;
  mime: string;
  extension: string;
  segments: string[];
  characters: number;
  note?: string;
  /** يعيد بناء الملف بعد ترجمة المقاطع بنفس الترتيب. */
  rebuild: (translations: string[]) => Promise<Blob>;
};

export const MAX_FILE_BYTES = 12 * 1024 * 1024;
export const MAX_FILE_CHARACTERS = 30_000;
export const MAX_PDF_BYTES = 10 * 1024 * 1024;

export const TEXT_EXTENSIONS = [
  "txt",
  "text",
  "md",
  "markdown",
  "csv",
  "tsv",
  "json",
  "html",
  "htm",
  "xml",
  "srt",
  "vtt",
  "yaml",
  "yml",
  "ini",
  "properties",
  "log",
  "rst",
] as const;

export const OFFICE_EXTENSIONS = ["docx", "xlsx", "pptx"] as const;
export const PDF_EXTENSIONS = ["pdf"] as const;

export const SUPPORTED_EXTENSIONS = [...TEXT_EXTENSIONS, ...OFFICE_EXTENSIONS, ...PDF_EXTENSIONS];

export const ACCEPT_ATTRIBUTE = SUPPORTED_EXTENSIONS.map((extension) => `.${extension}`).join(",");

export const FORMAT_LABELS: Record<string, string> = {
  txt: "نص عادي",
  text: "نص عادي",
  md: "Markdown",
  markdown: "Markdown",
  csv: "جدول CSV",
  tsv: "جدول TSV",
  json: "JSON",
  html: "HTML",
  htm: "HTML",
  xml: "XML",
  srt: "ترجمة SRT",
  vtt: "ترجمة WebVTT",
  yaml: "YAML",
  yml: "YAML",
  ini: "INI",
  properties: "Properties",
  log: "سجل نصي",
  rst: "reStructuredText",
  docx: "Word",
  xlsx: "Excel",
  pptx: "PowerPoint",
  pdf: "PDF",
};

export function getExtension(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop() ?? "").toLowerCase() : "";
}

export function baseName(name: string) {
  const index = name.lastIndexOf(".");
  return index > 0 ? name.slice(0, index) : name;
}

export function translatedName(name: string, extension = getExtension(name)) {
  const base = baseName(name).replace(/[\r\n"]/g, " ").trim() || "ملف";
  return `${base}-مترجم.${extension}`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
}

export function isSupportedExtension(extension: string) {
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(extension);
}
