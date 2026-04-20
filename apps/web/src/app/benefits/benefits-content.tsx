"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/lp/fade-in";

interface BenefitItem {
  title: string;
  body: string;
  example: string;
}

interface ContentData {
  pageTitle: string;
  section1Title: string;
  section2Title: string;
  ctaTitleLine1: string;
  ctaTitleLine2: string;
  ctaSubtitle: string;
  ctaButton: string;
  section1: BenefitItem[];
  section2: BenefitItem[];
  exampleLabel: string;
  readMore: string;
  back: string;
}

function truncate(text: string, len: number) {
  if (text.length <= len) return text;
  return text.slice(0, len) + "…";
}

function Modal({
  item,
  exampleLabel,
  back,
  variant,
  onClose,
}: {
  item: BenefitItem;
  exampleLabel: string;
  back: string;
  variant: "blue" | "violet";
  onClose: () => void;
}) {
  const borderColor =
    variant === "blue" ? "border-blue-500/10" : "border-violet-500/10";
  const bgColor =
    variant === "blue" ? "bg-blue-500/[0.04]" : "bg-violet-500/[0.04]";
  const labelColor =
    variant === "blue" ? "text-blue-400" : "text-violet-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-950/90 backdrop-blur-sm px-4 py-8 sm:py-16"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-zinc-900 p-5 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white sm:text-xl">
          {item.title}
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-zinc-300 sm:text-base sm:leading-7">
          {item.body}
        </p>
        <div
          className={`mt-5 rounded-xl border ${borderColor} ${bgColor} px-4 py-3 sm:px-5 sm:py-4`}
        >
          <p className={`text-xs font-medium ${labelColor} sm:text-sm`}>
            {exampleLabel}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400 sm:text-sm sm:leading-6">
            {item.example}
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/[0.1] bg-white/[0.03] px-6 py-2 text-sm font-medium text-zinc-300 cursor-pointer transition-all hover:border-white/[0.2] hover:bg-white/[0.06]"
          >
            {back}
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({
  item,
  exampleLabel,
  readMore,
  variant,
  onOpen,
}: {
  item: BenefitItem;
  exampleLabel: string;
  readMore: string;
  variant: "blue" | "violet";
  onOpen: () => void;
}) {
  const borderColor =
    variant === "blue" ? "border-blue-500/10" : "border-violet-500/10";
  const bgColor =
    variant === "blue" ? "bg-blue-500/[0.04]" : "bg-violet-500/[0.04]";
  const labelColor =
    variant === "blue" ? "text-blue-400" : "text-violet-400";
  const btnColor =
    variant === "blue"
      ? "text-blue-400 hover:text-blue-300"
      : "text-violet-400 hover:text-violet-300";

  return (
    <article className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
      <h3 className="text-sm font-bold text-white sm:text-base">{item.title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-zinc-400 sm:hidden">
        {truncate(item.body, 35)}
      </p>
      <p className="mt-2 hidden text-sm leading-relaxed text-zinc-400 sm:block">
        {truncate(item.body, 70)}
      </p>
      <button
        onClick={onOpen}
        className={`mt-2 self-start text-xs font-medium cursor-pointer transition-colors ${btnColor} sm:text-sm`}
      >
        {readMore} →
      </button>
      {/* PC only: show example on card */}
      <div
        className={`mt-3 hidden flex-1 rounded-lg border sm:mt-4 sm:block ${borderColor} ${bgColor} px-3 py-2.5 sm:px-4 sm:py-3`}
      >
        <p className={`text-xs font-medium ${labelColor}`}>
          {exampleLabel}
        </p>
        <p className="mt-0.5 text-xs leading-5 text-zinc-400">
          {item.example}
        </p>
      </div>
    </article>
  );
}

export function BenefitsContent({ data }: { data: ContentData }) {
  const [modal, setModal] = useState<{
    item: BenefitItem;
    variant: "blue" | "violet";
  } | null>(null);

  return (
    <>
      {modal && (
        <Modal
          item={modal.item}
          exampleLabel={data.exampleLabel}
          back={data.back}
          variant={modal.variant}
          onClose={() => setModal(null)}
        />
      )}

      {/* Hero */}
      <section className="relative overflow-hidden px-5 py-10 sm:px-6 sm:py-16 md:py-24">
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.06] blur-[140px]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <FadeIn>
            <p className="text-xs font-medium tracking-widest text-blue-400 uppercase sm:text-sm">
              Benefits
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-5xl">
              {data.pageTitle}
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* Section 1 */}
      <section className="relative px-5 pb-12 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h2 className="mb-8 text-lg font-bold text-white sm:mb-12 sm:text-2xl md:text-3xl">
              {data.section1Title}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {data.section1.map((item, i) => (
              <FadeIn key={i} delay={0.05 * i}>
                <Card
                  item={item}
                  exampleLabel={data.exampleLabel}
                  readMore={data.readMore}
                  variant="blue"
                  onOpen={() => setModal({ item, variant: "blue" })}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-4xl px-5 sm:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      {/* Section 2 */}
      <section className="relative px-5 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h2 className="mb-8 text-lg font-bold text-white sm:mb-12 sm:text-2xl md:text-3xl">
              {data.section2Title}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {data.section2.map((item, i) => (
              <FadeIn key={i} delay={0.05 * i}>
                <Card
                  item={item}
                  exampleLabel={data.exampleLabel}
                  readMore={data.readMore}
                  variant="violet"
                  onOpen={() => setModal({ item, variant: "violet" })}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — same design as LP CTA section */}
      <section className="relative overflow-hidden bg-zinc-950 px-5 py-16 sm:px-6 sm:py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="animate-aurora-1 absolute top-1/2 left-1/3 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-blue-600/[0.12] blur-[120px] sm:h-[500px] sm:w-[500px] sm:blur-[140px]" />
          <div className="animate-aurora-2 absolute bottom-1/4 right-1/3 h-[300px] w-[300px] rounded-full bg-violet-600/[0.1] blur-[100px] sm:h-[400px] sm:w-[400px] sm:blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <FadeIn>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-5xl">
              {data.ctaTitleLine1}
              <br />
              <span className="shimmer-text">{data.ctaTitleLine2}</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="mt-3 text-sm text-zinc-400 sm:mt-4 sm:text-base">
              {data.ctaSubtitle}
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <Link
              href="/login"
              className="group mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 text-sm font-medium text-white animate-pulse-glow cursor-pointer transition-all duration-300 hover:brightness-110 sm:mt-10 sm:h-12 sm:px-10"
            >
              {data.ctaButton}
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
