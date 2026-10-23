import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "soft";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-[var(--shadow-button)] hover:from-brand-500 hover:to-brand-800 active:from-brand-700 active:to-brand-800 disabled:from-brand-300 disabled:to-brand-400",
  secondary:
    "border border-border-subtle bg-surface-raised text-foreground hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-200",
  ghost: "text-muted hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-white/5 dark:hover:text-brand-200",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-200 dark:hover:bg-brand-500/15",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-all duration-200",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
    "disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size],
    extra,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}
