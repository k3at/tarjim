import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge, Card, Container, SectionHeading } from "@/components/ui/layout";
import { buttonClass } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/icons";
import { TranslatorWorkbench } from "@/components/translator/translator-workbench";
import { FormatGrid } from "@/components/format-grid";
import { LANGUAGES, POPULAR_LANGUAGES } from "@/lib/languages";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "تَرجِم | ترجمة نصوص وملفات مجانية بين أكثر من ٧٨ لغة",
  description: site.description,
  alternates: { canonical: "/" },
};

const features: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "layers",
    title: "نصوص وملفات في مساحة واحدة",
    body: "ألصق فقرة، أو ارفع مستنداً كاملاً. نفس المحرك، نفس الجودة، وواجهة واحدة بلا تنقّل بين مواقع.",
  },
  {
    icon: "document",
    title: "يحافظ على التنسيق",
    body: "نعيد بناء ملفات Word وExcel وPowerPoint بعد الترجمة مع الحفاظ على الفقرات والجداول والشرائح.",
  },
  {
    icon: "pdf",
    title: "من PDF إلى Word",
    body: "نستخرج النص من ملف PDF ثم نسلّمك نسخة Word قابلة للتعديل، بدل نص مبعثر يصعب تنسيقه.",
  },
  {
    icon: "lock",
    title: "ملفاتك تبقى عندك",
    body: "معالجة ملفات Office والنصوص تعمل داخل متصفحك. لا نرفع محتواها إلى خوادمنا ولا نخزّنه.",
  },
  {
    icon: "globe",
    title: "أكثر من 75 لغة",
    body: "من العربية والإنجليزية إلى اليابانية والهندية والأوردية، مع دعم كامل للكتابة من اليمين إلى اليسار.",
  },
  {
    icon: "zap",
    title: "مجاني بلا حساب",
    body: "افتح الصفحة وابدأ فوراً. لا بريد، لا اشتراك، ولا بطاقة ائتمان — فقط حد استخدام عادل لحماية الخدمة.",
  },
];

