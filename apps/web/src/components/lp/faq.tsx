"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FadeIn } from "./fade-in";
import { t, type Locale } from "@/i18n/translations";

export function FAQ({ locale }: { locale: Locale }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const text = t(locale).faq;

  return (
    <section
      id="faq"
      className="scroll-mt-20 bg-zinc-900 px-5 py-16 sm:px-6 sm:py-24 md:py-32"
    >
      <div className="mx-auto max-w-2xl">
        <FadeIn>
          <p className="text-center text-xs font-medium tracking-widest text-blue-400 uppercase sm:text-sm">
            {text.label}
          </p>
          <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-white sm:mt-3 sm:text-3xl md:text-4xl">
            {text.title}
          </h2>
        </FadeIn>

        <div className="mt-10 sm:mt-16">
          {text.items.map((faq, index) => (
            <FadeIn key={index} delay={0.05 + index * 0.08}>
              <div className="border-b border-white/[0.06]">
                <button
                  className="flex w-full items-center justify-between py-4 text-left cursor-pointer sm:py-5"
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                >
                  <span className="pr-4 text-[13px] font-medium text-zinc-200 sm:text-[15px]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-zinc-500 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${
                    openIndex === index
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-4 text-xs leading-relaxed text-zinc-400 sm:pb-5 sm:text-sm">
                      {faq.answer}
                    </p>
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
