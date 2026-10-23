"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { LANGUAGES, POPULAR_LANGUAGE_CODES, getLanguage, type Language } from "@/lib/languages";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons";

type Props = {
  value: string;
  onChange: (code: string) => void;
  label: string;
  allowAuto?: boolean;
  disabled?: boolean;
  className?: string;
};

const AUTO: Language = {
  code: "auto",
  nameAr: "كشف تلقائي",
  nameEn: "Detect language",
  native: "Auto",
};

export function LanguagePicker({ value, onChange, label, allowAuto = false, disabled = false, className }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listId = useId();
  const labelId = useId();

  const current = value === "auto" ? AUTO : getLanguage(value);

  const options = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const all = allowAuto ? [AUTO, ...LANGUAGES] : LANGUAGES;

    if (normalized) {
      return all.filter((language) => {
        return (
          language.nameAr.toLowerCase().includes(normalized) ||
          language.nameEn.toLowerCase().includes(normalized) ||
          language.native.toLowerCase().includes(normalized) ||
          language.code.toLowerCase().includes(normalized)
        );
      });
    }

    if (allowAuto) return all;

    const popular = POPULAR_LANGUAGE_CODES.map((code) => LANGUAGES.find((item) => item.code === code)!).filter(
      Boolean,
    );
    const rest = LANGUAGES.filter((language) => !POPULAR_LANGUAGE_CODES.includes(language.code as never));
    return [...popular, ...rest];
  }, [allowAuto, query]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    optionRefs.current[highlighted]?.scrollIntoView({ block: "nearest" });
  }, [highlighted, open]);

  function choose(code: string) {
    onChange(code);
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }

  function onSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((current) => Math.min(options.length - 1, current + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((current) => Math.max(0, current - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = options[highlighted];
      if (option) choose(option.code);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <span id={labelId} className="sr-only">
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={labelId}
  onClick={() => {
              setOpen((current) => !current);
              setHighlighted(0);
            }}
        className={cn(
          "border-border-subtle bg-surface-raised hover:border-brand-300 flex h-12 w-full items-center justify-between gap-3 rounded-xl border px-3.5 text-start transition-colors",
          "focus-visible:outline-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60",
          open && "border-brand-400 ring-brand-100 dark:ring-brand-500/20 ring-2",
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Icon
            name={value === "auto" ? "wand" : "globe"}
            className={cn("size-4.5 shrink-0", value === "auto" ? "text-brand-500" : "text-muted")}
          />
          <span className="flex min-w-0 flex-col">
            <span className="text-foreground truncate text-sm font-semibold">
              {current?.nameAr ?? "اختر اللغة"}
            </span>
            <span className="text-muted mt-0.5 truncate text-[0.68rem]" dir="auto">
              {value === "auto" ? "اكتشاف لغة النص تلقائياً" : (current?.native ?? "")}
            </span>
          </span>
        </span>
        <Icon
          name="chevron-down"
          className={cn("text-muted size-4 shrink-0 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={label}
          className="card-float animate-fade-up absolute start-0 top-full z-50 mt-2 w-full min-w-[19rem] overflow-hidden p-2"
        >
          <div className="border-border-subtle relative border-b pb-2">
            <Icon name="search" className="text-muted pointer-events-none absolute start-3 top-3.5 size-4" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setHighlighted(0);
              }}
              onKeyDown={onSearchKeyDown}
              placeholder="ابحث عن لغة…"
              aria-label="ابحث عن لغة"
              className="bg-surface-sunken/70 text-foreground placeholder:text-muted/70 h-10 w-full rounded-lg ps-9 pe-3 text-sm outline-none"
            />
          </div>

          <ul
            id={listId}
            role="listbox"
            aria-labelledby={labelId}
            className="scrollbar-thin mt-1 max-h-72 overflow-y-auto overscroll-contain"
          >
            {options.length === 0 ? (
              <li className="text-muted px-3 py-6 text-center text-sm">لا توجد لغة بهذا الاسم.</li>
            ) : (
              options.map((language, index) => {
                const selected = language.code === value;
                return (
                  <li key={language.code} role="none">
                    <button
                      ref={(element) => {
                        optionRefs.current[index] = element;
                      }}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={() => setHighlighted(index)}
                      onClick={() => choose(language.code)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-start transition-colors",
                        highlighted === index && "bg-brand-50 dark:bg-white/5",
                        selected && "text-brand-700 dark:text-brand-300",
                      )}
                    >
                      <span className="flex min-w-0 items-baseline gap-2">
                        <span className="truncate text-sm font-semibold">{language.nameAr}</span>
                        <span className="text-muted truncate text-xs" dir="auto">
                          {language.native}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        {language.code !== "auto" ? (
                          <span className="text-muted bg-surface-sunken rounded px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-wide uppercase">
                            {language.code}
                          </span>
                        ) : null}
                        {selected ? <Icon name="check" className="text-brand-600 size-4" /> : null}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
