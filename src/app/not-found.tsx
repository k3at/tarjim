import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/layout";
import { buttonClass } from "@/components/ui/button";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة",
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="relative grid flex-1 place-items-center overflow-hidden py-24">
        <div className="bg-grid mask-fade-radial pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <Container className="relative text-center">
          <span className="bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300 mx-auto grid size-16 place-items-center rounded-2xl">
            <Icon name="search" className="size-7" />
          </span>
          <p className="text-brand-600 dark:text-brand-300 mt-6 text-sm font-bold">خطأ 404</p>
          <h1 className="text-foreground font-display mt-3 text-4xl font-extrabold">لم نجد هذه الصفحة</h1>
          <p className="text-muted mx-auto mt-4 max-w-md leading-8">
            قد يكون الرابط قديماً أو تم نقل الصفحة. يمكنك العودة إلى الرئيسية، أو البدء مباشرة بترجمة
            نص أو ملف.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/" className={buttonClass("primary", "lg")}>
              <Icon name="arrow-right" className="size-4" />
              العودة للرئيسية
            </Link>
            <Link href="/text" className={buttonClass("secondary", "lg")}>
              <Icon name="sparkles" className="size-4" />
              ترجمة نص
            </Link>
            <Link href="/files" className={buttonClass("ghost", "lg")}>
              <Icon name="layers" className="size-4" />
              ترجمة ملف
            </Link>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
