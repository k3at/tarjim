export const site = {
  name: "تَرجِم",
  nameEn: "Tarjim",
  tagline: "ترجمة نصوص وملفات مجانًا ودون تسجيل",
  description:
    "تَرجِم منصة عربية مجانية لترجمة النصوص والملفات بين أكثر من ٧٨ لغة. يدعم ترجمة ملفات Word وExcel وPowerPoint وPDF وغيرها مع الحفاظ على التنسيق قدر الإمكان، ويُعالج معظم الملفات داخل متصفحك لحماية خصوصيتك، دون تسجيل أو تخزين للمحتوى.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tarjim-one.vercel.app",
  author: "تَرجِم",
  email: "hello@tarjim.app",
  nav: [
    { label: "الرئيسية", href: "/" },
    { label: "ترجمة نصوص", href: "/text" },
    { label: "ترجمة ملفات", href: "/files" },
    { label: "اللغات", href: "/languages" },
    { label: "عن الموقع", href: "/about" },
  ],
  stats: [
    { value: "٧٨+", label: "لغة مدعومة" },
    { value: "٢٢+", label: "صيغة ملف مدعومة" },
    { value: "مجاني", label: "بدون تسجيل أو دفع" },
    { value: "آمن", label: "معالجة تحترم الخصوصية" },
  ],
} as const;

export type Site = typeof site;
