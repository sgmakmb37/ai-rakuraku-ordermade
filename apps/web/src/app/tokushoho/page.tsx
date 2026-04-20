import { cookies } from "next/headers";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/translations";
import { Header } from "@/components/lp/header";
import { Footer } from "@/components/lp/footer";

export async function generateMetadata(): Promise<Metadata> {
  const c = await cookies();
  const locale = c.get("locale")?.value as Locale;
  return {
    title:
      locale === "en"
        ? "Specified Commercial Transactions Act | AI Rakuraku"
        : "特定商取引法に基づく表記 | AIらくらくオーダーメイド",
  };
}

export default async function TokushohoPage() {
  const c = await cookies();
  const locale = (c.get("locale")?.value as Locale) || "ja";

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen bg-zinc-950 px-5 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-24">
        <div className="mx-auto max-w-3xl">
          {locale === "ja" ? <TokushohoJa /> : <TokushohoEn />}
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}

function TokushohoJa() {
  return (
    <>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">
        特定商取引法に基づく表記
      </h1>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <Row label="販売業者" value="やすい ともき" />
            <Row label="販売責任者" value="やすい ともき" />
            <Row label="所在地" value="〒767-0014 香川県三豊市高瀬町上麻83-8" />
            <Row label="電話番号" value="070-8439-6289" />
            <Row label="メールアドレス" value="contact@ai-rakuraku.jp" />
            <Row label="サービスURL" value="https://ai-rakuraku.jp" />
            <Row
              label="販売価格"
              value="標準プラン: 880円（$6 USD）/回、高速プラン: 1,430円（$10 USD）/回（税込）"
            />
            <Row
              label="販売価格以外の必要料金"
              value="インターネット接続に必要な通信料等はお客様のご負担となります"
            />
            <Row label="支払方法" value="クレジットカード（Stripe決済）" />
            <Row label="支払時期" value="注文確定時に即時決済" />
            <Row
              label="商品の引渡し時期"
              value="決済完了後、AI学習処理が完了次第ダウンロード可能（標準プラン: 約90〜120分、高速プラン: 約35〜55分）"
            />
            <Row
              label="返品・キャンセルについて"
              value="デジタルコンテンツの性質上、決済完了後のキャンセル・返金はお受けできません。ただし、システム障害等により処理が正常に完了しなかった場合は全額返金いたします。"
            />
            <Row
              label="申込みの撤回について"
              value="決済完了前であればキャンセル可能です。決済完了後の撤回はできません。"
            />
            <Row
              label="動作環境"
              value="Google Chrome、Safari、Microsoft Edge、Firefoxの最新版を推奨。インターネット接続が必要です。"
            />
          </tbody>
        </table>
      </div>
      <p className="mt-8 text-xs text-zinc-600">制定日: 2026年4月17日</p>
    </>
  );
}

function TokushohoEn() {
  return (
    <>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">
        Disclosure under the Specified Commercial Transactions Act (Japan)
      </h1>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <Row label="Operator" value="Tomoki Yasui" />
            <Row label="Representative" value="Tomoki Yasui" />
            <Row
              label="Address"
              value="83-8 Kamiasa, Takase-cho, Mitoyo-shi, Kagawa 767-0014, Japan"
            />
            <Row label="Phone" value="+81-70-8439-6289" />
            <Row label="Email" value="contact@ai-rakuraku.jp" />
            <Row label="Service URL" value="https://ai-rakuraku.jp" />
            <Row
              label="Pricing"
              value="Standard: &yen;880 ($6 USD) / run, Fast: &yen;1,430 ($10 USD) / run (tax included)"
            />
            <Row
              label="Additional costs"
              value="Internet connection fees are borne by the customer"
            />
            <Row label="Payment method" value="Credit card (via Stripe)" />
            <Row label="Payment timing" value="Charged at order confirmation" />
            <Row
              label="Delivery"
              value="Available for download upon completion of AI training (Standard: approx. 90-120 min, Fast: approx. 35-55 min)"
            />
            <Row
              label="Returns / Cancellation"
              value="No cancellations or refunds after payment is completed due to the nature of digital content. Full refund only if processing fails due to system error."
            />
            <Row
              label="Withdrawal of application"
              value="Cancellation is possible before payment is completed. Withdrawal is not possible after payment."
            />
            <Row
              label="System requirements"
              value="Latest version of Google Chrome, Safari, Microsoft Edge, or Firefox recommended. Internet connection required."
            />
          </tbody>
        </table>
      </div>
      <p className="mt-8 text-xs text-zinc-600">Effective: April 17, 2026</p>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <th className="border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-left align-top font-medium text-zinc-300 whitespace-nowrap">
        {label}
      </th>
      <td className="border border-white/[0.06] px-4 py-2.5 text-zinc-400">
        {value}
      </td>
    </tr>
  );
}