const steps: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "upload",
    title: "ألصق النص أو ارفع الملف",
    body: "اكتب مباشرة، أو اسحب ملفاً من جهازك. نتحقق من الصيغة والحجم قبل البدء.",
  },
  {
    icon: "languages",
    title: "اختر اللغتين",
    body: "اترك المصدر على «كشف تلقائي» أو حدّده يدوياً، ثم اختر لغة الهدف من القائمة.",
  },
  {
    icon: "download",
    title: "استلم النتيجة",
    body: "انسخ النص أو نزّل الملف بصيغته الأصلية. ملفات PDF تصل كنسخة Word قابلة للتعديل.",
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "هل الخدمة مجانية فعلاً؟",
    a: "نعم، الاستخدام الشخصي واليومي مجاني بالكامل ولا يحتاج حساباً. نطبّق حداً عادلاً على عدد الطلبات وحجم النص لحماية الخدمة من الاستهلاك المفرط، ويعود الحد تلقائياً بعد دقائق.",
  },
  {
    q: "ما الحد الأقصى لحجم الملف؟",
    a: "الحد الأقصى للملف 12 ميجابايت، وللنص داخل الملف 30٬000 حرف. أما ملفات PDF فحدها 10 ميجابايت. النص المكتوب مباشرة حتى 5٬000 حرف في الطلب الواحد.",
  },
  {
    q: "هل تحفظون ملفاتي أو نصوصي؟",
    a: "لا. لا نحتفظ بالنصوص أو الملفات على خوادمنا. ملفات Office تُعالَج داخل متصفحك ولا تُرفع أصلاً. ملف PDF يُقرأ مؤقتاً على الخادم لاستخراج النص ثم يُهمَل، ويُعاد الناتج إليك مباشرة.",
  },
  {
    q: "هل تبقى التنسيقات كما هي بعد الترجمة؟",
    a: "نحافظ على الفقرات والجداول والشرائح والقوائم قدر الإمكان، مع ضبط اتجاه النص للعربية. التنسيقات المعقدة جداً أو الرسوم النصية قد تحتاج مراجعة بسيطة بعد التنزيل.",
  },
  {
    q: "هل يدعم PDF الممسوح ضوئياً؟",
    a: "ملفات PDF الممسوحة كصور لا تحتوي نصاً قابلاً للاستخراج، لذلك لا يمكن ترجمتها حالياً. إن كان الملف نصياً فسنستخرج محتواه ونحوّله إلى Word مترجم.",
  },
  {
    q: "لماذا تظهر رسالة «بلغنا الحد مؤقتاً»؟",
    a: "نستخدم محركات ترجمة خارجية مجانية، وقد تفرض حدوداً مؤقتة عند الضغط. جرّب بعد دقائق، أو قسّم النص إلى أجزاء أصغر، أو أضف مفتاح مزوّد خاص بك في إعدادات الخادم.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        {/* الواجهة الرئيسية */}
        <section className="relative overflow-hidden">
          <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
          <div
            className="from-brand-200/45 to-accent-400/25 pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-br blur-3xl"
            aria-hidden="true"
          />

          <Container className="relative py-14 sm:py-20 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.04fr_0.96fr]">
              <div>
                <Badge>
                  <span className="bg-accent-500 size-2 rounded-full" aria-hidden="true" />
                  مجاني · بلا تسجيل · ملفاتك لا تُخزَّن
                </Badge>

                <h1 className="text-foreground mt-6 text-4xl leading-[1.15] font-extrabold text-balance sm:text-5xl lg:text-[3.4rem]">
                  ترجم نصوصك وملفاتك
                  <span className="text-gradient mt-2 block pb-1">بجودة تليق بالعربية</span>
                </h1>

                <p className="text-muted mt-6 max-w-xl text-base leading-8 sm:text-lg sm:leading-9">
                  ألصق نصاً أو ارفع مستند Word وPDF وعرض PowerPoint، واحصل على ترجمة تحافظ على المعنى
                  والتنسيق بين أكثر من {LANGUAGES.length} لغة — دون حساب، ودون أن نُخزّن ملفاتك.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a href="#translator" className={buttonClass("primary", "lg")}>
                    <Icon name="sparkles" className="size-5" />
                    ابدأ الترجمة الآن
                  </a>
                  <Link href="/files" className={buttonClass("secondary", "lg")}>
                    <Icon name="upload" className="size-4.5" />
                    ترجم ملفاً
                  </Link>
                </div>

                <p className="text-muted mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="check-circle" className="text-accent-600 size-4" />
                    لا حاجة لبطاقة ائتمان
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="check-circle" className="text-accent-600 size-4" />
                    يعمل على الجوال
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="check-circle" className="text-accent-600 size-4" />
                    دعم كامل للعربية
                  </span>
                </p>
              </div>

              {/* معاينة توضيحية */}
              <div className="relative mx-auto w-full max-w-md lg:me-0">
                <div
                  className="from-brand-500/20 to-accent-400/20 absolute -inset-6 rounded-[2rem] bg-gradient-to-br blur-2xl"
                  aria-hidden="true"
                />
                <div className="card-float relative overflow-hidden">
                  <div className="border-border-subtle flex items-center justify-between border-b px-5 py-3.5">
                    <span className="text-muted inline-flex items-center gap-2 text-xs font-semibold">
                      <span className="flex gap-1" aria-hidden="true">
                        <span className="size-2 rounded-full bg-red-400" />
                        <span className="size-2 rounded-full bg-amber-400" />
                        <span className="size-2 rounded-full bg-emerald-400" />
                      </span>
                      معاينة مباشرة
                    </span>
                    <span className="bg-accent-500/10 text-accent-700 dark:text-accent-400 rounded-full px-2 py-0.5 text-[0.65rem] font-bold">
                      جاهز
                    </span>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="border-border-subtle bg-surface-sunken/60 rounded-xl border p-3.5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-muted text-[0.65rem] font-bold tracking-wide uppercase">English</span>
                        <span className="bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200 rounded px-1.5 py-0.5 text-[0.6rem] font-bold">
                          EN
                        </span>
                      </div>
                      <p dir="ltr" className="text-foreground text-start text-sm leading-6">
                        A good translation carries the meaning, tone, and intent — not just the words.
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <span className="border-border-subtle bg-surface-raised text-muted grid size-8 place-items-center rounded-full border shadow-sm">
                        <Icon name="arrow-up" className="size-4 rotate-180" />
                      </span>
                    </div>

                    <div className="border-brand-200 bg-brand-50/70 dark:border-brand-500/25 dark:bg-brand-500/10 rounded-xl border p-3.5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-brand-700 dark:text-brand-200 text-[0.65rem] font-bold tracking-wide">
                          العربية
                        </span>
                        <span className="bg-brand-600 rounded px-1.5 py-0.5 text-[0.6rem] font-bold text-white">AR</span>
                      </div>
                      <p dir="rtl" className="text-foreground text-sm leading-7">
                        الترجمة الجيدة تنقل المعنى والنبرة والمقصد، لا الكلمات وحدها.
                      </p>
                    </div>
                  </div>

                  <div className="border-border-subtle text-muted flex items-center justify-between border-t px-4 py-3 text-[0.65rem]">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="shield" className="text-accent-600 size-3.5" />
                      لا نحتفظ بالنص
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="zap" className="text-gold-500 size-3.5" />
                      نتيجة فورية
                    </span>
                  </div>
                </div>

                <div className="border-border-subtle bg-surface-raised absolute -bottom-5 start-2 hidden items-center gap-2 rounded-xl border px-3 py-2 shadow-lg sm:flex">
                  <span className="bg-accent-500 grid size-7 place-items-center rounded-lg text-white">
                    <Icon name="check" className="size-4" />
                  </span>
                  <span className="text-foreground text-xs font-bold">التنسيق محفوظ</span>
                </div>
                <div className="border-border-subtle bg-surface-raised absolute -top-4 end-2 hidden items-center gap-2 rounded-xl border px-3 py-2 shadow-lg sm:flex">
                  <span className="bg-brand-600 grid size-7 place-items-center rounded-lg text-white">
                    <Icon name="pdf" className="size-4" />
                  </span>
                  <span className="text-foreground text-xs font-bold">PDF ← Word</span>
                </div>
              </div>
            </div>

            <dl className="border-border-subtle bg-surface-raised/60 mt-14 grid grid-cols-2 gap-4 rounded-2xl border px-4 py-5 backdrop-blur sm:mt-16 sm:grid-cols-4 sm:px-6">
              {site.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <dd className="font-display text-foreground text-2xl font-extrabold sm:text-3xl">{stat.value}</dd>
                  <dt className="text-muted mt-1 text-xs sm:text-sm">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </Container>
        </section>

        {/* مساحة الترجمة */}
        <section id="translator" className="scroll-mt-24 py-16 sm:py-20">
          <Container>
            <SectionHeading
              eyebrow="ابدأ الآن"
              title="مساحة الترجمة"
              description="اختر اللغتين، ثم اكتب نصاً أو ارفع ملفاً. كل شيء يعمل من المتصفح دون إنشاء حساب."
            />
            <div className="mt-10">
              <TranslatorWorkbench initialTab="text" initialSource="auto" initialTarget="ar" />
            </div>
          </Container>
        </section>

        {/* المزايا */}
        <section id="features" className="border-border-subtle scroll-mt-24 border-y py-16 sm:py-20">
          <Container>
            <SectionHeading
              eyebrow="لماذا تَرجِم؟"
              title="أدوات ترجمة تشبهك"
              description="بُنيت للعربية أولاً، وتتعامل مع ملفاتك باحترام: بلا رفع غير ضروري، وبلا حسابات، وبلا تعقيد."
            />

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="group transition-colors hover:border-brand-300">
                  <span className="bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300 grid size-11 place-items-center rounded-xl">
                    <Icon name={feature.icon} className="size-5" />
                  </span>
                  <h3 className="text-foreground mt-5 text-lg font-bold">{feature.title}</h3>
                  <p className="text-muted mt-2 text-sm leading-7">{feature.body}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* الصيغ */}
        <section id="formats" className="scroll-mt-24 py-16 sm:py-20">
          <Container>
            <SectionHeading
              eyebrow="الصيغ المدعومة"
              title="ملفاتك كما هي، بلغة أخرى"
              description="نتعامل مع أكثر من 20 صيغة، ونعيد الملف بصيغته الأصلية — باستثناء PDF الذي يصل كملف Word."
            />

            <div className="mt-12">
              <FormatGrid />
            </div>

            <p className="text-muted mt-6 text-center text-sm">
              الحد الأقصى 12 ميجابايت للملف و30٬000 حرف للنص داخل الملف.{" "}
              <Link href="/files" className="text-brand-600 dark:text-brand-300 font-semibold underline underline-offset-4">
                ابدأ بملف الآن
              </Link>
            </p>
          </Container>
        </section>

        {/* الخطوات */}
        <section id="how" className="border-border-subtle bg-surface-raised/40 scroll-mt-24 border-y py-16 sm:py-20">
          <Container>
            <SectionHeading
              eyebrow="كيف يعمل"
              title="ثلاث خطوات، بلا تعقيد"
              description="من الفكرة إلى ملف مترجم جاهز للاستخدام، في أقل من دقيقة."
            />

            <ol className="mt-12 grid gap-5 md:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="relative">
                  <Card className="h-full">
                    <div className="flex items-center justify-between">
                      <span className="bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300 grid size-11 place-items-center rounded-xl">
                        <Icon name={step.icon} className="size-5" />
                      </span>
                      <span className="font-display text-border-strong text-3xl font-extrabold">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-foreground mt-5 text-lg font-bold">{step.title}</h3>
                    <p className="text-muted mt-2 text-sm leading-7">{step.body}</p>
                  </Card>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* اللغات */}
        <section id="languages" className="scroll-mt-24 py-16 sm:py-20">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <SectionHeading
                align="start"
                eyebrow="اللغات"
                title="من العربية وإليها، وإلى العالم"
                description="أكثر من 75 لغة بكتاباتها المختلفة، مع ضبط اتجاه النص تلقائياً للغات التي تُكتب من اليمين إلى اليسار."
              />

              <div>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {POPULAR_LANGUAGES.map((language) => (
                    <li key={language.code}>
                      <span className="border-border-subtle bg-surface-raised flex h-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5">
                        <span className="min-w-0">
                          <span className="text-foreground block truncate text-sm font-semibold">{language.nameAr}</span>
                          <span className="text-muted mt-0.5 block truncate text-[0.7rem]" dir="auto">
                            {language.native}
                          </span>
                        </span>
                        <span className="bg-surface-sunken text-muted shrink-0 rounded px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase">
                          {language.code}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link href="/languages" className={buttonClass("secondary", "md")}>
                    <Icon name="globe" className="size-4" />
                    كل اللغات ({LANGUAGES.length})
                  </Link>
                  <span className="text-muted text-xs">لغات RTL: العربية · العبرية · الفارسية · الأردية · وغيرها</span>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* الخصوصية */}
        <section id="privacy" className="scroll-mt-24 pb-16 sm:pb-20">
          <Container>
            <div className="from-brand-900 via-brand-800 to-brand-900 relative overflow-hidden rounded-[2rem] bg-gradient-to-l p-6 text-white sm:p-10 lg:p-12">
              <div className="bg-grid absolute inset-0 opacity-20" aria-hidden="true" />
              <div className="bg-accent-400/20 absolute -top-24 -end-20 size-72 rounded-full blur-3xl" aria-hidden="true" />

              <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-100">
                    <Icon name="shield" className="size-4" />
                    الخصوصية أولاً
                  </span>
                  <h2 className="mt-5 font-display text-3xl font-extrabold text-balance sm:text-4xl">
                    نصوصك ليست منتجاً نبيعه
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-8 text-indigo-100 sm:text-base">
                    لا نخزّن النصوص ولا الملفات، ولا نحتاج حساباً لمعرفة من أنت. الملفات المكتبية تُعالَج
                    داخل متصفحك، وملفات PDF تُقرأ مؤقتاً لاستخراج النص فقط.
                  </p>

                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {[
                      "لا تخزين للنصوص أو الملفات",
                      "معالجة Office داخل المتصفح",
                      "لا تتبّع إعلاني ولا حسابات",
                      "روابط تنزيل مؤقتة في جهازك",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm leading-7 text-indigo-50">
                        <Icon name="check-circle" className="text-accent-300 mt-1 size-4 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/privacy"
                    className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-brand-800 transition-colors hover:bg-indigo-50"
                  >
                    اقرأ سياسة الخصوصية
                    <Icon name="arrow-left" className="size-4" />
                  </Link>
                </div>

                <dl className="grid grid-cols-2 gap-3">
                  {[
                    { value: "0", label: "ملفات محفوظة" },
                    { value: "0", label: "حسابات مطلوبة" },
                    { value: "0 ر.س", label: "تكلفة الاستخدام" },
                    { value: `${LANGUAGES.length}`, label: "لغة مدعومة" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/5 p-4 text-center">
                      <dd className="font-display text-2xl font-extrabold sm:text-3xl">{stat.value}</dd>
                      <dt className="mt-1 text-[0.7rem] text-indigo-100 sm:text-xs">{stat.label}</dt>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Container>
        </section>

        {/* الأسئلة الشائعة */}
        <section id="faq" className="border-border-subtle scroll-mt-24 border-t py-16 sm:py-20">
          <Container className="max-w-3xl">
            <SectionHeading
              eyebrow="الأسئلة الشائعة"
              title="إجابات قبل أن تبدأ"
              description="كل ما تحتاج معرفته عن الحدود والخصوصية وصيغ الملفات."
            />

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
          </Container>
        </section>

        {/* دعوة أخيرة */}
        <section className="pb-16 sm:pb-20">
          <Container>
            <div className="from-brand-700 to-brand-900 relative overflow-hidden rounded-3xl bg-gradient-to-l px-6 py-14 text-center text-white">
              <div className="bg-grid absolute inset-0 opacity-25" aria-hidden="true" />
              <div className="relative mx-auto max-w-2xl">
                <Icon name="languages" className="mx-auto size-10 text-indigo-200" />
                <h2 className="mt-5 text-3xl font-extrabold text-balance sm:text-4xl">
                  جاهز لتنقل فكرتك إلى لغة أخرى؟
                </h2>
                <p className="mt-4 text-base leading-8 text-indigo-100">
                  ابدأ بنص قصير أو ملفك الأهم. مجاناً، بلا تسجيل، وبنتيجة تحترم لغتك وتنسيقك.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href="#translator"
                    className="text-brand-800 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 font-semibold transition-colors hover:bg-indigo-50"
                  >
                    <Icon name="sparkles" className="size-4.5" />
                    ترجم الآن
                  </a>
                  <Link
                    href="/files"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-6 font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <Icon name="upload" className="size-4.5" />
                    ترجمة الملفات
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
