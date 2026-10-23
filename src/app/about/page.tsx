import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { Container, Card, SectionHeading } from "@/components/ui/layout";
import { buttonClass } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/icons";
import { LANGUAGES } from "@/lib/languages";
import { SUPPORTED_EXTENSIONS } from "@/lib/files/types";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "عن تَرجِم",
  description:
    "تَرجِم منصة عربية مجانية لترجمة النصوص والملفات. تعرّف على فكرتها، ومبادئها في الخصوصية، وكيف تعمل الترجمة خلف الواجهة.",
  alternates: { canonical: "/about" },
};

const principles: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "shield",
    title: "الخصوصية ليست ميزة إضافية",
    body: "لا نخزّن النصوص أو الملفات، ولا نطلب حساباً. ما لا نحتاجه لا نجمعه، وما لا نجمعه لا يمكن تسريبه.",
  },
  {
    icon: "feather",
    title: "العربية أولاً",
    body: "الاتجاه، والخطوط، والمسافات، وصياغة الرسائل — كلها مبنية للعربية من البداية لا مترجمة إليها لاحقاً.",
  },
  {
    icon: "zap",
    title: "سرعة بلا تعقيد",
    body: "لا خطوات زائدة ولا نماذج طويلة. تفتح الصفحة، تلصق أو ترفع، وتحصل على النتيجة.",
  },
  {
    icon: "cloud-off",
    title: "بقدر الإمكان محلياً",
    body: "ملفات Office والنصوص تُعالَج داخل متصفحك. نستخدم الخادم فقط عندما تكون هناك حاجة تقنية حقيقية.",
  },
];

const flow = [
  {
    title: "أنت تُدخل المحتوى",
    body: "نص مكتوب، أو ملف من جهازك. نتحقق من الصيغة والحجم قبل أي خطوة.",
  },
  {
    title: "نُجهّز النص",
    body: "نستخرج النص من الملف، ونحمي الروابط والأكواد والوسوم، ثم نقسّمه إلى مقاطع مناسبة للترجمة.",
  },
  {
    title: "محرك ترجمة خارجي",
    body: "تُرسل المقاطع النصية فقط إلى مزوّد ترجمة (Google أو MyMemory أو مزوّد مُهيّأ بمفتاح خاص)، دون أي بيانات عنك.",
  },
  {
    title: "نُعيد بناء الناتج",
    body: "نجمع الترجمات في مكانها، ونعيد بناء الملف، ونعرضه للتنزيل مباشرة من جهازك.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <PageHero
          eyebrow="عن الموقع"
          icon="feather"
          title="ترجمة عربية هادئة، بلا شروط خفية"
          description="بُني تَرجِم ليكون أبسط طريقة لترجمة نص أو ملف: بلا حساب، بلا اشتراك، وبلا تخزين لمحتواك. نؤمن أن الأدوات الجيدة يجب أن تحترم وقت المستخدم وخصوصيته."
        />

        <section className="pb-16">
          <Container className="max-w-4xl">
            <div className="prose-editorial">
              <h2>لماذا تَرجِم؟</h2>
              <p>
                معظم أدوات الترجمة تطلب منك إنشاء حساب، أو ترفع ملفك إلى خادم مجهول، أو تضع حدوداً
                غير واضحة ثم تطلب الاشتراك عند أول استخدام جدي. أردنا أداة تعمل بالعكس: تفتحها، تنجز
                ما تحتاجه، وتغلقها — دون أن تترك أثراً.
              </p>
              <p>
                يدعم الموقع اليوم {LANGUAGES.length} لغة و{SUPPORTED_EXTENSIONS.length} صيغة ملف، مع
                اهتمام خاص بالعربية: اتجاه صحيح، وخطوط مريحة، وواجهة لا تتفكك عند خلط النص العربي
                بالإنجليزي أو الأرقام أو الرموز.
              </p>

              <h2 id="how">كيف تعمل الترجمة؟</h2>
              <p>
                الترجمة نفسها تتم عبر محركات خارجية مجانية. نرسل النص فقط — بعد حماية العناصر التي لا
                يجب ترجمتها — ثم نعيد تجميع النتيجة. لا نرسل اسمك أو بريدك أو أي معرّف شخصي، لأننا
                لا نملكها أصلاً.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {flow.map((step, index) => (
                <div key={step.title} className="border-border-subtle bg-surface-raised rounded-xl border p-4">
                  <span className="text-brand-600 dark:text-brand-300 text-xs font-extrabold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-foreground mt-1.5 text-base font-bold">{step.title}</h3>
                  <p className="text-muted mt-1 text-sm leading-7">{step.body}</p>
                </div>
              ))}
            </div>

            <div className="prose-editorial mt-10">
              <h2 id="limits">حدود واضحة</h2>
              <p>
                الخدمة مجانية، وتعتمد على محركات مجانية أيضاً. لذلك نطبّق حدوداً عادلة: 5٬000 حرف
                للنص المكتوب، 12 ميجابايت للملف و30٬000 حرف من النص داخله، و10 ميجابايت لملفات PDF.
                كما نحدّ عدد الطلبات لكل عنوان IP خلال نافذة زمنية قصيرة لحماية الخدمة من الاستهلاك
                المفرط.
              </p>
              <p>
                عند بلوغ الحد تظهر رسالة واضحة، ويعود الحد تلقائياً بعد انتهاء النافذة. لا نستخدم
                هذه الحدود لدفعك إلى اشتراك؛ هي فقط لإبقاء الخدمة متاحة للجميع مجاناً.
              </p>

              <h2 id="tech">التقنية</h2>
              <p>
                الواجهة مبنية بـ Next.js وTailwind CSS، وتعمل الصفحات كمكوّنات خادم افتراضياً مع
                تفاعل محدود في مساحة الترجمة. معالجة ملفات Office تتم عبر مكتبة ZIP خفيفة داخل
                المتصفح، واستخراج نص PDF يتم على الخادم فقط عند الحاجة.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {principles.map((principle) => (
                <Card key={principle.title} className="h-full">
                  <span className="bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300 grid size-10 place-items-center rounded-xl">
                    <Icon name={principle.icon} className="size-5" />
                  </span>
                  <h2 className="text-foreground mt-4 text-base font-bold">{principle.title}</h2>
                  <p className="text-muted mt-2 text-sm leading-7">{principle.body}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-border-subtle border-t py-16">
          <Container className="max-w-4xl">
            <SectionHeading
              eyebrow="تواصل"
              title="لديك سؤال أو ملاحظة؟"
              description="نرحب بالملاحظات عن جودة الترجمة أو الصيغ المدعومة أو أي مشكلة تقنية."
            />
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={`mailto:${site.email}`} className={buttonClass("primary", "md")}>
                <Icon name="mail" className="size-4" />
                {site.email}
              </a>
              <Link href="/privacy" className={buttonClass("secondary", "md")}>
                <Icon name="shield" className="size-4" />
                سياسة الخصوصية
              </Link>
              <Link href="/text" className={buttonClass("ghost", "md")}>
                <Icon name="sparkles" className="size-4" />
                جرّب الترجمة
              </Link>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
