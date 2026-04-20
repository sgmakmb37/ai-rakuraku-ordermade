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
      errorGeneric: "ログインに失敗しました。もう一度お試しください。",
      signup: {
        title: "アカウント作成",
        submit: "アカウントを作成",
        passwordConfirm: "パスワード確認",
        passwordHint: "6文字以上",
        loginLink: "ログインはこちら",
        errorMinLength: "パスワードは6文字以上で入力してください。",
        errorMismatch: "パスワードが一致しません。",
        errorGeneric: "アカウント作成に失敗しました。もう一度お試しください。",
      },
      verify: {
        title: "確認コードを入力",
        description: "に送信した6桁のコードを入力してください。",
        submit: "確認",
        submitting: "確認中...",
        resend: "コードを再送信",
        errorLength: "6桁のコードを入力してください。",
        errorGeneric: "確認に失敗しました。もう一度お試しください。",
        errorResend: "コードの再送信に失敗しました。",
      },
      forgot: {
        title: "パスワードをリセット",
        description:
          "登録されているメールアドレスを入力してください。リセットメールをお送りします。",
        submit: "リセットメールを送信",
        backToLogin: "ログインに戻る",
        errorGeneric: "リセットメールの送信に失敗しました。もう一度お試しください。",
      },
    },
    dashboard: {
      title: "プロジェクト",
      projectList: "プロジェクト一覧",
      newProject: "新規作成",
      limitReached: "上限に達しています",
      empty: "まだプロジェクトがありません",
      createFirst: "最初のプロジェクトを作成",
      created: "作成日",
      daysLeft: "{n}日",
      loggingOut: "ログアウト中...",
      errorFetch: "プロジェクトの取得に失敗しました",
      daysUntilDeletion: "{n}日",
      remainingDays: "残り日数",
      clickToView: "クリックして詳細を表示",
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
      processing: "処理中...",
      backToDashboard: "ダッシュボード",
      errorNotFound: "プロジェクトが見つかりません",
      errorFetch: "プロジェクトの取得に失敗しました",
      errorAddTraining: "追加学習の開始に失敗しました。もう一度お試しください。",
      resetSuccess: "プロジェクトをリセットしました",
      errorReset: "リセットに失敗しました",
      errorDownload: "ダウンロードに失敗しました",
      checkProgress: "進行状況確認",
      progress: "進行度",
      deleteProject: "削除",
      deleteConfirm: "このプロジェクトを削除する。元に戻せないが実行するか？",
      deleteSuccess: "プロジェクトを削除しました",
      errorDelete: "削除に失敗しました",
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
        start: "学習を開始する（880円・税込）",
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
      stepLabels: {
        modelSelect: "モデル選択",
        usageSetting: "用途設定",
        dataInput: "データ入力",
        confirmStart: "確認・開始",
      },
      genres: {
        customerSupport: "カスタマーサポート",
        internalKnowledge: "社内ナレッジ",
        writingSummary: "文章作成・要約",
        programmingAssist: "プログラミング補助",
        educationSupport: "教育・学習支援",
        other: "その他",
      },
      models: {
        qwen25_15b: { label: "Qwen 2.5 1.5B（軽量・高速）", desc: "小規模データ向け。レスポンスが速く、コスト効率が良い。" },
        qwen25_3b: { label: "Qwen 2.5 3B（バランス型）", desc: "中規模データ向け。精度と速度のバランスが良い。おすすめ。" },
        gemma4_e2b: { label: "Gemma 4 E2B（高精度）", desc: "Google製モデル。高い精度で複雑なタスクに対応。" },
        gemma4_e4b: { label: "Gemma 4 E4B（最高精度）", desc: "Google製最大モデル。最高精度だが、学習時間が長い。" },
      },
      fileTooLarge: "{name}のサイズが大きすぎます（5MB以下にしてください）",
      sourcesCount: "{n}件",
      charsCount: "{n}文字",
      notSelected: "未選択",
      noInput: "入力なし",
      dataSourceCount: "データソース数",
      errorGeneric: "エラーが発生しました。もう一度お試しください。",
    },
    performance: {
      title: "パフォーマンス監視",
      subtitle: "Core Web Vitals とページパフォーマンス指標",
      loading: "パフォーマンスデータを読み込み中...",
      coreWebVitals: "Core Web Vitals",
      otherMetrics: "その他の指標",
      samples: "{n} サンプル",
      tipsTitle: "パフォーマンス最適化のヒント",
      tipsLcp: "LCP: 画像最適化、フォント読み込み最適化、サーバーレスポンス時間改善",
      tipsFid: "FID: JavaScriptコード分割、非同期処理、Web Workers利用",
      tipsCls: "CLS: 画像・動画サイズ指定、フォント表示最適化、動的コンテンツの事前確保",
    },
    status: {
      created: "作成済み",
      training: "学習中",
      completed: "完了",
      failed: "失敗",
      success: "成功",
      queued: "待機中",
      running: "学習中",
      done: "完了",
      inProgress: "進行中",
      in_progress: "進行中",
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
      errorGeneric: "Login failed. Please try again.",
      signup: {
        title: "Create account",
        submit: "Create account",
        passwordConfirm: "Confirm password",
        passwordHint: "6 characters minimum",
        loginLink: "Log in instead",
        errorMinLength: "Password must be at least 6 characters.",
        errorMismatch: "Passwords do not match.",
        errorGeneric: "Account creation failed. Please try again.",
      },
      verify: {
        title: "Enter verification code",
        description: "Enter the 6-digit code sent to ",
        submit: "Verify",
        submitting: "Verifying...",
        resend: "Resend code",
        errorLength: "Please enter a 6-digit code.",
        errorGeneric: "Verification failed. Please try again.",
        errorResend: "Failed to resend code.",
      },
      forgot: {
        title: "Reset password",
        description: "Enter your email address. We'll send you a reset link.",
        submit: "Send reset email",
        backToLogin: "Back to login",
        errorGeneric: "Failed to send reset email. Please try again.",
      },
    },
    dashboard: {
      title: "Projects",
      projectList: "Projects",
      newProject: "New project",
      limitReached: "Limit reached",
      empty: "No projects yet",
      createFirst: "Create your first project",
      created: "Created",
      daysLeft: "{n} days",
      loggingOut: "Logging out...",
      errorFetch: "Failed to load projects",
      daysUntilDeletion: "{n} days",
      remainingDays: "Days left",
      clickToView: "Click to view details",
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
      processing: "Processing...",
      backToDashboard: "Dashboard",
      errorNotFound: "Project not found",
      errorFetch: "Failed to load project",
      errorAddTraining: "Failed to start training. Please try again.",
      resetSuccess: "Project has been reset",
      errorReset: "Failed to reset",
      errorDownload: "Failed to download",
      checkProgress: "Check Progress",
      progress: "Progress",
      deleteProject: "Delete",
      deleteConfirm: "Delete this project? This cannot be undone.",
      deleteSuccess: "Project deleted",
      errorDelete: "Failed to delete",
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
        start: "Start training (¥880 incl. tax)",
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
      stepLabels: {
        modelSelect: "Model",
        usageSetting: "Usage",
        dataInput: "Data",
        confirmStart: "Confirm",
      },
      genres: {
        customerSupport: "Customer support",
        internalKnowledge: "Internal knowledge",
        writingSummary: "Writing & summarization",
        programmingAssist: "Programming assistance",
        educationSupport: "Education & learning",
        other: "Other",
      },
      models: {
        qwen25_15b: { label: "Qwen 2.5 1.5B (Lightweight)", desc: "For small datasets. Fast response, cost-efficient." },
        qwen25_3b: { label: "Qwen 2.5 3B (Balanced)", desc: "For mid-size datasets. Good balance of accuracy and speed. Recommended." },
        gemma4_e2b: { label: "Gemma 4 E2B (High accuracy)", desc: "Google model. High accuracy for complex tasks." },
        gemma4_e4b: { label: "Gemma 4 E4B (Highest accuracy)", desc: "Google's largest model. Best accuracy but longer training time." },
      },
      fileTooLarge: "{name} is too large (max 5MB)",
      sourcesCount: "{n} sources",
      charsCount: "{n} chars",
      notSelected: "Not selected",
      noInput: "None",
      dataSourceCount: "Data sources",
      errorGeneric: "An error occurred. Please try again.",
    },
    performance: {
      title: "Performance Monitor",
      subtitle: "Core Web Vitals and page performance metrics",
      loading: "Loading performance data...",
      coreWebVitals: "Core Web Vitals",
      otherMetrics: "Other Metrics",
      samples: "{n} samples",
      tipsTitle: "Performance Optimization Tips",
      tipsLcp: "LCP: Optimize images, font loading, and server response time",
      tipsFid: "FID: Code splitting, async processing, Web Workers",
      tipsCls: "CLS: Set image/video dimensions, optimize font display, reserve space for dynamic content",
    },
    status: {
      created: "Created",
      training: "Training",
      completed: "Completed",
      failed: "Failed",
      success: "Success",
      queued: "Queued",
      running: "Training",
      done: "Completed",
      inProgress: "In progress",
      in_progress: "In progress",
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
    k in params && params[k] != null ? String(params[k]) : ""
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

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)locale=(\w+)/);
    const cookieLocale = match?.[1] as Locale | undefined;
    if (cookieLocale === "ja" || cookieLocale === "en") {
      setLocaleState(cookieLocale);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `locale=${next};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`;
    window.location.reload();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const t = useCallback(createT(locale), [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}
