# تَرجِم | Tarjim

موقع ترجمة عربي مجاني بين أكثر من **٧٨ لغة**، يدعم ترجمة النصوص والملفات مع الحفاظ على التنسيق قدر الإمكان، دون تسجيل، ودون تخزين للمحتوى.

## المزايا

- **ترجمة نصوص** — أضف نصك واحصل على ترجمة فورية مع كشف تلقائي للغة المصدر وقراءة صوتية ونسخ وتنزيل.
- **ترجمة ملفات** — يدعم `DOCX`، `XLSX`، `PPTX`، `PDF`، `TXT`، `MD`، `JSON`، `CSV`، `XML`، `HTML`، `SRT`، `ASS` وغيرها من الصيغ.
- **معالجة آمنة** — ملفات Office تُعالَج داخل المتصفح ولا تُرفع إلى الخادم، وملفات PDF تُستخرج مؤقتًا لاستخراج النص ثم تُهمَل مباشرةً.
- **العربية أولاً** — واجهة كاملة بالعربية مع اتجاه `RTL`، ومتجاوبة مع جميع الشاشات، ودعم الوضع الداكن.
- **مجاني بالكامل** — بلا تسجيل، بلا إعلانات، وبلا تخزين للمحتوى.

## التقنيات المستخدمة

- [Next.js 16](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Vercel](https://vercel.com/) / [Cloudflare Workers](https://developers.cloudflare.com/workers/)

## التطوير المحلي

```bash
pnpm install
pnpm dev
```

افتح [http://localhost:3000](http://localhost:3000)

## الفحص والاختبار

```bash
pnpm lint && pnpm typecheck && pnpm build && pnpm test
```

## النشر

### Vercel (موصى به، كامل الوظائف)

1. ارفع المشروع إلى GitHub
2. استورد المستودع من [vercel.com/new](https://vercel.com/new)
3. انشر مباشرةً

### Cloudflare Workers (OpenNext)

```bash
pnpm cf:build
pnpm cf:deploy
```

### GitHub Pages (ثابت فقط)

```bash
pnpm build:static
```

## الترخيص

جميع الحقوق محفوظة لمشروع تَرجِم. الاستخدام للأغراض الشخصية والتجارية وفقًا لسياسة الخصوصية وشروط الاستخدام المتوفرين على الموقع.
