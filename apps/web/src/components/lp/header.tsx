"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Globe } from "lucide-react";
import { t, type Locale } from "@/i18n/translations";

export function Header({ locale }: { locale: Locale }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const text = t(locale).header;

  const navLinks = [
    { href: "#features", label: text.nav.features },
    { href: "#how-it-works", label: text.nav.howItWorks },
    { href: "#pricing", label: text.nav.pricing },
    { href: "#faq", label: text.nav.faq },
  ];

  const switchLocale = () => {
    const next = locale === "ja" ? "en" : "ja";
    document.cookie = `locale=${next};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`;
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-2xl">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="logo-text text-lg font-bold cursor-pointer sm:text-xl"
        >
          AI Rakuraku
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-400 cursor-pointer transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <button
            onClick={switchLocale}
            className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-400 cursor-pointer transition-colors duration-200 hover:border-white/[0.15] hover:text-white"
          >
            <Globe size={13} />
            {locale === "ja" ? "EN" : "JP"}
          </button>
          <Link
            href="/login"
            className="text-sm text-zinc-400 cursor-pointer transition-colors duration-200 hover:text-white"
          >
            {text.login}
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110"
          >
            {text.cta}
          </Link>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={switchLocale}
            className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-400 cursor-pointer"
          >
            <Globe size={11} />
            {locale === "ja" ? "EN" : "JP"}
          </button>
          <button
            className="cursor-pointer text-zinc-300"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/98 backdrop-blur-2xl md:hidden">
          <button
            className="absolute top-3.5 right-5 cursor-pointer text-zinc-400 transition-colors hover:text-white"
            onClick={() => setMenuOpen(false)}
            aria-label="Close"
          >
            <X size={26} />
          </button>
          <div className="flex flex-col items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-lg font-medium text-zinc-200 cursor-pointer transition-colors hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-zinc-400 cursor-pointer"
                onClick={() => setMenuOpen(false)}
              >
                {text.login}
              </Link>
              <Link
                href="/login"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-10 py-3 text-sm font-medium text-white cursor-pointer shadow-[0_0_32px_rgba(99,102,241,0.3)]"
                onClick={() => setMenuOpen(false)}
              >
                {text.cta}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
