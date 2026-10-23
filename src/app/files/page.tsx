import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { Container, Card, SectionHeading } from "@/components/ui/layout";
import { buttonClass } from "@/components/ui/button";
import { FormatGrid } from "@/components/format-grid";
import { Icon, type IconName } from "@/components/icons";
import { TranslatorWorkbench } from "@/components/translator/translator-workbench";
import { MAX_FILE_BYTES, MAX_FILE_CHARACTERS, SUPPORTED_EXTENSIONS } from "@/lib/files/types";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "ترجمة الملفات",
  description:
    "ترجم Word وExcel وPowerPoint وPDF والنصوص والترجمة المرئية مع الحفاظ على التنسيق. ملفات Office تُعالَج داخل متصفحك ولا تُرفع إلى خوادمنا.",
  alternates: { canonical: "/files" },
  openGraph: {
    title: `ترجمة الملفات | ${site.name}`,
    description: "ارفع ملفك واحصل على نسخة مترجمة بصيغته الأصلية، أو PDF كملف Word قابل للتعديل.",
  },
};

const privacySteps: { icon: IconName; title: string; body: string; tone: string }[] = [
  {
    icon: "mouse-pointer",
    title: "ملفات Office والنصوص",
    body: "تُفتح وتُقرأ وتُعاد بناؤها بالكامل داخل متصفحك. لا يخرج المحتوى من جهازك، ولا يُرفع إلى خادمنا.",
    tone: "bg-accent-500/10 text-accent-700 dark:text-accent-400",
  },
  {
    icon: "server",
    title: "ملفات PDF فقط",
    body: "تُرسل مؤقتاً إلى خادمنا لاستخراج النص لأنه يحتاج مكتبة قراءة خاصة، ثم يُهمَل الملف فوراً ولا يُخزَّن.",
    tone: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
  },
  {
    icon: "download",
    title: "الناتج في جهازك",
    body: "ملف الترجمة يُنشأ محلياً ويُتاح عبر رابط مؤقت داخل المتصفح. لا نحتفظ بنسخة ولا نعرف محتواك.",
    tone: "bg-gold-500/15 text-gold-500",
  },
];

