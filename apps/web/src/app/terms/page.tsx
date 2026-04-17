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
        ? "Terms of Service | AI Rakuraku"
        : "利用規約 | AIらくらくオーダーメイド",
  };
}

export default async function TermsPage() {
  const c = await cookies();
  const locale = (c.get("locale")?.value as Locale) || "ja";

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen bg-zinc-950 px-5 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-24">
        <div className="mx-auto max-w-3xl">
          {locale === "ja" ? <TermsJa /> : <TermsEn />}
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}

/* ────────────────────────────── Japanese ────────────────────────────── */

function TermsJa() {
  return (
    <>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">利用規約</h1>
      <p className="mt-2 text-sm text-zinc-500">最終更新日: 2026年4月17日</p>

      <p className="mt-6 text-sm leading-relaxed text-zinc-400">
        この利用規約（以下「本規約」）は、やすい
        ともき（以下「当方」）が提供するAIモデルカスタマイズサービス「AIらくらくオーダーメイド」（以下「本サービス」）の利用条件を定めるものです。ユーザーの皆さま（以下「ユーザー」）には、本規約に同意いただいた上で、本サービスをご利用いただきます。
      </p>

      {/* 第1条 */}
      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        第1条（適用）
      </h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          本規約は、ユーザーと当方との間の本サービスの利用に関わる一切の関係に適用されます。
        </li>
        <li>
          当方が本サービス上で掲載する個別規定やガイドラインは、本規約の一部を構成するものとします。
        </li>
        <li>
          本規約と個別規定が矛盾する場合は、個別規定が優先するものとします。
        </li>
      </ul>

      {/* 第2条 */}
      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        第2条（定義）
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        本規約において、以下の用語は次の意味で使用します。
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          <span className="text-zinc-300">「本サービス」</span>
          ：当方が提供するAIモデルのファインチューニング（微調整）サービスおよび関連機能の総称
        </li>
        <li>
          <span className="text-zinc-300">「ユーザー」</span>
          ：本サービスに利用登録を行い、本サービスを利用する個人または法人
        </li>
        <li>
          <span className="text-zinc-300">「学習データ」</span>
          ：ユーザーが本サービスに提供するURL、テキスト、PDF等のデータ
        </li>
        <li>
          <span className="text-zinc-300">「生成物」</span>
          ：本サービスにより生成されるLoRAアダプタ等のAIモデルデータ
        </li>
      </ul>

      {/* 第3条 */}
      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        第3条（利用登録）
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          本サービスの利用にはアカウント登録が必要です。登録希望者は本規約に同意の上、当方所定の方法で登録申請を行うものとします。
        </li>
        <li>
          ユーザーは登録情報について、正確かつ最新の情報を提供する義務を負います。
        </li>
        <li>1人のユーザーにつき1つのアカウントに限ります。</li>
        <li>
          未成年者が本サービスを利用する場合は、法定代理人の同意を得た上で利用するものとします。
        </li>
        <li>
          当方は、以下の場合に登録を拒否することがあります。その理由について開示義務を負いません。
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            <li>虚偽の情報で申請した場合</li>
            <li>過去に本規約に違反したことがある場合</li>
            <li>その他、当方が不適当と判断した場合</li>
          </ul>
        </li>
      </ol>

      {/* 第4条 */}
      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        第4条（料金及び支払方法）
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          本サービスの利用料金は以下の通りです（すべて税込）。
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            <li>標準プラン：880円 / 回</li>
            <li>高速プラン：1,430円 / 回</li>
          </ul>
        </li>
        <li>
          支払方法はクレジットカード（Stripe株式会社の決済サービス経由）とします。
        </li>
        <li>決済完了後にAI学習処理を開始します。</li>
        <li>
          当方は、事前に通知の上、料金を変更することがあります。変更前に決済済みの取引には影響しません。
        </li>
      </ol>

      {/* 第5条 */}
      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        第5条（キャンセル・返金）
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          決済完了前であれば、ユーザーはいつでも注文をキャンセルできます。
        </li>
        <li>
          決済完了後は、理由の如何を問わず、キャンセルおよび返金には応じかねます。本サービスはデジタルコンテンツ（AIモデルの学習処理）を提供するものであり、決済完了と同時に処理が開始されるため、この点をご了承の上でご注文ください。
        </li>
        <li>
          ただし、当方の責めに帰すべき事由（システム障害等）により学習処理が正常に完了しなかった場合に限り、全額返金いたします。
        </li>
        <li>
          前項に基づく返金はStripe経由で決済されたクレジットカードに対して行います。返金処理には最大10営業日かかる場合があります。
        </li>
      </ol>

      {/* 第6条 */}
      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        第6条（知的財産権）
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          ユーザーが提供する学習データに関する知的財産権は、ユーザーまたは当該権利の正当な保有者に帰属します。
        </li>
        <li>
          本サービスにより生成された生成物（LoRAアダプタ）の利用権はユーザーに帰属します。ユーザーは生成物を商用・非商用を問わず自由に利用できます。
        </li>
        <li>
          ユーザーは、学習データについて必要な権利（著作権、利用許諾等）を正当に保有していることを保証するものとします。
        </li>
        <li>
          本サービスのソフトウェア、UI、デザイン、ロゴ等の知的財産権は当方に帰属します。
        </li>
        <li>
          当方は、ユーザーの学習データを本サービスの提供以外の目的で使用しません。
        </li>
      </ol>

      {/* 第7条 */}
      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        第7条（禁止事項）
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>法令または公序良俗に違反する行為</li>
        <li>犯罪行為に関連する行為</li>
        <li>
          第三者の著作権、商標権、プライバシー権その他の権利を侵害する学習データの提供
        </li>
        <li>
          違法、有害、脅迫的、虐待的、中傷的、名誉毀損的、わいせつ、暴力的なコンテンツの学習
        </li>
        <li>当方のサーバーまたはネットワークの機能を妨害する行為</li>
        <li>不正アクセスまたはそれを試みる行為</li>
        <li>他のユーザーの情報を収集する行為</li>
        <li>反社会的勢力に対する利益供与その他の協力行為</li>
        <li>第三者へのアカウントの譲渡・貸与</li>
        <li>本サービスの逆コンパイル、リバースエンジニアリング</li>
        <li>その他、当方が不適切と判断する行為</li>
      </ul>

      {/* 第8条 */}
      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        第8条（サービスの停止・中断）
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          当方は、以下の場合、事前の通知なく本サービスの全部または一部を停止・中断することがあります。
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            <li>システムの保守点検または更新を行う場合</li>
            <li>
              地震、落雷、火災、停電、天災等の不可抗力により提供が困難な場合
            </li>
            <li>コンピュータまたは通信回線等が障害により停止した場合</li>
            <li>その他、当方が停止を必要と判断した場合</li>
          </ul>
        </li>
        <li>
          当方は、本サービスの停止・中断によりユーザーまたは第三者に生じた損害について、当方に故意または重過失がある場合を除き、責任を負いません。
        </li>
      </ol>

      {/* 第9条 */}
      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        第9条（保証の制限及び免責）
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          本サービスは「現状有姿（as
          is）」で提供されます。当方は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、権利侵害等の欠陥を含む）がないことを保証しません。
        </li>
        <li>
          生成物（LoRAアダプタ）の品質、精度、性能について、当方は保証しません。生成物の利用は、ユーザーの責任において行うものとします。
        </li>
        <li>
          学習データの内容に起因して生じた損害について、当方は責任を負いません。
        </li>
        <li>
          GPU処理の中断、遅延、学習結果の予期しない品質等による損害について、当方は責任を負いません。
        </li>
        <li>
          当方がユーザーに対して損害賠償責任を負う場合、賠償額は当該損害の直接の原因となった本サービスの利用料金の額を上限とします。ただし、当方に故意または重過失がある場合はこの限りではありません。
        </li>
      </ol>

      {/* 第10条 */}
      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        第10条（利用制限及び登録抹消）
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          当方は、ユーザーが以下に該当する場合、事前の通知なく利用を制限し、またはアカウントを抹消することがあります。
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            <li>本規約に違反した場合</li>
            <li>登録情報に虚偽があることが判明した場合</li>
            <li>その他、当方が利用を適当でないと判断した場合</li>
          </ul>
        </li>
        <li>当方は、この判断について、理由を開示する義務を負いません。</li>
      </ol>

      {/* 第11条 */}
      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        第11条（退会）
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          ユーザーは、当方所定の手続きにより、いつでもアカウントを削除して退会することができます。
        </li>
        <li>
          退会後、ユーザーに関連する学習データおよび生成物は30日以内に削除されます。退会前に必要なデータのダウンロードを行ってください。
        </li>
        <li>
          退会により、未使用の利用権等がある場合でも、返金は行いません。
        </li>
      </ol>

      {/* 第12条 */}
      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        第12条（利用規約の変更）
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          当方は、必要と判断した場合、ユーザーへの事前の通知をもって本規約を変更できるものとします。
        </li>
        <li>
          変更後の規約は、本サービス上に掲示した時点から効力を生じるものとします。
        </li>
        <li>
          変更後に本サービスを利用した場合、ユーザーは変更後の規約に同意したものとみなします。
        </li>
      </ol>

      {/* 第13条 */}
      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        第13条（個人情報の取扱い）
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        本サービスにおける個人情報の取扱いについては、別途定める
        <a
          href="/privacy"
          className="text-blue-400 underline underline-offset-2"
        >
          プライバシーポリシー
        </a>
        に従うものとします。
      </p>

      {/* 第14条 */}
      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        第14条（通知）
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        当方からユーザーへの通知は、登録されたメールアドレスへのメール送信、または本サービス上での掲示により行うものとします。メール送信による通知は、当方がメールを送信した時点で到達したものとみなします。
      </p>

      {/* 第15条 */}
      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        第15条（権利義務の譲渡禁止）
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        ユーザーは、当方の書面による事前の承諾なく、本規約上の地位または本規約に基づく権利義務を第三者に譲渡し、または担保に供することはできません。
      </p>

      {/* 第16条 */}
      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        第16条（準拠法・裁判管轄）
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>本規約の解釈は、日本法を準拠法とします。</li>
        <li>
          本サービスに関して紛争が生じた場合、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
        </li>
      </ol>

      {/* 特定商取引法に基づく表記 */}
      <h2 className="mt-14 border-t border-white/[0.06] pt-10 text-lg font-semibold text-white sm:text-xl">
        特定商取引法に基づく表記
      </h2>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <Row label="事業者名" value="やすい ともき" />
            <Row
              label="所在地"
              value="請求があった場合に遅滞なく開示いたします"
            />
            <Row
              label="電話番号"
              value="請求があった場合に遅滞なく開示いたします"
            />
            <Row label="メールアドレス" value="contact@airakuraku.jp" />
            <Row
              label="販売価格"
              value="標準プラン: 880円/回、高速プラン: 1,430円/回（税込）"
            />
            <Row
              label="販売価格以外の必要料金"
              value="インターネット接続に必要な通信料等はユーザー負担"
            />
            <Row label="支払方法" value="クレジットカード（Stripe経由）" />
            <Row label="支払時期" value="注文確定時に即時決済" />
            <Row
              label="商品の引渡し時期"
              value="決済完了後、学習処理完了時にダウンロード可能（標準: 90〜120分、高速: 35〜55分）"
            />
            <Row
              label="返品・キャンセル"
              value="デジタルコンテンツの性質上、決済完了後のキャンセル・返金は不可。システム障害等による処理未完了の場合に限り全額返金。"
            />
            <Row
              label="動作環境"
              value="最新版のChrome、Safari、Edge、Firefox推奨。インターネット接続必須。"
            />
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-xs text-zinc-600">
        制定日: 2026年4月17日
      </p>
    </>
  );
}

