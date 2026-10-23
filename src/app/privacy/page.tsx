import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { Container, Card } from "@/components/ui/layout";
import { buttonClass } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description:
    "كيف يتعامل تَرجِم مع نصوصك وملفاتك: لا حسابات، لا تخزين دائم، معالجة محلية لملفات Office، وقراءة مؤقتة لملفات PDF.",
  alternates: { canonical: "/privacy" },
};

const summary: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "shield",
    title: "لا نخزّن ملفاتك",
    body: "لا تُكتب الملفات أو النصوص في قاعدة بيانات أو قرص. تختفي من الذاكرة بعد إتمام الطلب.",
  },
  {
    icon: "lock",
    title: "لا نطلب حساباً",
    body: "لا بريد، لا كلمة مرور، ولا ملف شخصي. لا نعرف من أنت ولا نحتاج ذلك.",
  },
  {
    icon: "mouse-pointer",
    title: "Office داخل متصفحك",
    body: "ملفات Word وExcel وPowerPoint والنصوص لا تُرفع إلى خوادمنا على الإطلاق.",
  },
];

const contents = [
  { id: "data", label: "ما نجمعه" },
  { id: "files", label: "الملفات" },
  { id: "text", label: "النصوص" },
  { id: "providers", label: "المزوّدون الخارجيون" },
  { id: "cookies", label: "التخزين المحلي" },
  { id: "security", label: "الأمان" },
  { id: "rights", label: "حقوقك" },
  { id: "changes", label: "التغييرات" },
  { id: "contact", label: "التواصل" },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <PageHero
          eyebrow="الخصوصية"
          icon="shield"
          title="خصوصيتك، مكتوبة بوضوح"
          description="هذه الصفحة تشرح بالتفصيل ما يحدث عند استخدام تَرجِم: أي بيانات تمر، وأين تذهب، وكم تبقى. لا نستخدم لغة قانونية غامضة لتغطية ما لا نفعله."
          badges={["آخر تحديث: أكتوبر 2026", "لا حسابات", "لا تتبّع إعلاني"]}
        />

        <section className="pb-16">
          <Container className="max-w-4xl">
            <div className="grid gap-4 sm:grid-cols-3">
              {summary.map((item) => (
                <Card key={item.title} className="h-full">
                  <span className="bg-accent-500/10 text-accent-700 dark:text-accent-400 grid size-10 place-items-center rounded-xl">
                    <Icon name={item.icon} className="size-5" />
                  </span>
                  <h2 className="text-foreground mt-4 text-base font-bold">{item.title}</h2>
                  <p className="text-muted mt-2 text-sm leading-7">{item.body}</p>
                </Card>
              ))}
            </div>

            <nav aria-label="محتويات الصفحة" className="border-border-subtle bg-surface-raised/60 mt-8 rounded-2xl border p-5">
              <p className="text-foreground text-sm font-bold">محتويات الصفحة</p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {contents.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={`#${entry.id}`}
                      className="text-muted hover:text-brand-600 dark:hover:text-brand-300 underline-offset-4 hover:underline"
                    >
                      {entry.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="prose-editorial mt-10">
              <h2 id="data">1. ما نجمعه</h2>
              <p>
                لا تحتاج إلى حساب لاستخدام الموقع، ولا نطلب اسماً أو بريداً إلكترونياً. الأشياء الوحيدة
                التي تمر عبر خوادمنا هي:
              </p>
              <ul>
                <li>النص المطلوب ترجمته (عند استخدام محرك الترجمة على الخادم).</li>
                <li>ملف PDF نفسه (فقط لاستخراج النص منه مؤقتاً).</li>
                <li>عنوان IP وبيانات الطلب التقنية، لعدّ الطلبات وتطبيق حد الاستخدام.</li>
              </ul>
              <p>
                لا نستخدم أدوات تحليل سلوكية أو إعلانات، ولا نبيع أي بيانات — فلا نملك بيانات شخصية
                أصلاً.
              </p>

              <h2 id="files">2. الملفات</h2>
              <p>
                <strong>ملفات Word وExcel وPowerPoint والملفات النصية</strong> تُعالَج بالكامل داخل
                متصفحك باستخدام JavaScript. لا تُرسل إلى أي خادم، ولا يمكننا رؤية محتواها.
              </p>
              <p>
                <strong>ملفات PDF</strong> هي الاستثناء الوحيد: تُرسل إلى خادمنا لاستخراج النص لأن
                قراءة PDF تحتاج مكتبة متخصصة. يُستخرج النص في الذاكرة، ثم يُهمَل الملف الأصلي فوراً.
                لا نحفظ نسخة من PDF ولا نكتبه إلى قرص.
              </p>

              <h2 id="text">3. النصوص</h2>
              <p>
                النصوص المرسلة للترجمة تمر إلى مزوّد ترجمة خارجي وتُعاد إلينا. لا تُسجَّل في ملفات
                خادم دائمة، ولا تُربط بأي هوية.
              </p>
              <p>
                لتقليل الطلبات المتكررة وتسريع الاستخدام، قد تُحفظ نتيجة الترجمة مؤقتاً في ذاكرة
                الخادم (RAM) مع النص الأصلي. هذا المخزن مؤقت، محدود الحجم، ويختفي عند إعادة تشغيل
                الخادم أو انتهاء دورة حياة النسخة. لا يُكتب إلى قرص أو قاعدة بيانات.
              </p>

              <h2 id="providers">4. المزوّدون الخارجيون</h2>
              <p>
                تعتمد الترجمة على محركات خارجية. عند الترجمة يُرسل النص إلى أحد المزوّدين التاليين
                وفق الإعدادات المتاحة:
              </p>
              <ul>
                <li>
                  <a href="https://cloud.google.com/translate" target="_blank" rel="noopener noreferrer">
                    Google Translate
                  </a>{" "}
                  — قد يُستخدم عبر واجهته العامة أو Cloud Translation عند توفير مفتاح.
                </li>
                <li>
                  <a href="https://www.deepl.com" target="_blank" rel="noopener noreferrer">
                    DeepL
                  </a>{" "}
                  — عند إعداد مفتاح API.
                </li>
                <li>
                  <a href="https://azure.microsoft.com/products/ai-services/ai-translator" target="_blank" rel="noopener noreferrer">
                    Microsoft Translator
                  </a>{" "}
                  — عند إعداد مفتاح API.
                </li>
                <li>
                  <a href="https://mymemory.translated.net" target="_blank" rel="noopener noreferrer">
                    MyMemory
                  </a>{" "}
                  — مزوّد احتياطي مجاني.
                </li>
                <li>
                  <a href="https://libretranslate.com" target="_blank" rel="noopener noreferrer">
                    LibreTranslate
                  </a>{" "}
                  — عند إعداد عنوان خادم خاص.
                </li>
              </ul>
              <p>
                لكل مزوّد سياسة خصوصية مستقلة. ننصح بمراجعتها إذا كان النص حساساً. لا ترسل بيانات
                سرية أو وثائق شديدة الحساسية إلى أي خدمة ترجمة آلية على الإنترنت.
              </p>

              <h2 id="cookies">5. التخزين المحلي وملفات الارتباط</h2>
              <p>
                لا نستخدم ملفات تعريف ارتباط (cookies) للتتبع أو الإعلانات. نستخدم تخزين المتصفح
                المحلي (localStorage) لحفظ تفضيل واحد فقط: الوضع الداكن أو الفاتح. يمكنك مسحه من
                إعدادات المتصفح في أي وقت.
              </p>
              <p>
                روابط تنزيل الملفات المترجمة تُنشأ محلياً في متصفحك (Blob URL) وتُلغى عند إغلاق
                الصفحة أو بدء ملف جديد؛ لا نستضيف ملفاتك على خادم.
              </p>

              <h2 id="security">6. الأمان</h2>
              <p>
                نستخدم HTTPS، ولا نخزّن الملفات، ونحدّ من حجم الطلبات ومعدلها. ومع ذلك، لا يمكن لأي
                خدمة على الإنترنت أن تضمن أماناً مطلقاً. لا ترسل بيانات مصرفية أو وثائق هوية أو
                أسراراً تجارية عبر أدوات الترجمة الآلية.
              </p>
              <p>
                لعنوان IP: يُحتفظ به في ذاكرة الخادم فقط داخل عدّاد حد الاستخدام، لمدة أقصاها 10
                دقائق لكل نافذة، ثم يُحذف تلقائياً.
              </p>

              <h2 id="rights">7. حقوقك</h2>
              <p>
                بما أننا لا نحتفظ بحساب أو بيانات شخصية دائمة، لا توجد بيانات يمكن طلب حذفها. يمكنك
                مسح تفضيل الوضع الداكن من متصفحك، وإيقاف استخدام الموقع في أي وقت. إذا أرسلت إلينا
                بريداً، فسنستخدمه للرد فقط ونحذفه عندما ينتهي الغرض.
              </p>

              <h2 id="changes">8. التغييرات على هذه السياسة</h2>
              <p>
                قد نحدّث هذه الصفحة عند تغيير طريقة عمل الخدمة أو إضافة مزوّد جديد. سنغيّر تاريخ
                التحديث في أعلى الصفحة، وأي تغيير جوهري سيُشار إليه بوضوح.
              </p>

              <h2 id="contact">9. التواصل</h2>
              <p>
                لأي سؤال عن الخصوصية، راسلنا على{" "}
                <a href={`mailto:${site.email}`}>{site.email}</a>.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/terms" className={buttonClass("secondary", "md")}>
                <Icon name="book" className="size-4" />
                شروط الاستخدام
              </Link>
              <Link href="/text" className={buttonClass("ghost", "md")}>
                <Icon name="sparkles" className="size-4" />
                العودة للترجمة
              </Link>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
