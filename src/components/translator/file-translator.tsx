"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { IconButton } from "@/components/translator/icon-button";
import { Button, buttonClass } from "@/components/ui/button";
import { translateSegmentsClient } from "@/lib/client/translate";
import { prepareFile } from "@/lib/files";
import {
  ACCEPT_ATTRIBUTE,
  FORMAT_LABELS,
  MAX_FILE_BYTES,
  MAX_FILE_CHARACTERS,
  getExtension,
  isSupportedExtension,
  type PreparedFile,
} from "@/lib/files/types";
import { formatBytes } from "@/lib/files/types";
import { formatNumber } from "@/lib/translate/labels";
import { cn } from "@/lib/cn";

type Props = {
  source: string;
  target: string;
  onDetected: (code: string) => void;
  onBusyChange: (busy: boolean) => void;
};

type Status = "idle" | "preparing" | "translating" | "rebuilding" | "done" | "error";

type Result = {
  url: string;
  name: string;
  size: number;
  note?: string;
  characters: number;
  kind: PreparedFile["kind"];
};

const STATUS_LABEL: Record<Status, string> = {
  idle: "",
  preparing: "نقرأ الملف ونستخرج النص…",
  translating: "نترجم المحتوى إلى لغتك…",
  rebuilding: "نعيد بناء الملف بصيغته الأصلية…",
  done: "الملف جاهز",
  error: "تعذّرت الترجمة",
};

function fileIcon(extension: string): IconName {
  if (extension === "pdf") return "pdf";
  if (extension === "docx") return "document";
  if (extension === "pptx") return "presentation";
  if (extension === "xlsx" || extension === "csv" || extension === "tsv") return "table";
  if (extension === "srt" || extension === "vtt") return "subtitles";
  if (extension === "html" || extension === "xml" || extension === "json") return "code";
  return "file-text";
}

