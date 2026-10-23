import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("container-page", className)}>{children}</div>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <article className={cn("card-surface p-6", className)}>{children}</article>;
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "border-border-subtle bg-surface-raised text-muted inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-brand-600 dark:text-brand-300 text-sm font-bold tracking-wide", className)}>{children}</p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl text-start",
        className,
      )}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-foreground font-display mt-3 text-3xl font-extrabold text-balance sm:text-4xl">{title}</h2>
      {description ? <p className="text-muted mt-4 text-base leading-8">{description}</p> : null}
    </div>
  );
}
