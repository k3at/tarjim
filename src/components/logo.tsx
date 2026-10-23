import Link from "next/link";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

export function Logo({ className, showLatin = true, onNavigate }: { className?: string; showLatin?: boolean; onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — الصفحة الرئيسية`}
      onClick={onNavigate}
      className={cn("group flex items-center gap-2.5 rounded-xl", className)}
    >
      <span className="from-brand-500 via-brand-600 to-brand-800 shadow-brand-600/25 relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[0.85rem] bg-gradient-to-br text-white shadow-lg">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1/2 bg-white/15"
        />
        <span className="relative -translate-y-px font-display text-[1.35rem] leading-none font-extrabold">ت</span>
        <span className="bg-accent-400 absolute -end-2 -bottom-2 size-5 rounded-full opacity-80 blur-[6px]" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-foreground text-[1.35rem] font-extrabold tracking-tight">
          {site.name}
        </span>
        {showLatin ? (
          <span className="text-muted/80 mt-1 text-[0.6rem] font-semibold tracking-[0.22em] uppercase">
            {site.nameEn}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
