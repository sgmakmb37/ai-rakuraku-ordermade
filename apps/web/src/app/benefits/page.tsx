import { cookies } from "next/headers";
import type { Locale } from "@/i18n/translations";
import { Header } from "@/components/lp/header";
import { Footer } from "@/components/lp/footer";
import { BenefitsContent } from "./benefits-content";

const content = {
  ja: {
    pageTitle: "ファインチューニングのメリット",
    section1Title: "なぜAIをファインチューニングするのか？",
    section2Title: "RAGなどとはどう違う？",
    ctaTitleLine1: "あなた専用のAIを、",
    ctaTitleLine2: "今すぐ作ろう",
    ctaSubtitle: "最初の一歩を踏み出そう。",
    ctaButton: "始める",
    exampleLabel: "例",
    readMore: "続きを見る",
    back: "戻る",
    section1: [
      {
        title: "1. 料金が大幅に安くなる",
        body: "ChatGPTやClaudeのような大きなAIサービスは、使うたびに料金がかかる。しかも高性能なモデルほど1回あたりの料金が高い。ファインチューニングでは、小さいモデルに「この作業だけは得意になれ」と教え込むことで、大きなモデルと同じくらいの精度を出せるようになる。結果として、同じような作業を繰り返す場面では料金が数十分の1〜数百分の1にまで下がることがある。使えば使うほど差が開くので、継続的にAIを使う場面では特に効果が大きい。",
        example:
          "毎日100件の問い合わせに自動応答するカスタマーサポート。大手AIサービスだと月数万円かかるが、自前モデルなら月数百円程度で済む。",
      },
      {
        title: "2. 反応が早い",
        body: "大きなモデルは賢いが、そのぶん処理に時間がかかる。ファインチューニングした小さいモデルは、得意な作業に限れば大きなモデルより圧倒的に反応が早い。チャットボット、音声アシスタント、リアルタイムで結果を返す必要があるアプリなど、「待たされると使いものにならない」場面で実用的な差が出る。ユーザー体験に直結する部分なので、サービスとして提供する場合は特に重要になる。",
        example:
          "ECサイトのチャットボット。お客さんが質問してから3秒待たされると離脱するが、0.5秒で返せれば購入につながる。",
      },
      {
        title: "3. 出力が安定する",
        body: "汎用AIに「こういう形式で答えて」と毎回お願いしても、返ってくる内容にばらつきが出る。同じ質問をしても、ある時はですます調、ある時はだ・である調になったり、フォーマットが微妙に変わったりする。ファインチューニングすると、決まった形式・トーン・判断基準をモデル自体が覚えるので、毎回安定した出力が返ってくるようになる。結果として「AIの出力を手作業で直す」「期待通りの出力が出るまでやり直す」という手間が大幅に減る。",
        example:
          "不動産サイトの物件紹介文を自動生成。毎回同じフォーマット（間取り→立地→おすすめポイント）で出力され、手直し不要になる。",
      },
      {
        title: "4. 自分のデータが外部に漏れない",
        body: "ChatGPTやClaudeなどの外部AIサービスを使うと、入力した内容はそのサービスの会社のサーバーに送信される。つまり、社内の機密情報、顧客データ、医療記録、法務文書などをAIに処理させたい場合、その内容が外部に出てしまうリスクがある。実際に「社内データをChatGPTに入力するの禁止」というルールを設けている企業は多い。ファインチューニングした自分専用のモデルを自分の環境で動かせば、データは一切外部に出ない。セキュリティやプライバシーの規制が厳しい業界（医療・金融・法務・官公庁など）では、これが「AIを使えるか使えないか」の分かれ目になることも多い。",
        example:
          "病院が患者のカルテをAIで要約したい。外部サービスには送れないが、院内サーバーの自前モデルなら安全に使える。",
      },
      {
        title: "5. 外部サービスに依存しない + 自前なら利用料が無料",
        body: "OpenAIやGoogleなどのAIサービスは、突然値上げされることがある。機能が変更されたり、最悪の場合サービス自体が終了する可能性もある。また、アクセスが集中すると「1分間に○回まで」という制限に引っかかって使えなくなることもある。ファインチューニングした自分専用モデルなら、これらの問題がすべてなくなる。自分のパソコンやサーバーで動かせば、インターネット接続すら不要で、オフライン環境でも使える。そして最大のポイントとして、自前の環境で動かせば利用料は一切かからない。GPUを搭載したパソコンが1台あれば、何回使っても追加料金ゼロで使い放題になる。初期のファインチューニング費用だけで、その後は永続的に無料で使える。",
        example:
          "個人開発者が自分のゲーミングPCでモデルを動かし、翻訳ツールを運用。月額料金ゼロで毎日何百回でも使い放題。",
      },
      {
        title: "6. 大量の作業を一気に処理できる",
        body: "同じGPU（AIの処理装置）を使った場合、小さいモデルのほうが一度に多くのリクエストをさばける。例えば、数千件の文書を分類する、大量のメールに自動返信する、といった「同じような作業を大量にこなす」場面では、小さいファインチューニング済みモデルのほうが処理速度・処理量ともに圧倒的に有利になる。大きなモデルでは数時間かかる作業が、数十分で終わることもある。",
        example:
          "通販サイトで毎晩1万件のレビューを「肯定・否定・中立」に自動分類。大型モデルだと8時間かかる処理が、専用モデルなら30分で完了。",
      },
    ],
    section2: [
      {
        title: '1. どの方法も「大きくて高いモデル」が裏で動いている',
        body: "GPTs（カスタムGPT）、RAG、詳しい指示文を書く方法——これらはすべて、裏側ではGPT-4やClaudeのような大型モデルがそのまま動いている。「専門家っぽく振る舞わせている」だけで、モデル自体は汎用のまま。そのため、使うたびに大型モデルの利用料がかかり続けるし、反応速度も大型モデルのまま遅い。ファインチューニングなら小さいモデルに専門性を持たせるので、料金は激減し、反応も速くなる。",
        example:
          "GPTsで作った社内FAQ専用ボット。便利だが、裏でGPT-4が動いているので月額利用料は変わらない。ファインチューニング済みの小型モデルなら、自前PCで無料で動かせる。",
      },
      {
        title: '2. 「参考資料を渡しているだけ」なので、本当の専門性ではない',
        body: "GPTsもRAGもプロンプトの工夫も、やっていることは「汎用AIに参考資料や指示書を毎回渡している」だけ。人間で言えば、素人にマニュアルを持たせて「これを見ながら答えて」と言っている状態。一方ファインチューニングは、その分野を実際に勉強させた状態。マニュアルを見ながら答える人と、その分野を理解している専門家では、判断の質・応用力・対応の柔軟さが根本的に違う。",
        example:
          "料理のレシピを渡された素人と、10年修行した料理人。レシピ通りの料理なら同じものが作れるが、「材料がないから代わりに何を使う？」と聞かれたとき、素人はレシピに書いてないから答えられない。",
      },
      {
        title: "3. 指示を詰め込むほど、AIは指示を無視しやすくなる",
        body: "GPTsやプロンプトで専門的な振る舞いをさせるには、大量の指示を書く必要がある。「この形式で答えて」「この用語を使って」「この判断基準に従って」「この例外に注意して」……。しかし、指示が増えるほどAIは一部を無視したり、優先順位を間違えたりする。これはモデルの仕様上避けられない。ファインチューニングなら、これらのルールがモデルの中に焼き込まれるので「忘れる」「無視する」ということが起きない。",
        example:
          "GPTsに30個のルールを設定した接客チャットボット。最初は完璧に動くが、会話が長くなると途中からルールを守らなくなり、禁止していたはずの表現を使い始める。",
      },
      {
        title: "4. 一度に読める情報量に上限がある",
        body: "すべての「モデルを変えない方法」は、情報をAIへの入力文に詰め込む仕組み。しかし、AIが一度に読める文章量には上限がある。専門分野の知識が膨大な場合、必要な情報をすべて渡しきれない。RAGで検索しても、関連する情報が100ページ分あれば全部は渡せない。ファインチューニングなら、どれだけ大量の知識でもモデルの中に学習させられるので、この上限の問題が存在しない。",
        example:
          "法律の全分野に対応する法務AIを作りたい。RAGで法律文書を検索しても、1回の質問で渡せるのは数ページ分。関連する判例や条文が50件あっても、数件しか参照できず、重要な情報を見落とす。",
      },
      {
        title: '5. 「話し方」「考え方」は情報を渡しても変わらない',
        body: "GPTsやRAGで渡せるのは「知識」や「ルール」であって、AIの思考パターンや表現スタイルそのものは変えられない。「うちの会社のベテラン社員のように答えて」と指示しても、実際のベテラン社員の判断の癖や言い回しは再現できない。ファインチューニングなら、実際のベテラン社員の対応例を学習させることで、判断の傾向や文体そのものをモデルに覚えさせられる。",
        example:
          "老舗旅館の予約対応AI。「丁寧に、和の雰囲気で」と指示しても、汎用AIの丁寧語は画一的。実際の女将の対応履歴を学習させたモデルなら、その旅館らしい独特の言い回しや気遣いが自然に出る。",
      },
      {
        title: "6. 外部サービスへの依存と情報漏洩の問題はそのまま残る",
        body: "GPTsはOpenAIのサービス。RAGも裏で外部AIを使う。どの方法でも、自分のデータが外部の会社に送られること、サービスが値上げ・終了するリスクがあること、ネット接続が必要なことは変わらない。ファインチューニングした自前モデルだけが、これらの問題をすべて解消できる。",
        example:
          "GPTsで作った社内ツールに全社員が依存していたが、OpenAIが突然APIの料金を2倍に値上げ。予算オーバーで使えなくなり、業務が止まる。自前モデルならこのリスクはゼロ。",
      },
    ],
  },
  en: {
    pageTitle: "Benefits of Fine-Tuning",
    section1Title: "Why fine-tune an AI model?",
    section2Title: "How does it compare to RAG?",
    ctaTitleLine1: "Build your custom AI",
    ctaTitleLine2: "right now",
    ctaSubtitle: "Take the first step.",
    ctaButton: "Start",
    exampleLabel: "Example",
    readMore: "Read more",
    back: "Back",
    section1: [
      {
        title: "1. Dramatically lower cost",
        body: "Large AI services like ChatGPT and Claude charge per use, and the more powerful the model, the higher the cost per request. With fine-tuning, you teach a small model to excel at a specific task, achieving accuracy comparable to large models. For repetitive tasks, costs can drop by 10x to 100x. The more you use it, the bigger the savings — making it especially effective for ongoing AI usage.",
        example:
          "Customer support auto-responding to 100 inquiries daily. Major AI services cost tens of thousands of yen per month, but a self-hosted model costs just a few hundred yen.",
      },
      {
        title: "2. Faster responses",
        body: "Large models are smart but slow. A fine-tuned small model is overwhelmingly faster than a large model on its specialized tasks. For chatbots, voice assistants, and real-time apps — scenarios where waiting makes the tool unusable — this speed difference is game-changing. Since it directly impacts user experience, it's especially important for production services.",
        example:
          "An e-commerce chatbot. If a customer waits 3 seconds for a reply, they leave. But if you can respond in 0.5 seconds, it leads to purchases.",
      },
      {
        title: "3. Consistent output",
        body: 'Even when you tell a general-purpose AI "respond in this format," the output varies. The same question might get a formal response one time and a casual one the next, with slightly different formatting each time. Fine-tuning makes the model internalize specific formats, tones, and criteria, producing stable output every time. This dramatically reduces the need to manually fix AI output or retry until you get the expected result.',
        example:
          "Auto-generating property listings for a real estate site. Every listing follows the same format (layout → location → highlights) with no manual fixes needed.",
      },
      {
        title: "4. Your data stays private",
        body: "When you use external AI services like ChatGPT or Claude, your input is sent to their servers. This means sensitive company data, customer information, medical records, or legal documents could be exposed externally. Many companies have already banned entering internal data into ChatGPT. Running your own fine-tuned model in your own environment means zero data leaves your infrastructure. In highly regulated industries (healthcare, finance, legal, government), this is often the deciding factor between being able to use AI or not.",
        example:
          "A hospital wants to summarize patient charts with AI. They can't send data to external services, but a self-hosted model on their internal server works safely.",
      },
      {
        title: "5. No vendor dependency + free to run",
        body: "AI services from OpenAI, Google, and others can raise prices unexpectedly. Features change, and in the worst case, the service itself may shut down. Usage limits can also block you during peak times. A fine-tuned model eliminates all of these problems. Run it on your own computer or server — no internet connection needed, works offline. The biggest point: running on your own hardware means zero usage fees. With one GPU-equipped computer, you can use it unlimited times with no additional charges. Just the initial fine-tuning cost, then it's free forever.",
        example:
          "An indie developer runs a translation tool on their gaming PC. Zero monthly fees, unlimited daily usage.",
      },
      {
        title: "6. Massive batch processing",
        body: "On the same GPU, smaller models can handle far more concurrent requests. For tasks like classifying thousands of documents or auto-replying to masses of emails — scenarios requiring high-volume repetitive processing — fine-tuned small models are overwhelmingly superior in both speed and throughput. Tasks that take hours on a large model can be completed in minutes.",
        example:
          "An online store auto-classifying 10,000 reviews nightly as positive/negative/neutral. An 8-hour job on a large model takes just 30 minutes on a specialized model.",
      },
    ],
    section2: [
      {
        title: "1. Every approach still runs a large, expensive model underneath",
        body: 'GPTs (Custom GPTs), RAG, detailed prompt engineering — all of these still run large models like GPT-4 or Claude under the hood. They just make the model "act like a specialist" while remaining a general-purpose model. Usage fees stay high, and response speed remains slow. Fine-tuning gives a small model genuine specialization, dramatically reducing both cost and latency.',
        example:
          "A company FAQ bot built with GPTs. Convenient, but GPT-4 runs underneath so monthly costs don't change. A fine-tuned small model can run for free on your own PC.",
      },
      {
        title: "2. Just passing reference material isn't real expertise",
        body: 'GPTs, RAG, and prompt engineering all do the same thing: pass reference materials and instructions to a general-purpose AI every time. It\'s like handing a manual to a novice and saying "answer based on this." Fine-tuning actually teaches the domain. The quality of judgment, adaptability, and flexibility between someone reading a manual and a trained expert are fundamentally different.',
        example:
          'A novice with a recipe vs. a chef with 10 years of training. Both can make the dish from the recipe, but when asked "what can I substitute for a missing ingredient?" — the novice can\'t answer because it\'s not in the recipe.',
      },
      {
        title: "3. More instructions = more the AI ignores them",
        body: 'Making an AI act specialized through GPTs or prompts requires writing extensive instructions: "use this format," "use these terms," "follow these criteria," "watch for these exceptions." But the more instructions you add, the more the AI ignores some or gets priorities wrong. This is an unavoidable limitation of how models work. Fine-tuning bakes these rules into the model itself, so "forgetting" or "ignoring" simply doesn\'t happen.',
        example:
          "A customer service chatbot with 30 rules set in GPTs. Works perfectly at first, but as conversations get longer, it starts breaking rules and using prohibited expressions.",
      },
      {
        title: "4. Hard limit on information processed at once",
        body: "Every approach that doesn't change the model works by stuffing information into the AI's input. But there's a maximum amount of text an AI can read at once. When domain knowledge is vast, you simply can't pass everything needed. Even with RAG searching, if there are 100 pages of relevant information, you can't include them all. Fine-tuning has no such limit — any amount of knowledge can be learned into the model.",
        example:
          "Building a legal AI covering all areas of law. RAG can only pass a few pages per query. Even with 50 relevant cases and statutes, only a handful can be referenced, missing critical information.",
      },
      {
        title: "5. You can't change how AI thinks or speaks by passing information",
        body: 'What GPTs and RAG can pass is "knowledge" and "rules" — not the AI\'s thinking patterns or expression style. Telling it to "respond like our veteran employee" won\'t reproduce that veteran\'s habits and phrasing. Fine-tuning lets you train on actual examples from that veteran, making the model internalize their judgment tendencies and writing style.',
        example:
          'A booking AI for a traditional Japanese inn. "Be polite, with a Japanese atmosphere" produces generic courtesy. Training on the actual proprietress\'s responses produces the inn\'s distinctive warmth naturally.',
      },
      {
        title: "6. Vendor dependency and data leakage problems remain",
        body: "GPTs is OpenAI's service. RAG still uses external AI underneath. With any of these methods, your data is sent to external companies, service price hikes or shutdowns remain a risk, and internet connection is required. Only a self-hosted fine-tuned model eliminates all of these problems.",
        example:
          "A company tool built on GPTs that all employees depend on. OpenAI suddenly doubles API pricing. Budget exceeded, tool becomes unusable, work stops. Zero risk with a self-hosted model.",
      },
    ],
  },
};

export default async function BenefitsPage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || "ja";

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen bg-zinc-950 pt-14 sm:pt-16">
        <BenefitsContent data={content[locale]} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
