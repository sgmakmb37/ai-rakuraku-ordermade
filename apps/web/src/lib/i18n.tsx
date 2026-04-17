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
      createAccount: "アカウントを作成",
      forgotPassword: "パスワードを忘れた方",
      terms: "ログインすることで、利用規約に同意したものとみなされます。",
      signup: {
        title: "アカウント作成",
        submit: "アカウントを作成",
        passwordConfirm: "パスワード確認",
        passwordHint: "6文字以上",
        loginLink: "ログインはこちら",
      },
      verify: {
        title: "確認コードを入力",
        description: "に送信した6桁のコードを入力してください。",
        submit: "確認",
        resend: "コードを再送信",
      },
      forgot: {
        title: "パスワードをリセット",
        description:
          "登録されているメールアドレスを入力してください。リセットメールをお送りします。",
        submit: "リセットメールを送信",
        backToLogin: "ログインに戻る",
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
    },
    detail: {
      addTraining: "追加学習",
      reset: "リセット",
      download: "ダウンロード",
      history: "学習履歴",
      version: "バージョン",
      date: "日時",
      status: "ステータス",
      genre: "ジャンル",
      createdDate: "作成日",
      daysLeft: "残り日数",
      purpose: "用途説明",
      resetConfirm: "現在の学習内容をリセットする。元に戻せないが実行するか？",
    },
    new: {
      backToDashboard: "ダッシュボードに戻る",
      step1: {
        title: "ステップ1: モデル選択",
        label: "学習に使用するモデルを選択してください",
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
        submit: "パスワードを更新",
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
      createAccount: "Create account",
      forgotPassword: "Forgot password?",
      terms: "By logging in, you agree to our Terms of Service.",
      signup: {
        title: "Create account",
        submit: "Create account",
        passwordConfirm: "Confirm password",
        passwordHint: "6 characters minimum",
        loginLink: "Log in instead",
      },
      verify: {
        title: "Enter verification code",
        description: "Enter the 6-digit code sent to ",
        submit: "Verify",
        resend: "Resend code",
      },
      forgot: {
        title: "Reset password",
        description: "Enter your email address. We'll send you a reset link.",
        submit: "Send reset email",
        backToLogin: "Back to login",
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
    },
    detail: {
      addTraining: "Add training",
      reset: "Reset",
      download: "Download",
      history: "Training history",
      version: "Version",
      date: "Date",
      status: "Status",
      genre: "Genre",
      createdDate: "Created",
      daysLeft: "Days left",
      purpose: "Purpose",
      resetConfirm: "Reset all training data? This cannot be undone.",
    },
    new: {
      backToDashboard: "Back to dashboard",
      step1: {
        title: "Step 1: Model selection",
        label: "Choose a model for training",
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
        submit: "Update password",
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
