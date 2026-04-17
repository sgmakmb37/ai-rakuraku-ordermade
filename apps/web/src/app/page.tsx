import { cookies } from "next/headers";
import type { Locale } from "@/i18n/translations";
import { Header } from "@/components/lp/header";
import { Hero } from "@/components/lp/hero";
import { Features } from "@/components/lp/features";
import { HowItWorks } from "@/components/lp/how-it-works";
import { Pricing } from "@/components/lp/pricing";
import { FAQ } from "@/components/lp/faq";
import { CTASection } from "@/components/lp/cta-section";
import { Footer } from "@/components/lp/footer";

export default async function Home() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || "ja";

  return (
    <>
      <Header locale={locale} />
      <main>
        <Hero locale={locale} />
        <Features locale={locale} />
        <HowItWorks locale={locale} />
        <Pricing locale={locale} />
        <FAQ locale={locale} />
        <CTASection locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
