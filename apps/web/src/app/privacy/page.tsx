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
        ? "Privacy Policy | AI Rakuraku"
        : "プライバシーポリシー | AIらくらくオーダーメイド",
  };
}

export default async function PrivacyPage() {
  const c = await cookies();
  const locale = (c.get("locale")?.value as Locale) || "ja";

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen bg-zinc-950 px-5 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-24">
        <div className="mx-auto max-w-3xl">
          {locale === "ja" ? <PrivacyJa /> : <PrivacyEn />}
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}

/* ────────────────────────────── Japanese ────────────────────────────── */

function PrivacyJa() {
  return (
    <>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">
        プライバシーポリシー
      </h1>
      <p className="mt-2 text-sm text-zinc-500">最終更新日: 2026年4月17日</p>

      <p className="mt-6 text-sm leading-relaxed text-zinc-400">
        やすい
        ともき（以下「当方」）は、AIモデルカスタマイズサービス「AIらくらくオーダーメイド」（以下「本サービス」）におけるユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
      </p>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        1. 収集する個人情報
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        当方は、本サービスの提供にあたり、以下の個人情報を収集することがあります。
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          <span className="text-zinc-300">アカウント情報</span>
          ：メールアドレス、認証情報（Supabase
          Authenticationを通じて取得）
        </li>
        <li>
          <span className="text-zinc-300">決済情報</span>
          ：クレジットカード情報はStripe株式会社が直接処理します。当方はカード番号等の決済情報を保持しません。Stripeから取引ID、決済ステータス、決済金額を受領します。
        </li>
        <li>
          <span className="text-zinc-300">利用データ</span>
          ：アクセスログ、IPアドレス、ブラウザの種類・バージョン、OS情報、リファラURL、ページ閲覧履歴、利用日時
        </li>
        <li>
          <span className="text-zinc-300">学習データ</span>
          ：ユーザーがアップロードしたファイル（テキスト、PDF等）および入力したURL
        </li>
        <li>
          <span className="text-zinc-300">お問い合わせ情報</span>
          ：お問い合わせ時に提供いただく氏名、メールアドレス、お問い合わせ内容
        </li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        2. 利用目的
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        収集した個人情報は、以下の目的で利用します。
      </p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>本サービスの提供、運営、維持</li>
        <li>ユーザー認証およびアカウント管理</li>
        <li>利用料金の決済処理</li>
        <li>ユーザーからのお問い合わせへの対応</li>
        <li>本サービスの改善、新機能の開発</li>
        <li>利用規約に違反する行為への対応</li>
        <li>本サービスに関する重要なお知らせの送信</li>
        <li>上記各利用目的に付随する目的</li>
      </ol>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        3. 第三者への提供
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        当方は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>ユーザーの同意がある場合</li>
        <li>法令に基づく場合（裁判所の命令、捜査機関からの要請等）</li>
        <li>
          人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難な場合
        </li>
        <li>
          本サービスの提供に必要な範囲で以下の業務委託先に提供する場合：
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            <li>
              <span className="text-zinc-300">Stripe株式会社</span>
              ：決済処理（
              <a
                href="https://stripe.com/jp/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline underline-offset-2"
              >
                Stripeプライバシーポリシー
              </a>
              ）
            </li>
            <li>
              <span className="text-zinc-300">Supabase Inc.</span>
              ：ユーザー認証・データベース管理（
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline underline-offset-2"
              >
                Supabaseプライバシーポリシー
              </a>
              ）
            </li>
            <li>
              <span className="text-zinc-300">クラウドGPUプロバイダ</span>
              ：AI学習処理の実行
            </li>
          </ul>
        </li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        4. 学習データの取扱い
      </h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          学習データは、本サービスにおけるAIモデルのファインチューニングにのみ使用されます。
        </li>
        <li>
          当方が学習データを、当方のAIモデルの改善やその他の目的で二次利用することはありません。
        </li>
        <li>
          学習データは、学習処理完了後30日以内に当方のサーバーから自動的に削除されます。
        </li>
        <li>
          ユーザーは、お問い合わせフォームまたはメールにより、学習データの即時削除を請求することができます。
        </li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        5. 安全管理措置
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        当方は、個人情報の漏洩、滅失または毀損を防止するため、以下の措置を講じています。
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>すべての通信におけるSSL/TLS暗号化</li>
        <li>データベースへのアクセス制御と認証</li>
        <li>定期的なセキュリティ評価と脆弱性対策</li>
        <li>個人情報への不正アクセス防止措置</li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        6. Cookieの使用
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        本サービスでは、以下の目的でCookieおよび類似技術を使用します。
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>ユーザーセッションの維持（ログイン状態の保持）</li>
        <li>言語設定の保持</li>
        <li>サービスの利用状況の分析・改善</li>
      </ul>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        ブラウザの設定によりCookieを無効にすることができますが、本サービスの一部機能が利用できなくなる場合があります。
      </p>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        7. ユーザーの権利
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        ユーザーは、当方に対し、以下の請求を行うことができます。メール（contact@ai-rakuraku.jp）にてお問い合わせください。合理的な期間内に対応いたします。
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>保有する個人情報の開示請求</li>
        <li>個人情報の内容が事実でない場合の訂正・追加・削除の請求</li>
        <li>個人情報の利用停止・消去の請求</li>
        <li>個人情報の第三者提供の停止の請求</li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        8. 個人情報の保存期間
      </h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>アカウント情報：アカウント削除後30日以内に削除</li>
        <li>決済記録：法令で定められた期間（最大7年間）保存</li>
        <li>学習データ：学習処理完了後30日以内に削除</li>
        <li>アクセスログ：取得から1年間保存</li>
        <li>お問い合わせ情報：対応完了後1年間保存</li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        9. お問い合わせ
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        本ポリシーに関するお問い合わせは、以下の連絡先までお願いいたします。
      </p>
      <p className="mt-2 text-sm text-zinc-400">
        メールアドレス：
        <a
          href="mailto:contact@ai-rakuraku.jp"
          className="text-blue-400 underline underline-offset-2"
        >
          contact@ai-rakuraku.jp
        </a>
      </p>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        10. プライバシーポリシーの改定
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          当方は、法令の変更、サービス内容の変更、その他の理由により、本ポリシーを改定することがあります。
        </li>
        <li>
          重要な変更がある場合は、本サービス上での掲示またはメールにより通知します。
        </li>
        <li>
          改定後に本サービスを利用した場合、ユーザーは改定後のポリシーに同意したものとみなします。
        </li>
      </ol>

      <p className="mt-8 text-xs text-zinc-600">制定日: 2026年4月17日</p>
    </>
  );
}

