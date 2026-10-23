export const site = {
  name: "تَرجِم",
  nameEn: "Tarjim",
  tagline: "ترجمة نصوص وملفات بجودة احترافية",
  description:
    "منصة عربية مجانية لترجمة النصوص والملفات بين أكثر من 75 لغة. ترجم Word وPDF وPowerPoint وExcel والنصوص والترجمة المرئية مباشرة من متصفحك، دون تسجيل ودون تخزين لملفاتك.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tarjim.pages.dev",
  author: "فريق تَرجِم",
  email: "hello@tarjim.app",
  nav: [
    { label: "الرئيسية", href: "/" },
    { label: "ترجمة نص", href: "/text" },
    { label: "ترجمة ملفات", href: "/files" },
    { label: "اللغات", href: "/languages" },
    { label: "عن الموقع", href: "/about" },
  ],
  stats: [
    { value: "75+", label: "لغة مدعومة" },
    { value: "20+", label: "صيغة ملفات" },
    { value: "0 ر.س", label: "تكلفة الاستخدام" },
    { value: "0", label: "ملفات محفوظة" },
  ],
} as const;

export type Site = typeof site;
