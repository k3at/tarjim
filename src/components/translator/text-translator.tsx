"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { IconButton } from "@/components/translator/icon-button";
import { Button } from "@/components/ui/button";
import { translateTextClient, type TranslationMeta } from "@/lib/client/translate";
import { isRtlLanguage, languageName } from "@/lib/languages";
import { formatNumber, providerLabel } from "@/lib/translate/labels";

const MAX_CHARS = 5_000;
const SAMPLE =
  "Good translation is not about replacing words. It is about carrying meaning, tone, and intent across cultures — so the reader feels the text was written for them.";

type Props = {
  source: string;
  target: string;
  onDetected: (code: string) => void;
  onBusyChange: (busy: boolean) => void;
};

const SPEECH_LANG: Record<string, string> = {
  ar: "ar-SA",
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
  tr: "tr-TR",
  ru: "ru-RU",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  ja: "ja-JP",
  ko: "ko-KR",
  hi: "hi-IN",
  ur: "ur-PK",
  fa: "fa-IR",
  it: "it-IT",
  pt: "pt-PT",
  nl: "nl-NL",
  pl: "pl-PL",
  uk: "uk-UA",
  he: "he-IL",
  id: "id-ID",
  ms: "ms-MY",
  th: "th-TH",
  vi: "vi-VN",
};

