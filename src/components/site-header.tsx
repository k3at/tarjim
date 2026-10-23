"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-border-subtle bg-surface/80 sticky top-0 z-40 border-b backdrop-blur-xl">
      <Container className="flex h-[4.5rem] items-center justify-between gap-4">
        <Logo onNavigate={() => setOpen(false)} />

        <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-0.5 lg:flex">
          {site.nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200"
                    : "text-muted hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-white/5 dark:hover:text-brand-200",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link href="/text" className={buttonClass("primary", "sm", "hidden sm:inline-flex")}>
            <Icon name="sparkles" className="size-4" />
            ترجمة الآن
          </Link>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            className="text-foreground hover:bg-brand-50 dark:hover:bg-white/5 grid size-11 place-items-center rounded-xl transition-colors lg:hidden"
          >
            <Icon name={open ? "close" : "menu"} className="size-5" />
          </button>
        </div>
      </Container>

      {open ? (
        <div id="mobile-nav" className="border-border-subtle bg-surface-raised animate-fade-up border-t lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {site.nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium",
                    active ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200" : "text-muted",
                  )}
                >
                  {item.label}
                  <Icon name="arrow-left" className="size-4 opacity-50" />
                </Link>
              );
            })}
            <Link href="/text" onClick={() => setOpen(false)} className={buttonClass("primary", "md", "mt-2 w-full")}>
              <Icon name="sparkles" className="size-4" />
              ابدأ الترجمة مجاناً
            </Link>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
