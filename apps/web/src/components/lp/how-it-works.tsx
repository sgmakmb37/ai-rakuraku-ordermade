import { Layers, Upload, Play, Download } from "lucide-react";
import { FadeIn } from "./fade-in";
import { t, type Locale } from "@/i18n/translations";

const stepIcons = [Layers, Upload, Play, Download];

export function HowItWorks({ locale }: { locale: Locale }) {
  const text = t(locale).howItWorks;

  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-20 overflow-hidden bg-zinc-900 px-5 py-16 sm:px-6 sm:py-24 md:py-32"
    >
      <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/[0.04] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <FadeIn>
          <p className="text-center text-xs font-medium tracking-widest text-blue-400 uppercase sm:text-sm">
            {text.label}
          </p>
          <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-white sm:mt-3 sm:text-3xl md:text-4xl">
            {text.title}
          </h2>
        </FadeIn>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:mt-16 sm:gap-8 lg:grid-cols-4 lg:gap-8">
          {text.steps.map((step, index) => {
            const Icon = stepIcons[index];
            return (
              <FadeIn key={index} delay={0.1 + index * 0.12}>
                <div className="group relative text-center lg:text-left">
                  <div className="relative mx-auto w-fit lg:mx-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 ring-1 ring-white/[0.08] transition-all duration-300 group-hover:from-blue-500/30 group-hover:to-violet-500/30 group-hover:shadow-[0_0_24px_rgba(99,102,241,0.2)] sm:h-14 sm:w-14">
                      <Icon size={20} className="text-blue-400" />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-[10px] font-bold text-white ring-2 ring-zinc-900 sm:h-6 sm:w-6">
                      {index + 1}
                    </div>
                  </div>

                  <h3 className="mt-3 text-sm font-semibold text-white sm:mt-5 sm:text-base">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400 sm:mt-2 sm:text-sm">
                    {step.description}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
