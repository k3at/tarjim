"use client";

import { useCallback, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon, type IconName } from "@/components/icons";
import { LanguageBar } from "@/components/translator/language-bar";
import { TextTranslator } from "@/components/translator/text-translator";
import { FileTranslator } from "@/components/translator/file-translator";
import { cn } from "@/lib/cn";
import { getLanguage } from "@/lib/languages";

type TabId = "text" | "files";

type Props = {
  initialTab?: TabId;
  initialSource?: string;
  initialTarget?: string;
};

const TABS: { id: TabId; label: string; icon: IconName; hint: string }[] = [
  { id: "text", label: "نص", icon: "text", hint: "اكتب أو ألصق حتى 5٬000 حرف" },
  { id: "files", label: "ملفات", icon: "layers", hint: "Word · PDF · Excel · PowerPoint وغيرها" },
];

function safeSource(value?: string) {
  if (value === "auto") return "auto";
  return value && getLanguage(value) ? value : "auto";
}

function safeTarget(value?: string) {
  return value && getLanguage(value) ? value : "ar";
}

export function TranslatorWorkbench({ initialTab = "text", initialSource, initialTarget }: Props) {
  const [tab, setTab] = useState<TabId>(initialTab);
  const [source, setSource] = useState(() => safeSource(initialSource));
  const [target, setTarget] = useState(() => safeTarget(initialTarget));
  const [detected, setDetected] = useState<string | null>(null);
  const [busyTab, setBusyTab] = useState<TabId | null>(null);
  const tabListId = useId();
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ text: null, files: null });

  const busy = busyTab !== null;

  const handleTextBusy = useCallback((value: boolean) => {
    setBusyTab((current) => (value ? "text" : current === "text" ? null : current));
  }, []);

  const handleFilesBusy = useCallback((value: boolean) => {
    setBusyTab((current) => (value ? "files" : current === "files" ? null : current));
  }, []);

  const handleDetected = useCallback((code: string) => {
    setDetected(code);
  }, []);

  function changeSource(code: string) {
    setSource(code);
    setDetected(null);
  }

  function changeTarget(code: string) {
    if (code === "auto") return;
    setTarget(code);
    setDetected(null);
  }

  function swap() {
    if (busy) return;
    const nextSource = target;
    let nextTarget = source === "auto" ? (detected ?? "en") : source;

    if (nextSource === nextTarget) {
      nextTarget = nextSource === "en" ? "ar" : "en";
    }

    setSource(nextSource);
    setTarget(nextTarget);
    setDetected(null);
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") {
      return;
    }
    event.preventDefault();
    const offset = event.key === "ArrowLeft" ? 1 : event.key === "ArrowRight" ? -1 : 0;
    const nextIndex =
      event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : (index + offset + TABS.length) % TABS.length;
    const nextTab = TABS[nextIndex];
    setTab(nextTab.id);
    tabRefs.current[nextTab.id]?.focus();
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="border-border-subtle bg-surface-raised/70 flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div
          id={tabListId}
          role="tablist"
          aria-label="نوع الترجمة"
          className="bg-surface-sunken/70 inline-flex items-center gap-1 self-start rounded-xl p-1"
        >
          {TABS.map((entry, index) => {
            const selected = tab === entry.id;
            return (
              <button
                key={entry.id}
                ref={(element) => {
                  tabRefs.current[entry.id] = element;
                }}
                type="button"
                role="tab"
                id={`${tabListId}-${entry.id}-tab`}
                aria-selected={selected}
                aria-controls={`${tabListId}-${entry.id}-panel`}
                tabIndex={selected ? 0 : -1}
                disabled={busy && !selected}
                onClick={() => setTab(entry.id)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all",
                  "focus-visible:outline-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  selected
                    ? "bg-surface-raised text-brand-700 dark:text-brand-200 shadow-sm"
                    : "text-muted hover:text-foreground",
                )}
              >
                <Icon name={entry.icon} className="size-4" />
                {entry.label}
              </button>
            );
          })}
        </div>

        <div className="text-muted flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.7rem]">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="zap" className="text-gold-500 size-3.5" />
            مجاني بالكامل
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="shield" className="text-accent-600 size-3.5" />
            بلا تسجيل
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="lock" className="text-accent-600 size-3.5" />
            لا نخزّن ملفاتك
          </span>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6 sm:py-6">
        <LanguageBar
          source={source}
          target={target}
          onSourceChange={changeSource}
          onTargetChange={changeTarget}
          onSwap={swap}
          detectedSource={detected}
          disabled={busy}
        />

        <div className="mt-5">
          <div
            role="tabpanel"
            id={`${tabListId}-text-panel`}
            aria-labelledby={`${tabListId}-text-tab`}
            hidden={tab !== "text"}
            tabIndex={0}
            className="focus-visible:outline-none"
          >
            <TextTranslator
              source={source}
              target={target}
              onDetected={handleDetected}
              onBusyChange={handleTextBusy}
            />
          </div>

          <div
            role="tabpanel"
            id={`${tabListId}-files-panel`}
            aria-labelledby={`${tabListId}-files-tab`}
            hidden={tab !== "files"}
            tabIndex={0}
            className="focus-visible:outline-none"
          >
            <FileTranslator
              source={source}
              target={target}
              onDetected={handleDetected}
              onBusyChange={handleFilesBusy}
            />
          </div>

          <p className="text-muted/80 mt-3 text-center text-[0.7rem]">
            {TABS.find((entry) => entry.id === tab)?.hint}
          </p>
        </div>
      </div>
    </div>
  );
}
