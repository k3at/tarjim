import Link from "next/link";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { Container } from "@/components/ui/layout";
import { site } from "@/lib/site";

const columns = [
  {
    title: "المنتج",
    links: [
      { label: "ترجمة النصوص", href: "/text" },
      { label: "ترجمة الملفات", href: "/files" },
      { label: "اللغات المدعومة", href: "/languages" },
    ],
  },
  {
    title: "المزيد",
    links: [
      { label: "عن تَرجِم", href: "/about" },
      { label: "الأسئلة الشائعة", href: "/#faq" },
      { label: "سياسة الخصوصية", href: "/privacy" },
    ],
  },
  {
    title: "قانوني",
    links: [
      { label: "شروط الاستخدام", href: "/terms" },
      { label: "حماية البيانات", href: "/privacy#data" },
      { label: "اتصل بنا", href: "mailto:hello@tarjim.app" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-border-subtle bg-surface-raised/60 mt-auto border-t">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="text-muted mt-5 text-sm leading-7">
              مساحة عربية هادئة لترجمة النصوص والملفات. مجانية، بلا تسجيل، وبخصوصية واضحة.
            </p>
            <div className="text-muted mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="shield" className="text-accent-600 size-4" />
                ملفاتك لا تُخزَّن
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="zap" className="text-gold-500 size-4" />
                مجاني بالكامل
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="text-foreground text-sm font-bold">{column.title}</h2>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted hover:text-brand-600 dark:hover:text-brand-300 text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="border-border-subtle mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-muted text-xs">
            © {new Date().getFullYear()} {site.name}. جميع الحقوق محفوظة.
          </p>
          <p className="text-muted flex items-center gap-1.5 text-xs">
            صُنع بعناية للعربية
            <Icon name="feather" className="text-brand-500 size-3.5" />
          </p>
        </div>
      </Container>
    </footer>
  );
}