/* ────────────────────────────── English ─────────────────────────────── */

function TermsEn() {
  return (
    <>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-zinc-500">Last updated: April 17, 2026</p>

      <p className="mt-6 text-sm leading-relaxed text-zinc-400">
        These Terms of Service (&quot;Terms&quot;) govern your use of the AI
        model customization service &quot;AI Rakuraku Ordermade&quot;
        (&quot;Service&quot;) operated by Tomoki Yasui (&quot;Operator&quot;).
        By using the Service, you agree to these Terms.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        1. Scope of Application
      </h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          These Terms apply to all aspects of the relationship between the user
          and the Operator regarding the Service.
        </li>
        <li>
          Any additional guidelines or policies posted on the Service form part
          of these Terms.
        </li>
        <li>
          In case of conflict between these Terms and individual policies, the
          individual policies shall prevail.
        </li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        2. Definitions
      </h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          <span className="text-zinc-300">&quot;Service&quot;</span>: The AI
          model fine-tuning service and all related features provided by the
          Operator.
        </li>
        <li>
          <span className="text-zinc-300">&quot;User&quot;</span>: Any
          individual or entity that registers for and uses the Service.
        </li>
        <li>
          <span className="text-zinc-300">&quot;Training Data&quot;</span>:
          URLs, text, PDFs, and other data provided by the User for model
          training.
        </li>
        <li>
          <span className="text-zinc-300">&quot;Output&quot;</span>: LoRA
          adapters and other AI model data generated by the Service.
        </li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        3. Registration
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>Account registration is required to use the Service.</li>
        <li>
          Users must provide accurate and up-to-date information during
          registration.
        </li>
        <li>Each user is limited to one account.</li>
        <li>
          Minors must obtain consent from a legal guardian before using the
          Service.
        </li>
        <li>
          The Operator may refuse registration without disclosing reasons if
          false information is provided, the applicant has previously violated
          these Terms, or for other reasons deemed appropriate.
        </li>
      </ol>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        4. Pricing and Payment
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          Service fees are as follows (all prices include tax):
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            <li>Standard Plan: ¥880 / $6 per run</li>
            <li>Fast Plan: ¥1,430 / $10 per run</li>
          </ul>
        </li>
        <li>Payment is accepted via credit card through Stripe.</li>
        <li>AI training begins after payment is confirmed.</li>
        <li>
          The Operator may change pricing with prior notice. Changes will not
          affect already completed transactions.
        </li>
      </ol>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        5. Cancellation and Refunds
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>Users may cancel an order before payment is completed.</li>
        <li>
          Once payment is completed, cancellations and refunds are not accepted
          regardless of the reason. The Service provides digital content (AI
          model training), and processing begins immediately upon payment. By
          placing an order, you acknowledge and agree to this policy.
        </li>
        <li>
          As an exception, if training fails to complete due to a system error
          on the Operator&apos;s side, a full refund will be issued.
        </li>
        <li>
          Refunds under the preceding clause are processed to the credit card
          used via Stripe and may take up to 10 business days.
        </li>
      </ol>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        6. Intellectual Property
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          Intellectual property rights in Training Data belong to the User or
          the rightful owner.
        </li>
        <li>
          The right to use Output (LoRA adapters) belongs to the User. Users may
          use Output freely for commercial and non-commercial purposes.
        </li>
        <li>
          Users warrant that they hold all necessary rights (copyright, licenses,
          etc.) to the Training Data they provide.
        </li>
        <li>
          Intellectual property rights in the Service&apos;s software, UI,
          design, and logos belong to the Operator.
        </li>
        <li>
          The Operator will not use Training Data for any purpose other than
          providing the Service.
        </li>
      </ol>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        7. Prohibited Activities
      </h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>Violating laws, regulations, or public order and morals</li>
        <li>Activities related to criminal conduct</li>
        <li>
          Providing Training Data that infringes on third-party copyrights,
          trademarks, privacy, or other rights
        </li>
        <li>
          Training on illegal, harmful, threatening, abusive, defamatory,
          obscene, or violent content
        </li>
        <li>Interfering with the Service&apos;s servers or network</li>
        <li>Unauthorized access or attempts thereof</li>
        <li>Collecting other users&apos; information</li>
        <li>Transferring or lending accounts to third parties</li>
        <li>Decompiling or reverse-engineering the Service</li>
        <li>Any other activity deemed inappropriate by the Operator</li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        8. Service Suspension
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          The Operator may suspend or interrupt the Service without prior notice
          for system maintenance, force majeure events, communication failures,
          or other reasons deemed necessary.
        </li>
        <li>
          The Operator shall not be liable for any damage caused by suspension,
          except in cases of willful misconduct or gross negligence.
        </li>
      </ol>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        9. Warranty Limitations and Disclaimers
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          The Service is provided &quot;as is.&quot; The Operator makes no
          warranties regarding safety, reliability, accuracy, completeness,
          fitness for a particular purpose, or non-infringement.
        </li>
        <li>
          The Operator does not guarantee the quality, accuracy, or performance
          of Output. Users use Output at their own risk.
        </li>
        <li>
          The Operator is not liable for damages arising from the content of
          Training Data.
        </li>
        <li>
          The Operator is not liable for damages caused by GPU processing
          interruptions, delays, or unexpected output quality.
        </li>
        <li>
          If the Operator is liable for damages, compensation shall be limited
          to the Service fee that directly caused the damage, except in cases of
          willful misconduct or gross negligence.
        </li>
      </ol>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        10. Account Restriction and Deletion
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        The Operator may restrict use or delete accounts without prior notice if
        a User violates these Terms, provides false registration information, or
        for other reasons deemed appropriate. The Operator is not obligated to
        disclose the reasons.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        11. Withdrawal
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>
          Users may delete their account and withdraw at any time through the
          designated procedure.
        </li>
        <li>
          Training Data and Output associated with the account will be deleted
          within 30 days of withdrawal. Please download any necessary data
          beforehand.
        </li>
        <li>No refunds will be issued upon withdrawal.</li>
      </ol>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        12. Changes to Terms
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        The Operator may modify these Terms with prior notice. Modified Terms
        take effect upon posting on the Service. Continued use of the Service
        after modification constitutes acceptance of the modified Terms.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        13. Personal Information
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        Handling of personal information is governed by our{" "}
        <a
          href="/privacy"
          className="text-blue-400 underline underline-offset-2"
        >
          Privacy Policy
        </a>
        .
      </p>

      <h2 className="mt-10 text-lg font-semibold text-white sm:text-xl">
        14. Governing Law and Jurisdiction
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400">
        <li>These Terms shall be governed by the laws of Japan.</li>
        <li>
          Any disputes arising from the Service shall be subject to the
          exclusive jurisdiction of the Tokyo District Court as the court of
          first instance.
        </li>
      </ol>

      {/* Specified Commercial Transactions Act */}
      <h2 className="mt-14 border-t border-white/[0.06] pt-10 text-lg font-semibold text-white sm:text-xl">
        Disclosure under the Specified Commercial Transactions Act (Japan)
      </h2>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <Row label="Operator" value="Tomoki Yasui" />
            <Row
              label="Address"
              value="Disclosed upon request without delay"
            />
            <Row label="Phone" value="Disclosed upon request without delay" />
            <Row label="Email" value="contact@airakuraku.jp" />
            <Row
              label="Pricing"
              value="Standard: ¥880 ($6) / run, Fast: ¥1,430 ($10) / run (tax included)"
            />
            <Row
              label="Additional costs"
              value="Internet connection fees are borne by the user"
            />
            <Row label="Payment method" value="Credit card (via Stripe)" />
            <Row label="Payment timing" value="Charged at order confirmation" />
            <Row
              label="Delivery"
              value="Available for download upon completion (Standard: 90–120 min, Fast: 35–55 min)"
            />
            <Row
              label="Returns / Cancellation"
              value="No cancellations or refunds after payment is completed (digital content). Full refund only if processing fails due to system error."
            />
            <Row
              label="System requirements"
              value="Latest Chrome, Safari, Edge, or Firefox. Internet connection required."
            />
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-xs text-zinc-600">Effective: April 17, 2026</p>
    </>
  );
}

/* ────────────────────────────── Shared ──────────────────────────────── */

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
