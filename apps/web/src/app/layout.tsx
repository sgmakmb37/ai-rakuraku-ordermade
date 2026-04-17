import type { Metadata } from "next";
import { Inter, Noto_Sans_JP, Noto_Serif_JP, Dancing_Script } from "next/font/google";
import { cookies } from "next/headers";
import type { Locale } from "@/i18n/translations";
import "./globals.css";
import { WebVitalsReporter } from "@/components/web-vitals-reporter";
import { LocaleProvider } from "@/lib/i18n";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["700"],
});

const dancingScript = Dancing_Script({
  variable: "--font-cursive",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "AIらくらくオーダーメイド",
  description:
    "誰でもAIをオーダーメイドできる。専門知識なし、GPU不要、UI操作だけでAIモデルをカスタマイズ。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const c = await cookies();
  const locale = (c.get("locale")?.value as Locale) || "ja";

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${notoSansJP.variable} ${notoSerifJP.variable} ${dancingScript.variable} h-full antialiased scroll-smooth ${locale === "ja" ? "locale-ja" : ""}`}
    >
      <body className="min-h-screen bg-zinc-950 flex flex-col">
        <WebVitalsReporter />
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
