import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "./fade-in";
import { t, type Locale } from "@/i18n/translations";

export function CTASection({ locale }: { locale: Locale }) {
  const text = t(locale).ctaSection;

  return (
    <section className="relative overflow-hidden bg-zinc-950 px-5 py-16 sm:px-6 sm:py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-aurora-1 absolute top-1/2 left-1/3 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-blue-600/[0.12] blur-[120px] sm:h-[500px] sm:w-[500px] sm:blur-[140px]" />
        <div className="animate-aurora-2 absolute bottom-1/4 right-1/3 h-[300px] w-[300px] rounded-full bg-violet-600/[0.1] blur-[100px] sm:h-[400px] sm:w-[400px] sm:blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-2xl text-center">
        <FadeIn>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-5xl">
            {text.titleLine1}
            <br />
            <span className="shimmer-text">{text.titleLine2}</span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="mt-3 text-sm text-zinc-400 sm:mt-4 sm:text-base">
            {text.subtitle}
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <Link
            href="/login"
            className="group mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 text-sm font-medium text-white animate-pulse-glow cursor-pointer transition-all duration-300 hover:brightness-110 sm:mt-10 sm:h-12 sm:px-10"
          >
            {text.button}
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
