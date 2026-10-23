"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
  tone?: "default" | "danger";
};

export function IconButton({ label, active = false, tone = "default", className, children, ...props }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "grid size-11 place-items-center rounded-lg transition-colors sm:size-9",
        "focus-visible:outline-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:pointer-events-none disabled:opacity-40",
        tone === "danger"
          ? "text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          : "text-muted hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-white/5 dark:hover:text-brand-200",
        active && "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
