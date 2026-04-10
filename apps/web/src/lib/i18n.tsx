"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type Locale = "ja" | "en";

type TranslationKey = string; // dot-notation key

// ─────────────────────────────────────────────
// Dictionary
// ─────────────────────────────────────────────

export const translations = {
  ja: {
    common: {
      appName: "AIらくらくオーダーメイド",
      tagline: "誰でもAIをオーダーメイドできる",
      logout: "ログアウト",
      back: "戻る",
      loading: "読み込み中...",
      error: "エラー",
      retry: "リトライ",
    },
    login: {
      title: "ログイン",
      email: "メールアドレス",
      password: "パスワード",
      submit: "ログイン",
      submitting: "ログイン中...",
      createAccount: "アカウントを作成",
      forgotPassword: "パスワードを忘れた方",
      terms: "ログインすることで、利用規約に同意したものとみなされます。",
      errorGeneric: "ログインに失敗しました。もう一度お試しください。",
      signup: {
        title: "アカウント作成",
        submit: "アカウントを作成",
        submitting: "作成中...",
        passwordConfirm: "パスワード確認",
        passwordHint: "6文字以上",
        loginLink: "ログインはこちら",
        errorMinLength: "パスワードは6文字以上です。",
        errorMismatch: "パスワードが一致しません。",
        errorGeneric: "サインアップに失敗しました。もう一度お試しください。",
      },
      verify: {
        title: "確認コードを入力",
        description: "{email}に送信した6桁のコードを入力してください。",
        submit: "確認",
        submitting: "確認中...",
        resend: "コードを再送信",
        errorLength: "6桁のコードを入力してください。",
        errorGeneric: "コード検証に失敗しました。もう一度お試しください。",
        errorResend: "コード再送に失敗しました。もう一度お試しください。",
      },
      forgot: {
        title: "パスワードをリセット",
        description: "登録されているメールアドレスを入力してください。リセットメールをお送りします。",
        submit: "リセットメールを送信",
        submitting: "送信中...",
        backToLogin: "ログインに戻る",
        errorGeneric: "リセットメール送信に失敗しました。もう一度お試しください。",
      },
    },
    dashboard: {
      title: "プロジェクト",
      newProject: "新規作成",
      limitReached: "上限に達しています",
      empty: "まだプロジェクトがありません",
      createFirst: "最初のプロジェクトを作成",
      created: "作成日",
      daysLeft: "あと{n}日",
      fetchError: "プロジェクトの取得に失敗しました",
    },
    detail: {
      addTraining: "追加学習",
      reset: "リセット",
      download: "ダウンロード",
      history: "学習履歴",
      noHistory: "学習履歴がありません",
      version: "バージョン",
      date: "日時",
      status: "ステータス",
      genre: "ジャンル",
      createdDate: "作成日",
      daysLeft: "残り日数",
      daysLeftValue: "あと{n}日",
      purpose: "用途説明",
      processing: "処理中...",
      resetConfirm: "現在の学習内容をリセットする。元に戻せないが実行するか？",
      resetSuccess: "プロジェクトをリセットしました",
      notFound: "プロジェクトが見つかりません",
      backToDashboard: "ダッシュボードに戻る",
      errorAddTraining: "追加学習の開始に失敗しました。もう一度お試しください。",
      errorReset: "リセットに失敗しました",
      errorDownload: "ダウンロードに失敗しました",
    },
    new: {
      backToDashboard: "ダッシュボードに戻る",
      errorGeneric: "エラーが発生しました。もう一度お試しください。",
      fileTooLarge: "{name}は5MBを超えています",
      sourcesCount: "{n}件 / 5件",
      charsCount: "{n}文字 / 500,000文字",
      notSelected: "未選択",
      noInput: "入力なし",
      dataSourceCount: "データソース数",
      step1: {
        title: "ステップ1: モデル選択",
        label: "学習に使用するモデルを選択してください",
      },
      models: {
        "qwen2.5-1.5b": { label: "高速（軽量）- Qwen2.5 1.5B", desc: "軽量モデルは高速に学習できますが、精度は標準モデルより低い場合があります。日本語性能に強みがあります。" },
        "qwen2.5-3b": { label: "標準（高品質）- Qwen2.5 3B", desc: "標準モデルは高品質な学習が期待できます。日本語性能に強みがあります。学習時間が少し長くなります。" },
        "gemma-4-e2b": { label: "Google Gemma 4 E2B（軽量）", desc: "Gemma 4 E2B はGoogle製の最新軽量モデルです。2Bパラメータ相当で高速に学習できます。" },
        "gemma-4-e4b": { label: "Google Gemma 4 E4B（高品質）", desc: "Gemma 4 E4B はGoogle製の最新高品質モデルです。4Bパラメータ相当で、より精度の高い学習が期待できます。" },
      },
      step2: {
        title: "ステップ2: 用途設定",
        genre: "ジャンルを選択",
        genrePlaceholder: "選択してください",
        purpose: "用途説明（任意）",
        purposePlaceholder: "例：ECサイトの問い合わせ対応用",
      },
      step3: {
        title: "ステップ3: データ入力",
        urlLabel: "URLを追加（最大5件）",
        fileLabel: "ファイルをアップロード（.txt/.pdf/.csv/.json、最大5件）",
        dragDrop: "ドラッグ&ドロップまたはクリック",
        fileFormats: "対応形式: .txt, .pdf, .csv, .json",
        sources: "追加済みソース",
        charCount: "推定文字数",
      },
      step4: {
        title: "ステップ4: 確認・開始",
        model: "モデル",
        start: "学習を開始する（770円・税込）",
      },
      nav: {
        model: "モデル選択",
        usage: "用途設定",
        data: "データ入力",
        confirm: "確認・開始",
        back: "戻る",
        next: "次へ",
      },
      add: "追加",
      delete: "削除",
    },
    status: {
      created: "作成済み",
      training: "学習中",
      completed: "完了",
      failed: "失敗",
      success: "成功",
      inProgress: "進行中",
    },
    auth: {
      error: {
        title: "認証エラー",
        description: "認証処理に失敗しました。もう一度お試しください。",
        backToLogin: "ログイン画面に戻る",
      },
      reset: {
        title: "新しいパスワード設定",
        description: "新しいパスワードを入力してください。",
        newPassword: "新しいパスワード",
        confirmPassword: "パスワード確認",
        passwordPlaceholder: "6文字以上",
        confirmPlaceholder: "もう一度入力",
        submit: "パスワードを更新",
        submitting: "更新中...",
        errorMinLength: "パスワードは6文字以上で入力してください",
        errorMismatch: "パスワードが一致しません",
        errorExpired: "リセットリンクの有効期限が切れました。もう一度パスワードリセットを申し込んでください。",
        errorGeneric: "エラーが発生しました",
        complete: {
          title: "パスワード更新完了",
          description: "新しいパスワードが設定されました。",
          toDashboard: "ダッシュボードへ",
        },
      },
    },
    genres: {
      customerSupport: "カスタマーサポート",
      internalKnowledge: "社内ナレッジ",
      writing: "文章作成・要約",
      programming: "プログラミング補助",
      education: "教育・学習支援",
      other: "その他",
    },
  },

  en: {
    common: {
      appName: "AI Easy Ordermade",
      tagline: "Custom AI for everyone",
      logout: "Logout",
      back: "Back",
      loading: "Loading...",
      error: "Error",
      retry: "Retry",
    },
    login: {
      title: "Log in",
      email: "Email",
      password: "Password",
      submit: "Log in",
      submitting: "Logging in...",
      createAccount: "Create account",
      forgotPassword: "Forgot password?",
      terms: "By logging in, you agree to our Terms of Service.",
      errorGeneric: "Login failed. Please try again.",
      signup: {
        title: "Create account",
        submit: "Create account",
        submitting: "Creating...",
        passwordConfirm: "Confirm password",
        passwordHint: "6 characters minimum",
        loginLink: "Log in instead",
        errorMinLength: "Password must be at least 6 characters.",
        errorMismatch: "Passwords do not match.",
        errorGeneric: "Sign up failed. Please try again.",
      },
      verify: {
        title: "Enter verification code",
        description: "Enter the 6-digit code sent to {email}.",
        submit: "Verify",
        submitting: "Verifying...",
        resend: "Resend code",
        errorLength: "Please enter a 6-digit code.",
        errorGeneric: "Verification failed. Please try again.",
        errorResend: "Failed to resend code. Please try again.",
      },
      forgot: {
        title: "Reset password",
        description: "Enter your email address. We'll send you a reset link.",
        submit: "Send reset email",
        submitting: "Sending...",
        backToLogin: "Back to login",
        errorGeneric: "Failed to send reset email. Please try again.",
      },
    },
    dashboard: {
      title: "Projects",
      newProject: "New project",
      limitReached: "Limit reached",
      empty: "No projects yet",
      createFirst: "Create your first project",
      created: "Created",
      daysLeft: "{n} days left",
      fetchError: "Failed to load projects",
    },
    detail: {
      addTraining: "Add training",
      reset: "Reset",
      download: "Download",
      history: "Training history",
      noHistory: "No training history",
      version: "Version",
      date: "Date",
      status: "Status",
      genre: "Genre",
      createdDate: "Created",
      daysLeft: "Days left",
      daysLeftValue: "{n} days left",
      purpose: "Purpose",
      processing: "Processing...",
      resetConfirm: "Reset all training data? This cannot be undone.",
      resetSuccess: "Project has been reset",
      notFound: "Project not found",
      backToDashboard: "Back to dashboard",
      errorAddTraining: "Failed to start training. Please try again.",
      errorReset: "Reset failed",
      errorDownload: "Download failed",
    },
    new: {
      backToDashboard: "Back to dashboard",
      errorGeneric: "An error occurred. Please try again.",
      fileTooLarge: "{name} exceeds 5MB",
      sourcesCount: "{n} / 5",
      charsCount: "{n} / 500,000 characters",
      notSelected: "Not selected",
      noInput: "No input",
      dataSourceCount: "Data sources",
      step1: {
        title: "Step 1: Model selection",
        label: "Choose a model for training",
      },
      models: {
        "qwen2.5-1.5b": { label: "Fast (lightweight) - Qwen2.5 1.5B", desc: "The lightweight model trains faster but may be less accurate. Strong Japanese language performance." },
        "qwen2.5-3b": { label: "Standard (high quality) - Qwen2.5 3B", desc: "The standard model delivers higher quality training. Strong Japanese language performance. Training takes slightly longer." },
        "gemma-4-e2b": { label: "Google Gemma 4 E2B (lightweight)", desc: "Gemma 4 E2B is Google's latest lightweight model. Equivalent to 2B parameters for fast training." },
        "gemma-4-e4b": { label: "Google Gemma 4 E4B (high quality)", desc: "Gemma 4 E4B is Google's latest high-quality model. Equivalent to 4B parameters for more accurate training." },
      },
      step2: {
        title: "Step 2: Usage settings",
        genre: "Select genre",
        genrePlaceholder: "Select...",
        purpose: "Purpose (optional)",
        purposePlaceholder: "e.g. Customer support for e-commerce",
      },
      step3: {
        title: "Step 3: Data input",
        urlLabel: "Add URLs (max 5)",
        fileLabel: "Upload files (.txt/.pdf/.csv/.json, max 5)",
        dragDrop: "Drag & drop or click",
        fileFormats: "Formats: .txt, .pdf, .csv, .json",
        sources: "Added sources",
        charCount: "Estimated characters",
      },
      step4: {
        title: "Step 4: Confirm & start",
        model: "Model",
        start: "Start training (¥770 incl. tax)",
      },
      nav: {
        model: "Model",
        usage: "Usage",
        data: "Data",
        confirm: "Confirm",
        back: "Back",
        next: "Next",
      },
      add: "Add",
      delete: "Remove",
    },
    status: {
      created: "Created",
      training: "Training",
      completed: "Completed",
      failed: "Failed",
      success: "Success",
      inProgress: "In progress",
    },
    auth: {
      error: {
        title: "Authentication error",
        description: "Authentication failed. Please try again.",
        backToLogin: "Back to login",
      },
      reset: {
        title: "Set new password",
        description: "Enter your new password.",
        newPassword: "New password",
        confirmPassword: "Confirm password",
        passwordPlaceholder: "6+ characters",
        confirmPlaceholder: "Enter again",
        submit: "Update password",
        submitting: "Updating...",
        errorMinLength: "Password must be at least 6 characters",
        errorMismatch: "Passwords do not match",
        errorExpired: "Reset link has expired. Please request a new password reset.",
        errorGeneric: "An error occurred",
        complete: {
          title: "Password updated",
          description: "Your new password has been set.",
          toDashboard: "Go to dashboard",
        },
      },
    },
    genres: {
      customerSupport: "Customer support",
      internalKnowledge: "Internal knowledge",
      writing: "Writing & summarization",
      programming: "Programming assistance",
      education: "Education & learning",
      other: "Other",
    },
  },
} as const;

// ─────────────────────────────────────────────
// t() helper — dot-notation lookup + interpolation
// ─────────────────────────────────────────────

function getNestedValue(obj: Record<string, unknown>, key: string): string {
  const parts = key.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return key;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : key;
}

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in params ? String(params[k]) : `{${k}}`
  );
}

export function createT(locale: Locale) {
  return function t(key: TranslationKey, params?: Record<string, string | number>): string {
    const dict = translations[locale] as unknown as Record<string, unknown>;
    const raw = getNestedValue(dict, key);
    return params ? interpolate(raw, params) : raw;
  };
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ReturnType<typeof createT>;
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: "ja",
  setLocale: () => {},
  t: createT("ja"),
});

export function useLocale() {
  return useContext(LocaleContext);
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ja");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("locale") as Locale | null;
    if (stored === "ja" || stored === "en") {
      setLocaleState(stored);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", next);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const t = useCallback(createT(locale), [locale]);

  // Render children regardless of mount state to avoid layout shift.
  // Pre-mount renders with default "ja" locale (SSR-safe).
  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}
