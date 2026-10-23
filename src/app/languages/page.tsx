import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui/layout";
import { buttonClass } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { LanguagesDirectory } from "@/components/languages-directory";
import { LANGUAGES, RTL_LANGUAGE_CODES } from "@/lib/languages";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "اللغات المدعومة",
  description: `استعرض ${LANGUAGES.length} لغة مدعومة في تَرجِم، مع أسمائها العربية والإنجليزية واتجاه كتابتها، وابدأ الترجمة منها أو إليها مباشرة.`,
  alternates: { canonical: "/languages" },
  openGraph: {
    title: `اللغات المدعومة | ${site.name}`,
    description: "أكثر من 75 لغة بين العربية والإنجليزية واليابانية والهندية وغيرها.",
  },
};

export default function LanguagesPage() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <PageHero
          eyebrow="اللغات"
          icon="globe"
          title={`${LANGUAGES.length} لغة بين يديك`}
          description="من العربية إلى اليابانية، ومن البرتغالية إلى السواحيلية. اختر أي لغة لتبدأ الترجمة منها أو إليها، مع ضبط تلقائي لاتجاه النص."
          badges={[
            `${LANGUAGES.length} لغة مدعومة`,
            `${RTL_LANGUAGE_CODES.size} لغات RTL`,
            "روابط مباشرة لكل لغة",
          ]}
        >
          <Link href="/text" className={buttonClass("primary", "md")}>
            <Icon name="sparkles" className="size-4" />
            ابدأ الترجمة
          </Link>
          <Link href="/files" className={buttonClass("secondary", "md")}>
            <Icon name="layers" className="size-4" />
            ترجمة ملفات
          </Link>
        </PageHero>

        <section className="pb-16">
          <Container>
            <LanguagesDirectory />
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
