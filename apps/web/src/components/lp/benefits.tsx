import Link from "next/link";
import { ArrowRight, TrendingDown, Zap, Shield, Lock, Server, Layers } from "lucide-react";
import { FadeIn } from "./fade-in";
import { t, type Locale } from "@/i18n/translations";

const icons = [TrendingDown, Zap, Shield, Lock, Server, Layers];

const benefitTitles = {
  ja: ["料金が大幅に安くなる", "反応が早い", "出力が安定する", "データが外部に漏れない", "外部サービスに依存しない", "大量処理に強い"],
  en: ["Dramatically lower cost", "Faster responses", "Consistent output", "Your data stays private", "No vendor dependency", "Massive batch processing"],
};

export function Benefits({ locale }: { locale: Locale }) {
  const text = t(locale).benefits;
  const titles = benefitTitles[locale];

  return (
    <section
      id="benefits"
      className="relative scroll-mt-20 overflow-hidden bg-zinc-950 px-5 py-16 sm:px-6 sm:py-24 md:py-32"
    >
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/[0.05] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-600/[0.04] blur-[100px]" />

      <div className="relative mx-auto max-w-6xl">
        <FadeIn>
          <p className="text-center text-xs font-medium tracking-widest text-blue-400 uppercase sm:text-sm">
            {text.label}
          </p>
          <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-white sm:mt-3 sm:text-3xl md:text-4xl">
            {text.title}
          </h2>
          <p className="mt-3 text-center text-xs text-zinc-400 sm:mt-4 sm:text-sm">
            {text.subtitle}
          </p>
        </FadeIn>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:mt-14 sm:gap-4 md:grid-cols-3">
          {titles.map((title, index) => {
            const Icon = icons[index];
            return (
              <FadeIn key={index} delay={0.08 + index * 0.06}>
                <div className="group relative h-full">
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-blue-600/0 to-violet-600/0 opacity-0 blur-xl transition-all duration-500 group-hover:from-blue-600/20 group-hover:to-violet-600/10 group-hover:opacity-100" />
                  <div className="relative h-full rounded-xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-px transition-all duration-500 group-hover:from-blue-500/50 group-hover:to-violet-500/30">
                    <div className="flex h-full flex-col items-center gap-2.5 rounded-[11px] bg-zinc-900 px-4 py-5 text-center sm:gap-3 sm:px-5 sm:py-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/10 ring-1 ring-white/[0.06] transition-all duration-300 group-hover:from-blue-500/30 group-hover:to-violet-500/20 group-hover:shadow-[0_0_16px_rgba(99,102,241,0.2)] sm:h-11 sm:w-11">
                        <Icon size={18} className="text-blue-400" />
                      </div>
                      <span className="text-xs font-semibold leading-snug text-white sm:text-sm">
                        {title}
                      </span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        <FadeIn delay={0.5}>
          <div className="mt-8 flex justify-center sm:mt-12">
            <Link
              href="/benefits"
              className="group inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] px-6 text-sm font-medium text-zinc-300 cursor-pointer transition-all duration-300 hover:border-white/[0.2] hover:bg-white/[0.06] hover:text-white sm:h-11 sm:px-8"
            >
              {text.cta}
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