/* ────────────────────────────── English ─────────────────────────────── */

function PrivacyEn() {
  return (
    <>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-zinc-500">Last updated: April 17, 2026</p>

      <p className="mt-6 text-sm leading-relaxed text-zinc-400">
        Tomoki Yasui (&quot;Operator&quot;) establishes this Privacy Policy
        regarding the handling of users&apos; personal information in the AI
        model customization service &quot;AI Rakuraku Ordermade&quot;
        (&quot;Service&quot;).
      </p>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        1. Personal Information Collected
      </h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          <span className="text-zinc-300">Account information</span>: Email
          address and authentication data (collected through Supabase
          Authentication)
        </li>
        <li>
          <span className="text-zinc-300">Payment information</span>: Credit
          card data is processed directly by Stripe, Inc. The Operator does not
          store card numbers. We receive transaction IDs, payment status, and
          amounts from Stripe.
        </li>
        <li>
          <span className="text-zinc-300">Usage data</span>: Access logs, IP
          addresses, browser type/version, OS information, referrer URLs, page
          views, and timestamps
        </li>
        <li>
          <span className="text-zinc-300">Training Data</span>: Files uploaded
          by users (text, PDFs, etc.) and URLs entered for training
        </li>
        <li>
          <span className="text-zinc-300">Inquiry information</span>: Name,
          email address, and content provided through the contact form
        </li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        2. Purpose of Use
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>Providing, operating, and maintaining the Service</li>
        <li>User authentication and account management</li>
        <li>Processing payments</li>
        <li>Responding to user inquiries</li>
        <li>Improving the Service and developing new features</li>
        <li>Investigating violations of the Terms of Service</li>
        <li>Sending important notices about the Service</li>
        <li>Purposes incidental to the above</li>
      </ol>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        3. Third-Party Disclosure
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        The Operator will not disclose personal information to third parties
        except in the following cases:
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>With the user&apos;s consent</li>
        <li>
          When required by law (court orders, law enforcement requests, etc.)
        </li>
        <li>
          When necessary to protect life, body, or property and obtaining consent
          is difficult
        </li>
        <li>
          When shared with the following service providers to the extent
          necessary for the Service:
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            <li>
              <span className="text-zinc-300">Stripe, Inc.</span>: Payment
              processing (
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline underline-offset-2"
              >
                Stripe Privacy Policy
              </a>
              )
            </li>
            <li>
              <span className="text-zinc-300">Supabase Inc.</span>: User
              authentication and database management (
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline underline-offset-2"
              >
                Supabase Privacy Policy
              </a>
              )
            </li>
            <li>
              <span className="text-zinc-300">Cloud GPU provider</span>:
              Executing AI training processes
            </li>
          </ul>
        </li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        4. Handling of Training Data
      </h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          Training Data is used solely for fine-tuning AI models within the
          Service.
        </li>
        <li>
          The Operator will not reuse Training Data to improve its own AI models
          or for any other secondary purpose.
        </li>
        <li>
          Training Data is automatically deleted from our servers within 30 days
          after training completion.
        </li>
        <li>
          Users may request immediate deletion of their Training Data via the
          contact form or email.
        </li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        5. Security Measures
      </h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>SSL/TLS encryption for all communications</li>
        <li>Access control and authentication for databases</li>
        <li>Regular security assessments and vulnerability remediation</li>
        <li>Measures to prevent unauthorized access to personal information</li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        6. Use of Cookies
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        The Service uses cookies and similar technologies for:
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>Maintaining user sessions (keeping you logged in)</li>
        <li>Preserving language preferences</li>
        <li>Analyzing and improving service usage</li>
      </ul>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        You can disable cookies through your browser settings, but some features
        of the Service may become unavailable.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        7. Your Rights
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        You may make the following requests by contacting us at
        contact@ai-rakuraku.jp. We will respond within a reasonable timeframe.
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>Disclosure of personal information held about you</li>
        <li>
          Correction, addition, or deletion of inaccurate personal information
        </li>
        <li>Suspension or erasure of your personal information</li>
        <li>Cessation of third-party disclosure of your personal information</li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        8. Data Retention Periods
      </h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          Account information: Deleted within 30 days of account deletion
        </li>
        <li>
          Payment records: Retained for the legally required period (up to 7
          years)
        </li>
        <li>
          Training Data: Deleted within 30 days of training completion
        </li>
        <li>Access logs: Retained for 1 year from collection</li>
        <li>
          Inquiry information: Retained for 1 year after resolution
        </li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        9. Contact
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        For inquiries regarding this Privacy Policy, please contact us at:{" "}
        <a
          href="mailto:contact@ai-rakuraku.jp"
          className="text-blue-400 underline underline-offset-2"
        >
          contact@ai-rakuraku.jp
        </a>
      </p>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        10. Changes to This Policy
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          The Operator may revise this Policy due to changes in law, service
          modifications, or other reasons.
        </li>
        <li>
          Significant changes will be communicated via the Service or email.
        </li>
        <li>
          Continued use of the Service after a revision constitutes acceptance of
          the revised Policy.
        </li>
      </ol>

      <p className="mt-8 text-xs text-zinc-600">Effective: April 17, 2026</p>
    </>
  );
}
