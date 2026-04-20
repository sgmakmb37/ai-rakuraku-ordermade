import { Sparkles, Zap, MousePointerClick } from "lucide-react";
import { FadeIn } from "./fade-in";
import { t, type Locale } from "@/i18n/translations";

const icons = [Sparkles, Zap, MousePointerClick];

export function Features({ locale }: { locale: Locale }) {
  const text = t(locale).features;

  return (
    <section
      id="features"
      className="relative scroll-mt-20 overflow-hidden bg-zinc-950 px-5 py-16 sm:px-6 sm:py-24 md:py-32"
    >
      <div className="pointer-events-none absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/[0.04] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-violet-600/[0.03] blur-[100px]" />

      <div className="relative mx-auto max-w-6xl">
        <FadeIn>
          <p className="text-center text-xs font-medium tracking-widest text-blue-400 uppercase sm:text-sm">
            {text.label}
          </p>
          <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-white sm:mt-3 sm:text-3xl md:text-4xl">
            {text.title}
          </h2>
        </FadeIn>

        <div className="mt-10 grid auto-rows-fr gap-4 sm:mt-16 sm:gap-6 md:grid-cols-3">
          {text.items.map((item, index) => {
            const Icon = icons[index];
            return (
              <FadeIn key={index} delay={0.1 + index * 0.15} className="h-full">
                <div className="group relative h-full">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-blue-600/0 to-violet-600/0 opacity-0 blur-2xl transition-all duration-500 group-hover:from-blue-600/[0.15] group-hover:to-violet-600/[0.08] group-hover:opacity-100" />
                  <div className="relative h-full rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-px transition-all duration-500 group-hover:from-blue-500/40 group-hover:to-violet-500/20">
                    <div className="h-full rounded-[15px] bg-zinc-900 p-6 sm:p-8">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/10 ring-1 ring-white/[0.06] transition-all duration-300 group-hover:from-blue-500/30 group-hover:to-violet-500/20 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] sm:h-12 sm:w-12">
                        <Icon size={20} className="text-blue-400" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-white sm:mt-5 sm:text-lg">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-400 sm:mt-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
