import { cookies } from "next/headers";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/translations";
import { Header } from "@/components/lp/header";
import { Footer } from "@/components/lp/footer";
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
        <div className="mx-auto max-w-xl text-center">
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

          <div className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/10 ring-1 ring-white/[0.06]">
                <Mail size={18} className="text-blue-400" />
              </div>
              <h2 className="text-base font-semibold text-white sm:text-lg">
                {locale === "ja" ? "メールでお問い合わせ" : "Contact via Email"}
              </h2>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              {locale === "ja"
                ? "以下のメールアドレス宛に、お問い合わせ内容をお送りください。通常2〜3営業日以内にご返信いたします。"
                : "Please send your inquiry to the email address below. We typically respond within 2-3 business days."}
            </p>

            <a
              href="mailto:contact@ai-rakuraku.jp"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:brightness-110"
            >
              <Mail size={15} />
              contact@ai-rakuraku.jp
            </a>

            <div className="mt-6 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-xs font-medium text-zinc-300">
                {locale === "ja" ? "メールに含めていただきたい内容" : "Please include in your email"}
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed text-zinc-500">
                {locale === "ja" ? (
                  <>
                    <li>・お名前</li>
                    <li>・お問い合わせの種類（質問 / 不具合報告 / その他）</li>
                    <li>・具体的な内容</li>
                  </>
                ) : (
                  <>
                    <li>- Your name</li>
                    <li>- Type of inquiry (question / bug report / other)</li>
                    <li>- Details of your inquiry</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <p className="mt-8 text-xs leading-relaxed text-zinc-600">
            {locale === "ja" ? (
              <>
                ご提供いただいた個人情報は、お問い合わせへの対応にのみ使用いたします。詳細は
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
