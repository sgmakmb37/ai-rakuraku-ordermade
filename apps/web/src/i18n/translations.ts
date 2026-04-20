export type Locale = "ja" | "en";

export const translations = {
  ja: {
    header: {
      brand: "AIらくらくオーダーメイド",
      nav: {
        features: "特徴",
        howItWorks: "使い方",
        pricing: "料金",
        faq: "FAQ",
      },
      login: "ログイン",
      cta: "今すぐ始める",
    },
    hero: {
      badge: "AI初心者でも、すぐ使える",
      titleLine1: "簡単にAIを",
      titleLine2: "オーダーメイド",
      subtitleLine1: "専門知識なし、GPU不要、UI操作だけ。",
      subtitleLine2: "専用のAIモデルを作れるサービス。",
      ctaPrimary: "始める",
      ctaSecondary: "使い方を見る",
      stat1: { value: "880", unit: "円〜", label: "1回あたり" },
      stat2: { value: "4", unit: "ステップ", label: "で完結" },
      stat3: { value: "GPU", unit: "不要", label: "クラウド処理" },
    },
    features: {
      label: "Features",
      title: "このサービスの特徴",
      items: [
        {
          title: "専門知識ゼロでOK",
          description:
            "モデル選択・学習設定はすべて自動化。AI初心者でも迷わず使える。",
        },
        {
          title: "低コスト、高品質",
          description:
            "1回880円から。高額なGPU環境を用意する必要なし。クラウドで完結。",
        },
        {
          title: "シンプルな操作",
          description:
            "モデル選択→データ入力→学習→ダウンロード。4ステップで完結。",
        },
      ],
    },
    howItWorks: {
      label: "How it works",
      title: "使い方",
      steps: [
        {
          title: "モデルを選ぶ",
          description:
            "Qwen2.5やGemma 4など、4つのモデルから用途に合わせて選択。",
        },
        {
          title: "データを入力",
          description:
            "URLの入力やファイルアップロード。一回当たり最大5件、50万文字まで対応。",
        },
        {
          title: "学習を開始",
          description:
            "ボタンひとつで自動学習。クラウドGPUが処理するので、あなたのPCに負担なし。",
        },
        {
          title: "ダウンロード",
          description:
            "カスタマイズ済みのAIモデルをすぐにダウンロードして利用。",
        },
      ],
    },
    pricing: {
      label: "Pricing",
      title: "料金",
      subtitle: "回数課金。使った分だけ。月額料金なし。",
      cta: "始める",
      plans: [
        {
          name: "スタンダード",
          price: "880",
          currency: "¥",
          priceSuffix: "/ 回（税込）",
          secondaryPrice: "$6 USD",
          description: "あなた専用のAIを手軽に作れる",
          badge: null as string | null,
          features: [
            "全モデル選択可能",
            "URL・ファイル最大5件",
            "50万文字まで",
            "クラウドGPU処理",
            "LoRAアダプタダウンロード",
          ],
          primary: true,
        },
      ],
    },
    benefits: {
      label: "Benefits",
      title: "AIをファインチューニングするメリット",
      subtitle: "ファインチューニングだけの合理的なメリット",
      cta: "詳しく見てみる",
    },
    faq: {
      label: "FAQ",
      title: "よくある質問",
      items: [
        {
          question: "AIの知識がなくても使えますか？",
          answer:
            "はい。モデル選択から学習まですべて自動化されています。UI操作だけで完結します。",
        },
        {
          question: "どんなデータを学習させられますか？",
          answer:
            "URLの入力やファイルアップロードに対応しています。テキストデータやPDFを学習に使えます。",
        },
        {
          question: "学習にどれくらい時間がかかりますか？",
          answer:
            "データ量やモデルによって異なりますが、クラウドGPUが自動で処理します。完了したらダッシュボードで確認できます。",
        },
        {
          question: "作成したAIモデルはどう使えますか？",
          answer:
            "LoRAアダプタとしてダウンロードできます。お手持ちの環境で自由にご利用いただけます。",
        },
        {
          question: "追加学習はできますか？",
          answer:
            "はい。前回の学習結果に追加で学習させることができます。リセット機能もあります。",
        },
      ],
    },
    ctaSection: {
      titleLine1: "あなた専用のAIを、",
      titleLine2: "今すぐ作ろう",
      subtitle: "最初の一歩を踏み出そう。",
      button: "始める",
    },
    footer: {
      brand: "AIらくらくオーダーメイド",
      tokushoho: "特定商取引法に基づく表記",
      terms: "利用規約",
      privacy: "プライバシーポリシー",
      contact: "お問い合わせ",
      copyright: "AIらくらくオーダーメイド",
    },
  },
  en: {
    header: {
      brand: "AI Rakuraku",
      nav: {
        features: "Features",
        howItWorks: "How it works",
        pricing: "Pricing",
        faq: "FAQ",
      },
      login: "Log in",
      cta: "Get started",
    },
    hero: {
      badge: "Easy for AI beginners",
      titleLine1: "Easy custom AI",
      titleLine2: "made to order",
      subtitleLine1: "No expertise needed. No GPU required. Just a simple UI.",
      subtitleLine2: "Build a custom AI model with ease.",
      ctaPrimary: "Start",
      ctaSecondary: "See how it works",
      stat1: { value: "$6", unit: "+", label: "per run" },
      stat2: { value: "4", unit: "steps", label: "to complete" },
      stat3: { value: "Zero", unit: "GPU", label: "Cloud-powered" },
    },
    features: {
      label: "Features",
      title: "What makes this service unique",
      items: [
        {
          title: "Zero expertise needed",
          description:
            "Model selection and training are fully automated. Anyone can use it, even without AI knowledge.",
        },
        {
          title: "Low cost, high quality",
          description:
            "Starting at $6 per run. No expensive GPU setup required. Everything runs in the cloud.",
        },
        {
          title: "Simple workflow",
          description:
            "Select model → Input data → Train → Download. Done in just 4 steps.",
        },
      ],
    },
    howItWorks: {
      label: "How it works",
      title: "How it works",
      steps: [
        {
          title: "Choose a model",
          description:
            "Pick from 4 models including Qwen2.5 and Gemma 4, tailored to your use case.",
        },
        {
          title: "Input your data",
          description:
            "Enter URLs or upload files. Up to 5 sources and 500K characters per run.",
        },
        {
          title: "Start training",
          description:
            "One click to start. Cloud GPUs handle everything — no load on your machine.",
        },
        {
          title: "Download",
          description:
            "Download your customized AI model and start using it right away.",
        },
      ],
    },
    pricing: {
      label: "Pricing",
      title: "Pricing",
      subtitle: "Pay per run. No monthly fees.",
      cta: "Get started",
      plans: [
        {
          name: "Standard",
          price: "6",
          currency: "$",
          priceSuffix: "/ run",
          secondaryPrice: "¥880 JPY",
          description: "Create your custom AI easily",
          badge: null as string | null,
          features: [
            "All models available",
            "Up to 5 URLs/files",
            "Up to 500K characters",
            "Cloud GPU processing",
            "LoRA adapter download",
          ],
          primary: true,
        },
      ],
    },
    benefits: {
      label: "Benefits",
      title: "Benefits of AI fine-tuning",
      subtitle: "Rational advantages unique to fine-tuning",
      cta: "Learn more",
    },
    faq: {
      label: "FAQ",
      title: "Frequently asked questions",
      items: [
        {
          question: "Can I use it without AI knowledge?",
          answer:
            "Yes. Everything from model selection to training is automated. You only need to interact with the UI.",
        },
        {
          question: "What kind of data can I train with?",
          answer:
            "You can enter URLs or upload files. Text data and PDFs are supported for training.",
        },
        {
          question: "How long does training take?",
          answer:
            "It varies depending on data size and model, but cloud GPUs handle everything automatically. You can check the status on your dashboard.",
        },
        {
          question: "How can I use my trained model?",
          answer:
            "Download it as a LoRA adapter. You can use it freely in your own environment.",
        },
        {
          question: "Can I do additional training?",
          answer:
            "Yes. You can train on top of previous results. A reset option is also available.",
        },
      ],
    },
    ctaSection: {
      titleLine1: "Build your custom AI",
      titleLine2: "right now",
      subtitle: "Take the first step.",
      button: "Start",
    },
    footer: {
      brand: "AI Rakuraku",
      tokushoho: "Commercial Transactions Act",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      contact: "Contact",
      copyright: "AI Rakuraku",
    },
  },
} as const;

export function t(locale: Locale) {
  return translations[locale];
}