export function FileTranslator({ source, target, onDetected, onBusyChange }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [dragging, setDragging] = useState(false);
  const prevLangRef = useRef({ source, target });
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const urlRef = useRef<string | null>(null);

  const busy = status === "preparing" || status === "translating" || status === "rebuilding";

  useEffect(() => {
    onBusyChange(busy);
  }, [busy, onBusyChange]);

  useEffect(() => {
    if (prevLangRef.current.source !== source || prevLangRef.current.target !== target) {
      prevLangRef.current = { source, target };
      abortRef.current?.abort();
      setStatus("idle");
      setProgress(0);
      setError("");
      setNotice("");
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
      setResult(null);
    }
  }, [source, target]);

  function resetResult() {
    setResult(null);
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }

  function pickFile(next: File | null) {
    if (!next) return;
    abortRef.current?.abort();
    const extension = getExtension(next.name);

    setNotice("");
    setError("");
    resetResult();

    if (!isSupportedExtension(extension)) {
      setFile(null);
      setError("صيغة الملف غير مدعومة. اختر ملفاً من القائمة المدعومة.");
      setStatus("error");
      return;
    }
    if (next.size === 0) {
      setFile(null);
      setError("الملف فارغ.");
      setStatus("error");
      return;
    }
    if (next.size > MAX_FILE_BYTES) {
      setFile(null);
      setError(`حجم الملف أكبر من الحد المسموح (${formatBytes(MAX_FILE_BYTES)}).`);
      setStatus("error");
      return;
    }

    setFile(next);
    setStatus("idle");
    setProgress(0);
  }

  async function translateFile() {
    if (!file || busy) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError("");
    setNotice("");
    resetResult();
    setStatus("preparing");
    setProgress(4);

    try {
      const prepared = await prepareFile(file, target, controller.signal);
      if (controller.signal.aborted) return;

      if (prepared.characters > MAX_FILE_CHARACTERS) {
        throw new Error(
          `النص داخل الملف أكبر من الحد المجاني (${formatNumber(MAX_FILE_CHARACTERS)} حرف).`,
        );
      }

      setStatus("translating");
      setProgress(10);

      const response = await translateSegmentsClient(prepared.segments, {
        source,
        target,
        signal: controller.signal,
        onProgress: (completed, total) => {
          setProgress(10 + Math.round((completed / Math.max(total, 1)) * 78));
        },
      });
      if (controller.signal.aborted) return;

      onDetected(response.meta.detectedSource);
      setStatus("rebuilding");
      setProgress(92);

      const blob = await prepared.rebuild(response.translations);
      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setResult({
        url,
        name: prepared.outputName,
        size: blob.size,
        note: prepared.note,
        characters: prepared.characters,
        kind: prepared.kind,
      });
      setProgress(100);
      setStatus("done");
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setStatus("error");
      setError(requestError instanceof Error ? requestError.message : "حدث خطأ غير متوقع أثناء معالجة الملف.");
    }
  }

  function cancel() {
    abortRef.current?.abort();
    setStatus("idle");
    setProgress(0);
    setNotice("أُلغي الطلب.");
  }

  function clearFile() {
    abortRef.current?.abort();
    setFile(null);
    resetResult();
    setStatus("idle");
    setProgress(0);
    setError("");
    setNotice("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const extension = file ? getExtension(file.name) : "";
  const isPdf = extension === "pdf";
  const privacyNote = isPdf
    ? "يُقرأ نص PDF على الخادم مؤقتاً دون تخزين الملف، ثم تحصل على نسخة Word."
    : "يُعالَج هذا الملف داخل متصفحك؛ لا نرفع محتواه إلى خوادمنا.";

  return (
    <div>
      {!file ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const dropped = event.dataTransfer.files?.[0];
            if (dropped) pickFile(dropped);
          }}
          className={cn(
            "relative flex min-h-[19rem] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
            dragging
              ? "border-brand-400 bg-brand-50/70 dark:bg-brand-500/10"
              : "border-border-strong bg-surface-sunken/35 hover:border-brand-300",
          )}
        >
          <span className="from-brand-500 to-brand-700 shadow-brand-600/25 grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg">
            <Icon name="upload" className="size-6" />
          </span>
          <h3 className="text-foreground mt-5 font-display text-lg font-bold">اسحب ملفك هنا</h3>
          <p className="text-muted mt-2 max-w-sm text-sm leading-7">
            أو اختره من جهازك. ندعم مستندات Office وPDF والنصوص والترجمة المرئية — حتى{" "}
            {formatBytes(MAX_FILE_BYTES)}.
          </p>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPT_ATTRIBUTE}
            className="sr-only"
            onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
          />
          <Button size="md" variant="primary" className="mt-6" onClick={() => inputRef.current?.click()}>
            <Icon name="file" className="size-4" />
            اختر ملفاً
          </Button>
          <p className="text-muted mt-5 text-[0.7rem]">PDF · Word · Excel · PowerPoint · SRT · TXT · JSON · HTML</p>
          <p className="text-muted/80 mt-2 inline-flex items-center gap-1.5 text-[0.7rem]">
            <Icon name="lock" className="size-3.5" />
            لا نحتفظ بملفاتك
          </p>
          {error ? (
            <p className="mt-4 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="border-border-subtle bg-surface-sunken/35 overflow-hidden rounded-2xl border">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3.5">
              <span
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-xl",
                  isPdf
                    ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    : "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300",
                )}
              >
                <Icon name={fileIcon(extension)} className="size-5.5" />
              </span>
              <div className="min-w-0">
                <p className="text-foreground truncate text-sm font-bold" dir="auto">
                  {file.name}
                </p>
                <p className="text-muted mt-1 text-xs">
                  {FORMAT_LABELS[extension] ?? extension.toUpperCase()} · {formatBytes(file.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 self-end sm:self-auto">
              <IconButton label="إزالة الملف" onClick={clearFile} disabled={busy} tone="danger">
                <Icon name="trash" className="size-4" />
              </IconButton>
            </div>
          </div>

          {busy ? (
            <div className="border-border-subtle border-t px-5 py-4">
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <p className="text-foreground flex items-center gap-2 text-xs font-semibold">
                  <Icon name="loader" className="text-brand-600 size-4 animate-spin-slow" />
                  {STATUS_LABEL[status]}
                </p>
                <span className="text-muted text-[0.7rem] tabular-nums">{progress}%</span>
              </div>
              <div
                className="bg-surface-sunken h-2 overflow-hidden rounded-full"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-label="تقدم ترجمة الملف"
              >
                <div
                  className="from-brand-500 to-accent-500 h-full rounded-full bg-gradient-to-l transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-muted text-[0.7rem]">قد يستغرق الملف الكبير بعض الوقت. لا تغلق الصفحة.</p>
                <button
                  type="button"
                  onClick={cancel}
                  className="text-muted hover:text-foreground text-xs font-semibold underline underline-offset-4"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : null}

          {status === "error" && error ? (
            <div className="border-border-subtle border-t px-5 py-4" role="alert">
              <p className="flex items-start gap-2 text-sm leading-7 text-red-600 dark:text-red-400">
                <Icon name="alert" className="mt-1 size-4 shrink-0" />
                {error}
              </p>
            </div>
          ) : null}

          {notice ? (
            <p className="border-border-subtle text-muted border-t px-5 py-3 text-xs">{notice}</p>
          ) : null}
        </div>
      )}

      {result && status === "done" ? (
        <div className="border-accent-500/30 bg-accent-500/5 mt-4 rounded-2xl border p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="bg-accent-500 text-white grid size-11 shrink-0 place-items-center rounded-xl shadow-sm">
                <Icon name="check" className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-foreground text-sm font-bold">تمت ترجمة الملف بنجاح</p>
                <p className="text-muted mt-1 truncate text-xs" dir="auto">
                  {result.name} · {formatBytes(result.size)} · {formatNumber(result.characters)} حرف
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <a href={result.url} download={result.name} className={buttonClass("primary", "md")}>
                <Icon name="download" className="size-4" />
                تنزيل الملف المترجم
              </a>
              <Button variant="secondary" size="md" onClick={clearFile}>
                <Icon name="plus" className="size-4" />
                ملف آخر
              </Button>
            </div>
          </div>
          {result.note ? (
            <p className="text-muted mt-4 flex items-start gap-2 border-t border-accent-500/15 pt-3 text-xs leading-6">
              <Icon name="info" className="mt-0.5 size-3.5 shrink-0" />
              {result.note}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted flex items-start gap-1.5 text-xs leading-6">
          <Icon name="lock" className="mt-0.5 size-3.5 shrink-0" />
          {privacyNote}
        </p>
        <Button
          size="lg"
          onClick={() => void translateFile()}
          disabled={!file || busy}
          className="sm:min-w-44"
        >
          {busy ? (
            <>
              <Icon name="loader" className="size-4.5 animate-spin-slow" />
              جارٍ المعالجة…
            </>
          ) : (
            <>
              <Icon name="languages" className="size-4.5" />
              ترجم الملف
            </>
          )}
        </Button>
      </div>

      <p className="text-muted/80 mt-4 text-center text-[0.7rem] sm:text-start">
        الصيغ المدعومة: {Object.keys(FORMAT_LABELS).map((key) => key.toUpperCase()).join(" · ")}
      </p>
    </div>
  );
}
