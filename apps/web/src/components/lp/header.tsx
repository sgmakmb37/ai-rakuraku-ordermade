"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { t, type Locale } from "@/i18n/translations";

export function Header({ locale }: { locale: Locale }) {
  const text = t(locale).header;

  const switchLocale = () => {
    const next = locale === "ja" ? "en" : "ja";
    document.cookie = `locale=${next};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`;
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-2xl">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="logo-text text-base font-bold cursor-pointer sm:text-xl"
        >
          AI Rakuraku
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={switchLocale}
            className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-zinc-400 cursor-pointer transition-colors duration-200 hover:border-white/[0.15] hover:text-white sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs"
          >
            <Globe className="size-3 sm:size-3.5" />
            {locale === "ja" ? "EN" : "JP"}
          </button>
          <Link
            href="/login"
            className="text-xs text-zinc-400 cursor-pointer transition-colors duration-200 hover:text-white sm:text-sm"
          >
            {text.login}
          </Link>

        </div>
      </nav>
    </header>
  );
}
