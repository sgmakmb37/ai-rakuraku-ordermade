import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "./fade-in";
import { t, type Locale } from "@/i18n/translations";

export function Hero({ locale }: { locale: Locale }) {
  const text = t(locale).hero;

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-zinc-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-aurora-1 absolute top-[20%] left-[30%] h-[400px] w-[400px] rounded-full bg-blue-600/[0.15] blur-[120px] sm:h-[600px] sm:w-[600px] sm:blur-[140px]" />
        <div className="animate-aurora-2 absolute bottom-[20%] right-[25%] h-[350px] w-[350px] rounded-full bg-violet-600/[0.12] blur-[100px] sm:h-[500px] sm:w-[500px] sm:blur-[130px]" />
        <div className="animate-aurora-3 absolute top-1/2 left-1/2 h-[300px] w-[300px] rounded-full bg-fuchsia-500/[0.08] blur-[100px] sm:h-[400px] sm:w-[400px] sm:blur-[120px]" />
      </div>

      <div className="bg-grid-pattern pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,transparent_20%,rgba(9,9,11,0.7)_100%)]" />

      <div className="pointer-events-none absolute top-[25%] left-[12%] hidden lg:block">
        <div className="animate-float h-16 w-16 rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] opacity-60" />
      </div>
      <div className="pointer-events-none absolute top-[60%] right-[8%] hidden lg:block">
        <div className="animate-float-reverse h-12 w-12 rounded-full border border-violet-500/20 bg-violet-500/[0.06] opacity-50" />
      </div>
      <div className="pointer-events-none absolute bottom-[30%] left-[6%] hidden lg:block">
        <div className="animate-float-slow h-8 w-8 border border-fuchsia-500/20 bg-fuchsia-500/[0.06] opacity-40" />
      </div>

      <div className="relative flex min-h-[100svh] items-center justify-center px-5 pt-16 pb-20 sm:px-6 sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn delay={0.1}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-zinc-400 backdrop-blur-sm sm:mb-8 sm:gap-2.5 sm:px-4 sm:py-1.5 sm:text-sm">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 sm:h-2 sm:w-2" />
              </span>
              {text.badge}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h1 className="text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
              {text.titleLine1}
              <br />
              <span className="shimmer-text">{text.titleLine2}</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.35}>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400 sm:mt-6 sm:text-base md:text-lg">
              {text.subtitleLine1}
              <br className="hidden sm:block" />
              {text.subtitleLine2}
            </p>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/login"
                className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 text-sm font-medium text-white shadow-[0_0_32px_rgba(99,102,241,0.35)] cursor-pointer transition-all duration-300 hover:shadow-[0_0_56px_rgba(99,102,241,0.55)] hover:brightness-110 sm:h-12 sm:w-auto sm:px-8"
              >
                {text.ctaPrimary}
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.03] px-6 text-sm font-medium text-zinc-300 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:border-white/[0.2] hover:bg-white/[0.06] sm:h-12 sm:w-auto sm:px-8"
              >
                {text.ctaSecondary}
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={0.65}>
            <div className="mt-12 inline-flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 backdrop-blur-sm sm:mt-20 sm:gap-10 sm:px-8 sm:py-5">
              <div className="text-center">
                <div className="text-xl font-bold text-white sm:text-3xl">
                  {text.stat1.value}
                  <span className="text-sm text-zinc-400 sm:text-lg">
                    {text.stat1.unit}
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] text-zinc-500 sm:mt-1 sm:text-xs">
                  {text.stat1.label}
                </div>
              </div>
              <div className="hidden h-8 w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent sm:block sm:h-10" />
              <div className="text-center">
                <div className="text-xl font-bold text-white sm:text-3xl">
                  {text.stat2.value}
                  <span className="text-sm text-zinc-400 sm:text-lg">
                    {text.stat2.unit}
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] text-zinc-500 sm:mt-1 sm:text-xs">
                  {text.stat2.label}
                </div>
              </div>
              <div className="hidden h-8 w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent sm:block sm:h-10" />
              <div className="text-center">
                <div className="text-xl font-bold text-white sm:text-3xl">
                  {text.stat3.value}
                  <span className="text-sm text-zinc-400 sm:text-lg">
                    {text.stat3.unit}
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] text-zinc-500 sm:mt-1 sm:text-xs">
                  {text.stat3.label}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent sm:h-40" />
    </section>
  );
}
