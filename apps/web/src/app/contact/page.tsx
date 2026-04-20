import { cookies } from "next/headers";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/translations";
import { Header } from "@/components/lp/header";
import { Footer } from "@/components/lp/footer";
import { ContactForm } from "@/components/lp/contact-form";
import { Mail } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const c = await cookies();
  const locale = c.get("locale")?.value as Locale;
  return {
    title:
      locale === "en"
        ? "Contact | AI Rakuraku"
        : "お問い合わせ | AIらくらくオーダーメイド",
  };
}

export default async function ContactPage() {
  const c = await cookies();
  const locale = (c.get("locale")?.value as Locale) || "ja";

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen bg-zinc-950 px-5 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-24">
        <div className="mx-auto max-w-2xl">
          {locale === "ja" ? (
            <>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                お問い合わせ
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                サービスに関するご質問、ご意見、不具合の報告など、お気軽にお問い合わせください。
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Contact Us
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Have a question, feedback, or need to report an issue? We&apos;d
                love to hear from you.
              </p>
            </>
          )}

          {/* Info card */}
          <div className="mt-8">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <Mail size={20} className="text-blue-400" />
              <h3 className="mt-3 text-sm font-medium text-zinc-200">
                {locale === "ja" ? "メール" : "Email"}
              </h3>
              <a
                href="mailto:contact@ai-rakuraku.jp"
                className="mt-1 block text-sm text-blue-400 underline underline-offset-2 cursor-pointer"
              >
                contact@ai-rakuraku.jp
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-zinc-950 px-4 text-xs text-zinc-600">
                {locale === "ja"
                  ? "または以下のフォームから送信"
                  : "Or send a message below"}
              </span>
            </div>
          </div>

          {/* Form */}
          <ContactForm locale={locale} />

          {/* Privacy notice */}
          <p className="mt-8 text-xs leading-relaxed text-zinc-600">
            {locale === "ja" ? (
              <>
                ご入力いただいた個人情報は、お問い合わせへの対応にのみ使用いたします。詳細は
                <a
                  href="/privacy"
                  className="text-zinc-500 underline underline-offset-2"
                >
                  プライバシーポリシー
                </a>
                をご覧ください。
              </>
            ) : (
              <>
                Personal information provided will only be used to respond to
                your inquiry. See our{" "}
                <a
                  href="/privacy"
                  className="text-zinc-500 underline underline-offset-2"
                >
                  Privacy Policy
                </a>{" "}
                for details.
              </>
            )}
          </p>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