const faqs = [
  {
    q: "هل يُرسل ملفي إلى خادمكم؟",
    a: "ملفات Word وExcel وPowerPoint وكل الملفات النصية تُعالَج داخل المتصفح ولا تُرفع. فقط ملفات PDF تُرسل مؤقتاً لاستخراج النص، ثم تُهمَل مباشرة.",
  },
  {
    q: "ماذا يحدث للتنسيق بعد الترجمة؟",
    a: "نحافظ على الفقرات والجداول والشرائح والقوائم والخطوط الأساسية، ونضبط اتجاه الفقرات عند الترجمة إلى العربية. التنسيقات المعقدة جداً قد تحتاج مراجعة بسيطة.",
  },
  {
    q: "لماذا يصل PDF كملف Word؟",
    a: "لأن PDF صُمم للعرض لا للتحرير، وإعادة بناء تصميمه الأصلي بدقة عملية معقدة. نسخة Word تمنحك نصاً مترجماً قابلاً للتعديل والنسخ.",
  },
  {
    q: "ما حدود الملفات؟",
    a: `الحد الأقصى ${MAX_FILE_BYTES / (1024 * 1024)} ميجابايت للملف، و${MAX_FILE_CHARACTERS.toLocaleString("ar-EG")} حرف من النص القابل للترجمة. ملفات PDF بحد أقصى 10 ميجابايت.`,
  },
];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FilesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const source = first(params.source);
  const target = first(params.target);

  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <PageHero
          eyebrow="ترجمة الملفات"
          icon="layers"
          title="ترجم ملفك دون أن تفقد تنسيقه"
          description="ارفع مستندك من جهازك، واختر اللغتين، واستلم نسخة مترجمة بصيغته الأصلية. ملفات Office تُعالَج داخل متصفحك، وPDF يصل كملف Word قابل للتعديل."
          badges={[
            `${SUPPORTED_EXTENSIONS.length} صيغة مدعومة`,
            `حتى ${MAX_FILE_BYTES / (1024 * 1024)} ميجابايت`,
            "بلا رفع لملفات Office",
          ]}
        />

        <section className="pb-14">
          <Container>
            <TranslatorWorkbench initialTab="files" initialSource={source} initialTarget={target} />
          </Container>
        </section>

        <section className="border-border-subtle border-y py-16">
          <Container>
            <SectionHeading
              eyebrow="الخصوصية"
              title="ما الذي يحدث لملفك بالضبط؟"
              description="نتعامل مع كل صيغة بالطريقة التي تحمي محتواك أكثر، لا الأسهل علينا."
            />

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {privacySteps.map((step) => (
                <Card key={step.title} className="h-full">
                  <span className={`grid size-11 place-items-center rounded-xl ${step.tone}`}>
                    <Icon name={step.icon} className="size-5" />
                  </span>
                  <h3 className="text-foreground mt-4 text-base font-bold">{step.title}</h3>
                  <p className="text-muted mt-2 text-sm leading-7">{step.body}</p>
                </Card>
              ))}
            </div>

            <p className="text-muted mt-6 text-center text-sm">
              التفاصيل الكاملة في{" "}
              <Link href="/privacy" className="text-brand-600 dark:text-brand-300 font-semibold underline underline-offset-4">
                سياسة الخصوصية
              </Link>
              .
            </p>
          </Container>
        </section>

        <section className="py-16">
          <Container>
            <SectionHeading
              eyebrow="الصيغ المدعومة"
              title="صيغتك موجودة، على الأرجح"
              description="من مستندات العمل إلى ملفات الترجمة المرئية وإعدادات البرمجة."
            />
            <FormatGrid className="mt-10 grid gap-5 sm:grid-cols-2" />

            <div className="border-border-subtle mt-8 grid gap-4 rounded-2xl border bg-surface-raised/60 p-6 sm:grid-cols-3">
              <div>
                <p className="text-muted text-xs font-semibold">الحد الأقصى للملف</p>
                <p className="text-foreground font-display mt-1 text-2xl font-extrabold">
                  {MAX_FILE_BYTES / (1024 * 1024)} ميجابايت
                </p>
              </div>
              <div>
                <p className="text-muted text-xs font-semibold">الحد الأقصى للنص</p>
                <p className="text-foreground font-display mt-1 text-2xl font-extrabold">
                  {MAX_FILE_CHARACTERS.toLocaleString("ar-EG")} حرف
                </p>
              </div>
              <div>
                <p className="text-muted text-xs font-semibold">ملفات PDF</p>
                <p className="text-foreground font-display mt-1 text-2xl font-extrabold">10 ميجابايت</p>
              </div>
            </div>
          </Container>
        </section>

        <section className="border-border-subtle border-t py-16">
          <Container className="max-w-3xl">
            <SectionHeading eyebrow="أسئلة عن الملفات" title="قبل أن ترفع ملفك" />

            <div className="divide-border-subtle card-surface mt-10 divide-y overflow-hidden">
              {faqs.map((faq) => (
                <details key={faq.q} className="group px-6 py-4">
                  <summary className="text-foreground flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {faq.q}
                    <span className="text-brand-600 dark:text-brand-300 shrink-0 transition-transform group-open:rotate-45" aria-hidden="true">
                      <Icon name="plus" className="size-4" />
                    </span>
                  </summary>
                  <p className="text-muted mt-3 text-sm leading-8">{faq.a}</p>
                </details>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/text" className={buttonClass("secondary", "md")}>
                <Icon name="text" className="size-4" />
                ترجمة نص بدلاً من ذلك
              </Link>
              <Link href="/languages" className={buttonClass("ghost", "md")}>
                <Icon name="globe" className="size-4" />
                استعرض اللغات
              </Link>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
