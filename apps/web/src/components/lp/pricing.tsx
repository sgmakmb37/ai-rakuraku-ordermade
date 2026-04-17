import Link from "next/link";
import { Check } from "lucide-react";
import { FadeIn } from "./fade-in";
import { t, type Locale } from "@/i18n/translations";

export function Pricing({ locale }: { locale: Locale }) {
  const text = t(locale).pricing;

  return (
    <section
      id="pricing"
      className="relative scroll-mt-20 overflow-hidden bg-zinc-950 px-5 py-16 sm:px-6 sm:py-24 md:py-32"
    >
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.04] blur-[120px]" />

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

        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:mt-16 sm:gap-6 md:grid-cols-2">
          {text.plans.map((plan, index) => (
            <FadeIn key={index} delay={0.1 + index * 0.15}>
              <div className="group relative h-full">
                {plan.primary && (
                  <div className="animate-bg-pulse absolute -inset-2 rounded-3xl bg-gradient-to-b from-blue-600/25 to-violet-600/15 blur-2xl" />
                )}

                <div
                  className={`relative h-full rounded-2xl p-px transition-all duration-500 ${
                    plan.primary
                      ? "bg-gradient-to-b from-blue-500/60 via-violet-500/60 to-fuchsia-500/40"
                      : "bg-gradient-to-b from-white/[0.08] to-white/[0.02] group-hover:from-white/[0.15] group-hover:to-white/[0.05]"
                  }`}
                >
                  <div
                    className={`flex h-full flex-col rounded-[15px] p-6 sm:p-8 ${
                      plan.primary ? "bg-zinc-900" : "bg-zinc-900/80"
                    }`}
                  >
                    {plan.badge && (
                      <div className="mb-3 inline-flex w-fit items-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-2.5 py-0.5 text-[10px] font-medium text-white sm:mb-4 sm:px-3 sm:py-1 sm:text-xs">
                        {plan.badge}
                      </div>
                    )}
                    <h3 className="text-base font-semibold text-white sm:text-lg">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                      {plan.description}
                    </p>

                    <div className="mt-4 sm:mt-6">
                      <span className="text-3xl font-bold text-white sm:text-4xl">
                        {plan.currency}
                        {plan.price}
                      </span>
                      <span className="ml-1 text-xs text-zinc-500 sm:ml-1.5 sm:text-sm">
                        {plan.priceSuffix}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-500 sm:mt-1 sm:text-sm">
                      {plan.secondaryPrice}
                    </div>

                    <ul className="mt-5 flex-1 space-y-2.5 sm:mt-8 sm:space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-xs sm:gap-3 sm:text-sm"
                        >
                          <Check
                            size={14}
                            className={`mt-0.5 shrink-0 ${
                              plan.primary ? "text-blue-400" : "text-zinc-500"
                            }`}
                          />
                          <span className="text-zinc-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/login"
                      className={`mt-6 flex h-10 items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 sm:mt-8 sm:h-11 ${
                        plan.primary
                          ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_36px_rgba(99,102,241,0.45)] hover:brightness-110"
                          : "border border-white/[0.1] bg-white/[0.03] text-zinc-300 hover:border-white/[0.2] hover:bg-white/[0.06]"
                      }`}
                    >
                      {text.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
