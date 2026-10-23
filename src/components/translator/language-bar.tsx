"use client";

import { Icon } from "@/components/icons";
import { LanguagePicker } from "@/components/language-picker";
import { languageName } from "@/lib/languages";

type Props = {
  source: string;
  target: string;
  onSourceChange: (code: string) => void;
  onTargetChange: (code: string) => void;
  onSwap: () => void;
  detectedSource?: string | null;
  disabled?: boolean;
};

export function LanguageBar({ source, target, onSourceChange, onTargetChange, onSwap, detectedSource, disabled }: Props) {
  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2 sm:gap-3">
        <div className="min-w-0">
          <span className="text-muted mb-2 hidden text-xs font-semibold sm:block">لغة المصدر</span>
          <LanguagePicker
            value={source}
            onChange={onSourceChange}
            label="لغة المصدر"
            allowAuto
            disabled={disabled}
          />
        </div>

        <button
          type="button"
          onClick={onSwap}
          disabled={disabled}
          aria-label="تبديل لغتي المصدر والهدف"
          title="تبديل اللغتين"
          className="border-border-subtle bg-surface-raised text-muted hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-300 mb-1 grid size-11 shrink-0 place-items-center rounded-full border shadow-sm transition-all hover:rotate-180 disabled:pointer-events-none disabled:opacity-50"
        >
          <Icon name="swap" className="size-4.5" />
        </button>

        <div className="min-w-0">
          <span className="text-muted mb-2 hidden text-xs font-semibold sm:block">لغة الهدف</span>
          <LanguagePicker value={target} onChange={onTargetChange} label="لغة الهدف" disabled={disabled} />
        </div>
      </div>

      {source === "auto" && detectedSource ? (
        <p className="text-muted mt-2 flex items-center gap-1.5 text-xs">
          <Icon name="sparkles" className="text-brand-500 size-3.5" />
          اكتُشفت لغة النص: <span className="text-foreground font-semibold">{languageName(detectedSource)}</span>
        </p>
      ) : null}
    </div>
  );
}