export function TextTranslator({ source, target, onDetected, onBusyChange }: Props) {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [meta, setMeta] = useState<TranslationMeta | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState<"source" | "target" | null>(null);
  const prevLangRef = useRef({ source, target });
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevLangRef.current.source !== source || prevLangRef.current.target !== target) {
      prevLangRef.current = { source, target };
      abortRef.current?.abort();
      setResult("");
      setMeta(null);
      setStatus("idle");
      setError("");
    }
  }, [source, target]);

  useEffect(() => {
    onBusyChange(status === "loading");
  }, [status, onBusyChange]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      window.speechSynthesis?.cancel();
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  async function translate() {
    const value = text.trim();
    if (!value) {
      textareaRef.current?.focus();
      return;
    }
    if (value.length > MAX_CHARS) {
      setError(`النص أطول من الحد المسموح (${formatNumber(MAX_CHARS)} حرف).`);
      setStatus("error");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setError("");
    setResult("");

    try {
      const response = await translateTextClient(value, { source, target, signal: controller.signal });
      if (controller.signal.aborted) return;
      setResult(response.translation);
      setMeta(response.meta);
      setStatus("done");
      onDetected(response.meta.detectedSource);
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setStatus("error");
      setError(requestError instanceof Error ? requestError.message : "حدث خطأ غير متوقع.");
    }
  }

  function clearAll() {
    abortRef.current?.abort();
    setText("");
    setResult("");
    setMeta(null);
    setError("");
    setStatus("idle");
    textareaRef.current?.focus();
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2_000);
    } catch {
      setError("تعذّر النسخ من المتصفح. حدّد النص وانسخه يدوياً.");
    }
  }

  function download() {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ترجمة-${target}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function speak(which: "source" | "target") {
    if (!("speechSynthesis" in window)) return;
    if (speaking === which) {
      window.speechSynthesis.cancel();
      setSpeaking(null);
      return;
    }
    const content = which === "source" ? text : result;
    if (!content.trim()) return;
    const code = which === "source" ? (source === "auto" ? meta?.detectedSource : source) : target;
    if (!code) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = SPEECH_LANG[code] ?? code;
    utterance.rate = 0.95;
    const voice = window.speechSynthesis.getVoices().find((entry) => entry.lang.startsWith(utterance.lang.split("-")[0]));
    if (voice) utterance.voice = voice;
    utterance.onend = () => setSpeaking(null);
    utterance.onerror = () => setSpeaking(null);
    setSpeaking(which);
    window.speechSynthesis.speak(utterance);
  }

  const hasResult = status === "done" && Boolean(result);
  const targetRtl = isRtlLanguage(target);
  const detected = meta?.detectedSource ?? (source === "auto" ? null : source);

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        {/* لوحة المصدر */}
        <section
          aria-labelledby="source-panel-title"
          className="border-border-subtle bg-surface-sunken/40 flex min-h-[19rem] flex-col overflow-hidden rounded-2xl border"
        >
          <header className="border-border-subtle flex items-center justify-between gap-2 border-b px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <h3 id="source-panel-title" className="text-foreground truncate text-sm font-bold">
                النص الأصلي
              </h3>
              {source === "auto" && detected ? (
                <span className="bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200 hidden rounded-md px-1.5 py-0.5 text-[0.65rem] font-semibold sm:inline">
                  {languageName(detected)}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-0.5">
              <IconButton
                label={speaking === "source" ? "إيقاف القراءة" : "قراءة النص بصوت عالٍ"}
                onClick={() => speak("source")}
                active={speaking === "source"}
                disabled={!text.trim()}
              >
                <Icon name="speaker" className="size-4" />
              </IconButton>
              <IconButton label="مسح النص" onClick={clearAll} disabled={!text} tone="danger">
                <Icon name="trash" className="size-4" />
              </IconButton>
            </div>
          </header>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              if (status === "error") {
                setStatus("idle");
                setError("");
              }
            }}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                event.preventDefault();
                void translate();
              }
            }}
            maxLength={MAX_CHARS}
            dir="auto"
            lang={source === "auto" ? undefined : source}
            placeholder="اكتب أو ألصق النص هنا…"
            aria-label="النص المراد ترجمته"
            className="text-foreground placeholder:text-muted/65 scrollbar-thin min-h-[12rem] flex-1 resize-none bg-transparent px-4 py-4 text-[0.98rem] leading-8 outline-none"
          />

          <footer className="border-border-subtle flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setText(SAMPLE)}
                className="text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-500/10 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-semibold transition-colors"
              >
                <Icon name="wand" className="size-3.5" />
                جرّب مثالاً
              </button>
            </div>
            <span
              className={
                text.length > MAX_CHARS * 0.9
                  ? "text-gold-500 text-[0.7rem] font-semibold tabular-nums"
                  : "text-muted text-[0.7rem] tabular-nums"
              }
            >
              {formatNumber(text.length)} / {formatNumber(MAX_CHARS)}
            </span>
          </footer>
        </section>

        {/* لوحة النتيجة */}
        <section
          aria-labelledby="target-panel-title"
          aria-live="polite"
          aria-busy={status === "loading"}
          className="border-border-subtle bg-surface-raised relative flex min-h-[19rem] flex-col overflow-hidden rounded-2xl border shadow-sm"
        >
          <header className="border-border-subtle flex items-center justify-between gap-2 border-b px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <h3 id="target-panel-title" className="text-foreground truncate text-sm font-bold">
                الترجمة
              </h3>
              {hasResult ? (
                <span className="bg-accent-500/10 text-accent-700 dark:text-accent-400 hidden rounded-md px-1.5 py-0.5 text-[0.65rem] font-semibold sm:inline">
                  {languageName(target)}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-0.5">
              <IconButton
                label={speaking === "target" ? "إيقاف القراءة" : "قراءة الترجمة بصوت عالٍ"}
                onClick={() => speak("target")}
                active={speaking === "target"}
                disabled={!hasResult}
              >
                <Icon name="speaker" className="size-4" />
              </IconButton>
              <IconButton label="تنزيل الترجمة" onClick={download} disabled={!hasResult}>
                <Icon name="download" className="size-4" />
              </IconButton>
              <IconButton label={copied ? "تم النسخ" : "نسخ الترجمة"} onClick={copy} disabled={!hasResult} active={copied}>
                <Icon name={copied ? "check" : "copy"} className="size-4" />
              </IconButton>
            </div>
          </header>

          <div className="flex flex-1 flex-col">
            {status === "loading" ? (
              <div className="space-y-3 px-5 py-5" aria-hidden="true">
                <div className="bg-surface-sunken animate-pulse-soft h-3.5 w-11/12 rounded-full" />
                <div className="bg-surface-sunken animate-pulse-soft h-3.5 w-9/12 rounded-full" />
                <div className="bg-surface-sunken animate-pulse-soft h-3.5 w-10/12 rounded-full" />
                <div className="bg-surface-sunken animate-pulse-soft h-3.5 w-7/12 rounded-full" />
                <p className="text-muted pt-4 text-xs">جارٍ فهم النص وترجمته…</p>
              </div>
            ) : status === "error" ? (
              <div className="px-5 py-8" role="alert">
                <span className="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 grid size-10 place-items-center rounded-xl">
                  <Icon name="alert" className="size-5" />
                </span>
                <p className="text-foreground mt-4 text-sm font-semibold">تعذّرت الترجمة</p>
                <p className="text-muted mt-1.5 text-sm leading-7">{error}</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={() => void translate()}>
                  <Icon name="refresh" className="size-4" />
                  حاول مرة أخرى
                </Button>
              </div>
            ) : hasResult ? (
              <div
                dir={targetRtl ? "rtl" : "ltr"}
                lang={target}
                className="text-foreground scrollbar-thin flex-1 overflow-y-auto px-5 py-4 text-[0.98rem] leading-9 whitespace-pre-wrap"
              >
                {result}
              </div>
            ) : (
              <div className="text-muted flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                <span className="bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300 grid size-12 place-items-center rounded-2xl">
                  <Icon name="languages" className="size-6" />
                </span>
                <p className="max-w-[15rem] text-sm leading-7">
                  ترجمتك ستظهر هنا. اختر اللغتين ثم اكتب النص واضغط «ترجم الآن».
                </p>
              </div>
            )}
          </div>

          {hasResult && meta ? (
            <footer className="border-border-subtle flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 text-[0.7rem]">
              <span className="text-muted inline-flex items-center gap-1.5">
                <Icon name="shield" className="text-accent-600 size-3.5" />
                لا نحتفظ بنصك
              </span>
              <span className="text-muted">
                {source === "auto" && meta.detectedSource ? `${languageName(meta.detectedSource)} ← ` : ""}
                {languageName(target)} · {providerLabel(meta.provider)}
              </span>
            </footer>
          ) : (
            <footer className="border-border-subtle flex items-center justify-between border-t px-4 py-2.5 text-[0.7rem]">
              <span className="text-muted inline-flex items-center gap-1.5">
                <Icon name="keyboard" className="size-3.5" />
                Ctrl + Enter للترجمة
              </span>
              <span className="text-muted">{formatNumber(MAX_CHARS)} حرف كحد أقصى</span>
            </footer>
          )}
        </section>
      </div>

      <div className="mt-4 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted text-xs leading-6">
          تُرسل النصوص إلى محرك ترجمة خارجي لإتمام العملية، ولا تُحفظ على خوادمنا.
        </p>
        <Button
          size="lg"
          onClick={() => void translate()}
          disabled={!text.trim() || status === "loading"}
          className="sm:min-w-44"
        >
          {status === "loading" ? (
            <>
              <Icon name="loader" className="size-4.5 animate-spin-slow" />
              جارٍ الترجمة…
            </>
          ) : (
            <>
              <Icon name="sparkles" className="size-4.5" />
              ترجم الآن
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
