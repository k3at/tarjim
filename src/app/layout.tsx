import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "تَرجِم | ترجمة نصوص وملفات مجانية بين أكثر من ٧٨ لغة",
    template: `%s | تَرجِم`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "ترجمة",
    "ترجمة نصوص",
    "ترجمة ملفات",
    "ترجمة PDF",
    "ترجمة Word",
    "ترجمة مجانية",
    "ترجمة عربية",
    "Tarjim",
    "translate Arabic",
  ],
  authors: [{ name: site.author }],
  creator: site.author,
  category: "translation",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: site.url },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#070e1a" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

// يطبّق الوضع المحفوظ قبل أول رسم للصفحة لمنع وميض الألوان.
const themeScript = `(function(){try{var s=localStorage.getItem("theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${plexArabic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-surface text-foreground flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="focus:bg-brand-600 sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:text-white"
        >
          تخطَّ إلى المحتوى
        </a>
        {children}
      </body>
    </html>
  );
}
