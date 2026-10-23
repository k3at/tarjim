"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { LANGUAGES, isRtlLanguage } from "@/lib/languages";
import { cn } from "@/lib/cn";

type Direction = "all" | "rtl" | "ltr";

const DIRECTIONS: { id: Direction; label: string }[] = [
  { id: "all", label: "كل اللغات" },
  { id: "rtl", label: "من اليمين إلى اليسار" },
  { id: "ltr", label: "من اليسار إلى اليمين" },
];

const collator = new Intl.Collator("ar");

export function LanguagesDirectory() {
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState<Direction>("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return LANGUAGES.filter((language) => {
      if (direction === "rtl" && !language.rtl) return false;
      if (direction === "ltr" && language.rtl) return false;
      if (!normalized) return true;

      return (
        language.nameAr.toLowerCase().includes(normalized) ||
        language.nameEn.toLowerCase().includes(normalized) ||
        language.native.toLowerCase().includes(normalized) ||
        language.code.toLowerCase().includes(normalized)
      );
    }).sort((a, b) => collator.compare(a.nameAr, b.nameAr));
  }, [direction, query]);

  const rtlCount = LANGUAGES.filter((language) => language.rtl).length;

  return (
    <div>
      <div className="card-surface p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Icon name="search" className="text-muted pointer-events-none absolute start-3 top-3.5 size-4" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث بالاسم العربي أو الإنجليزي أو الرمز…"
              aria-label="ابحث عن لغة"
              className="border-border-subtle bg-surface-sunken/60 text-foreground placeholder:text-muted/70 focus:border-brand-400 h-11 w-full rounded-xl border ps-9 pe-3 text-sm outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {DIRECTIONS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-pressed={direction === entry.id}
                onClick={() => setDirection(entry.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  "focus-visible:outline-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2",
                  direction === entry.id
                    ? "bg-brand-600 text-white"
                    : "border-border-subtle bg-surface-raised text-muted hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-200 border",
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-muted mt-4 text-xs" aria-live="polite">
          {filtered.length === LANGUAGES.length
            ? `${LANGUAGES.length} لغة متاحة · منها ${rtlCount} لغة تُكتب من اليمين إلى اليسار`
            : `${filtered.length} لغة مطابقة من أصل ${LANGUAGES.length}`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="card-surface mt-6 flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="bg-surface-sunken text-muted grid size-12 place-items-center rounded-2xl">
            <Icon name="search" className="size-6" />
          </span>
          <p className="text-foreground font-semibold">لا توجد لغة بهذا الاسم</p>
          <p className="text-muted text-sm">جرّب اسماً عربياً أو إنجليزياً، أو ابحث برمز اللغة مثل en.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDirection("all");
            }}
            className="text-brand-600 dark:text-brand-300 mt-1 text-sm font-semibold underline underline-offset-4"
          >
            إعادة تعيين البحث
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((language) => {
            const rtl = isRtlLanguage(language.code);
            const arabic = language.code === "ar";

            return (
              <li key={language.code}>
                <article className="border-border-subtle bg-surface-raised flex h-full flex-col rounded-2xl border p-4 transition-colors hover:border-brand-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-foreground truncate text-base font-bold">{language.nameAr}</h2>
                      <p className="text-muted mt-1 truncate text-sm" dir="auto">
                        {language.native}
                      </p>
                      <p className="text-muted/80 mt-0.5 truncate text-xs">{language.nameEn}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="bg-surface-sunken text-muted rounded px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-wide uppercase">
                        {language.code}
                      </span>
                      {rtl ? (
                        <span className="bg-accent-500/10 text-accent-700 dark:text-accent-400 rounded px-1.5 py-0.5 text-[0.6rem] font-bold">
                          RTL
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border-subtle pt-3">
                    <Link
                      href={{
                        pathname: "/text",
                        query: { source: arabic ? "en" : language.code, target: "ar" },
                      }}
                      className="text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-500/10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors"
                    >
                      <Icon name="arrow-left" className="size-3.5" />
                      إلى العربية
                    </Link>
                    <Link
                      href={{
                        pathname: "/text",
                        query: { source: "ar", target: arabic ? "en" : language.code },
                      }}
                      className="text-muted hover:text-foreground inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors"
                    >
                      من العربية
                      <Icon name="arrow-right" className="size-3.5" />
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-muted mt-8 text-center text-xs leading-6">
        تظهر هنا اللغات المتاحة في محركات الترجمة المجانية. قد تختلف جودة الترجمة بين زوج وآخر،
        ويمكنك دائماً تجربة نص قصير قبل الاعتماد على النتيجة.
      </p>
    </div>
  );
}
