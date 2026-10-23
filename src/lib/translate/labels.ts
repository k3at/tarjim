export const PROVIDER_LABELS: Record<string, string> = {
  deepl: "DeepL",
  "google-cloud": "Google Cloud",
  microsoft: "Microsoft Translator",
  google: "Google Translate",
  "google-clients5": "Google Translate",
  mymemory: "MyMemory",
  libre: "LibreTranslate",
  identity: "بدون تغيير",
};

export function providerLabel(id?: string | null) {
  if (!id) return "محرك ترجمة مجاني";
  return PROVIDER_LABELS[id] ?? id;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
