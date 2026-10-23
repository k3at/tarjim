const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  laquo: "«",
  raquo: "»",
  copy: "©",
  reg: "®",
  trade: "™",
  times: "×",
  divide: "÷",
  deg: "°",
  middot: "·",
  bull: "•",
  euro: "€",
  pound: "£",
  yen: "¥",
  sect: "§",
  para: "¶",
  rlm: "\u200f",
  lrm: "\u200e",
};

export function decodeEntities(text: string) {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]+);/g, (match, entity: string) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      const code = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(code) ? safeCodePoint(code, match) : match;
    }
    if (entity.startsWith("#")) {
      const code = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? safeCodePoint(code, match) : match;
    }
    return NAMED_ENTITIES[entity] ?? match;
  });
}

function safeCodePoint(code: number, fallback: string) {
  try {
    return String.fromCodePoint(code);
  } catch {
    return fallback;
  }
}

export function escapeText(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function escapeAttribute(text: string) {
  return escapeText(text).replace(/"/g, "&quot;");
}

export function decodeXml(text: string) {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => safeCodePoint(Number.parseInt(hex, 16), _))
    .replace(/&#(\d+);/g, (_, dec: string) => safeCodePoint(Number.parseInt(dec, 10), _))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

export function escapeXml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const LETTERS = /\p{L}/u;

export function hasLetters(text: string) {
  return LETTERS.test(text);
}

/** يفكّ ترميز الملف النصي مع دعم UTF-8 وUTF-16 وWindows-1256. */
export function decodeTextFile(bytes: Uint8Array): { text: string; encoding: string } {
  if (bytes.length >= 2) {
    if (bytes[0] === 0xff && bytes[1] === 0xfe) {
      return { text: new TextDecoder("utf-16le").decode(bytes.subarray(2)), encoding: "utf-16le" };
    }
    if (bytes[0] === 0xfe && bytes[1] === 0xff) {
      return { text: new TextDecoder("utf-16be").decode(bytes.subarray(2)), encoding: "utf-16be" };
    }
  }

  const withoutBom =
    bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf
      ? bytes.subarray(3)
      : bytes;

  try {
    return { text: new TextDecoder("utf-8", { fatal: true }).decode(withoutBom), encoding: "utf-8" };
  } catch {
    try {
      return { text: new TextDecoder("windows-1256").decode(withoutBom), encoding: "windows-1256" };
    } catch {
      return { text: new TextDecoder("utf-8").decode(withoutBom), encoding: "utf-8" };
    }
  }
}

/**
 * يحمي أجزاء لا يجب ترجمتها (كود، روابط…) باستخدام علامات تحافظ عليها المحركات.
 */
export function createProtector() {
  const values: string[] = [];
  return {
    protect(text: string, pattern: RegExp) {
      return text.replace(pattern, (match) => {
        const token = `[[[${values.length}]]]`;
        values.push(match);
        return token;
      });
    },
    restore(text: string) {
      let current = text;
      for (let pass = 0; pass < 5; pass += 1) {
        let changed = false;
        current = current.replace(/\[\[\[(\d+)\]\]\]/g, (match, index: string) => {
          const value = values[Number(index)];
          if (value === undefined) return match;
          changed = true;
          return value;
        });
        if (!changed) break;
      }
      return current;
    },
    get size() {
      return values.length;
    },
  };
}

/** يضيف مقطعاً إذا احتوى حروفاً فعلية. */
export function addSegment(segments: string[], text: string) {
  if (!hasLetters(text)) return;
  segments.push(text);
}
