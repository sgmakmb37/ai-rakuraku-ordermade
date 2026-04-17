import Link from "next/link";
import { t, type Locale } from "@/i18n/translations";

export function Footer({ locale }: { locale: Locale }) {
  const text = t(locale).footer;

  return (
    <footer className="relative border-t border-white/[0.06] bg-zinc-950 px-5 py-8 sm:px-6 sm:py-12">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:justify-between">
          <Link
            href="/"
            className="logo-text text-lg font-bold cursor-pointer sm:text-xl"
          >
            AI Rakuraku
          </Link>
          <div className="flex gap-6 sm:gap-8">
            <Link
              href="/tokushoho"
              className="text-xs text-zinc-500 cursor-pointer transition-colors duration-200 hover:text-zinc-300 sm:text-sm"
            >
              {text.tokushoho}
            </Link>
            <Link
              href="/terms"
              className="text-xs text-zinc-500 cursor-pointer transition-colors duration-200 hover:text-zinc-300 sm:text-sm"
            >
              {text.terms}
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-zinc-500 cursor-pointer transition-colors duration-200 hover:text-zinc-300 sm:text-sm"
            >
              {text.privacy}
            </Link>
            <Link
              href="/contact"
              className="text-xs text-zinc-500 cursor-pointer transition-colors duration-200 hover:text-zinc-300 sm:text-sm"
            >
              {text.contact}
            </Link>
          </div>
        </div>
        <div className="mt-6 text-center text-[10px] text-zinc-600 sm:mt-8 sm:text-xs">
          &copy; 2026 {text.copyright}
        </div>
      </div>
    </footer>
  );
}
