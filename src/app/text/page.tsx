import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { Container, Card, SectionHeading } from "@/components/ui/layout";
import { buttonClass } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/icons";
import { TranslatorWorkbench } from "@/components/translator/translator-workbench";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "ترجمة النصوص",
  description:
    "ترجم النصوص بين أكثر من ٧٨ لغة مع كشف تلقائي للغة المصدر، وقراءة صوتية، ونسخ وتنزيل فوري. مجانيًا ودون تسجيل.",
  alternates: { canonical: "/text" },
  openGraph: {
    title: `ترجمة النصوص | تَرجِم`,
    description: "ألصق نصك واحصل على ترجمة دقيقة مع دعم كامل للعربية واتجاه RTL.",
  },
};

const perks: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "wand",
    title: "كشف تلقائي للغة",
    body: "اترك لغة المصدر على «كشف تلقائي» وسنحدد اللغة قبل الترجمة، ثم نعرضها لك.",
  },
  {
    icon: "keyboard",
    title: "اختصار واحد",
    body: "اضغط Ctrl + Enter (أو ⌘ + Enter) داخل مربع النص لبدء الترجمة دون استخدام الفأرة.",
  },
  {
    icon: "speaker",
    title: "استمع إلى النطق",
    body: "شغّل القراءة الصوتية للنص الأصلي أو للترجمة حيث يدعم متصفحك الأصوات المتاحة.",
  },
  {
    icon: "copy",
    title: "نسخ وتنزيل",
    body: "انسخ النتيجة بضغطة، أو نزّلها كملف نصي باسم لغة الهدف لتحتفظ بها.",
  },
];

const tips: string[] = [
  "اكتب جملاً كاملة بدل كلمات مفردة؛ السياق يحسّن دقة الترجمة كثيراً.",
  "أبقِ علامات الترقيم والأسطر كما هي، فهي تساعد المحرك على فهم بنية النص.",
  "للنصوص الطويلة، قسّمها إلى فقرات أو استخدم صفحة ترجمة الملفات للحفاظ على التنسيق.",
];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TextPage({
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
          eyebrow="ترجمة النصوص"
          icon="text"
          title="نصّك بلغة أخرى، بنفس المعنى والنبرة"
          description="ألصق فقرة أو مقالاً كاملاً، واختر اللغتين. نترجم بجمل كاملة لا بكلمات مبعثرة، ونحافظ على الأسطر وعلامات الترقيم قدر الإمكان."
          badges={["حتى 5٬000 حرف في الطلب", "كشف تلقائي للغة", "قراءة صوتية ونسخ وتنزيل"]}
        />

        <section className="pb-14">
          <Container>
            <TranslatorWorkbench initialTab="text" initialSource={source} initialTarget={target} />
          </Container>
        </section>

        <section className="border-border-subtle border-y py-16">
          <Container>
            <SectionHeading
              eyebrow="أثناء الكتابة"
              title="تفاصيل صغيرة تصنع فرقاً"
              description="واجهة مصممة للكتابة بالعربية، مع أدوات تسرّع العمل اليومي."
            />

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {perks.map((perk) => (
                <Card key={perk.title} className="h-full">
                  <span className="bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300 grid size-10 place-items-center rounded-xl">
                    <Icon name={perk.icon} className="size-5" />
                  </span>
                  <h3 className="text-foreground mt-4 text-base font-bold">{perk.title}</h3>
                  <p className="text-muted mt-2 text-sm leading-7">{perk.body}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container className="max-w-4xl">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <SectionHeading
                align="start"
                eyebrow="نصائح"
                title="كيف تحصل على أفضل ترجمة؟"
                description="ثلاث عادات بسيطة ترفع جودة النتيجة قبل أن ترسل النص."
              />

              <ol className="space-y-3">
                {tips.map((tip, index) => (
                  <li
                    key={tip}
                    className="border-border-subtle bg-surface-raised flex items-start gap-3 rounded-xl border p-4"
                  >
                    <span className="bg-brand-600 grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="text-muted text-sm leading-7">{tip}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border-border-subtle bg-surface-sunken/40 mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border p-6 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-foreground font-display text-lg font-bold">هل لديك مستند كامل؟</h2>
                <p className="text-muted mt-1 text-sm leading-7">
                  ترجم Word وPDF وPowerPoint وExcel مع الحفاظ على التنسيق.
                </p>
              </div>
              <Link href="/files" className={buttonClass("secondary", "md", "shrink-0")}>
                <Icon name="layers" className="size-4" />
                ترجمة الملفات
              </Link>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
