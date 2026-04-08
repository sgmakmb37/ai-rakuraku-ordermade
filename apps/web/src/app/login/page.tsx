"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthView = "login" | "signup" | "verify" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [code, setCode] = useState(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        router.refresh();
        router.push("/dashboard");
      }
    } catch {
      setError("ログインに失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("パスワードは6文字以上です。");
      return;
    }

    if (password !== passwordConfirm) {
      setError("パスワードが一致しません。");
      return;
    }

    setIsLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setView("verify");
        setPassword("");
        setPasswordConfirm("");
      }
    } catch {
      setError("サインアップに失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // 自動フォーカス移動
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const token = code.join("");
    if (token.length !== 6) {
      setError("6桁のコードを入力してください。");
      return;
    }

    setIsLoading(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (verifyError) {
        setError(verifyError.message);
      } else {
        router.refresh();
        router.push("/dashboard");
      }
    } catch {
      setError("コード検証に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setIsLoading(true);

    try {
      const { error: resendError } = await supabase.auth.resend({
        email,
        type: "signup",
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        setCode(Array(6).fill(""));
        codeInputRefs.current[0]?.focus();
      }
    } catch {
      setError("コード再送に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        });

      if (resetError) {
        setError(resetError.message);
      } else {
        setView("login");
        setEmail("");
      }
    } catch {
      setError("リセットメール送信に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view === "verify") {
      codeInputRefs.current[0]?.focus();
    }
  }, [view]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-indigo-900 dark:to-slate-900">
      <div className="w-full max-w-md px-6 py-12">
        {/* Logo & Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg mb-4">
              <span className="text-xl font-bold text-white">AI</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            AIらくらく
            <br />
            オーダーメイド
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 font-medium">
            誰でもAIをオーダーメイドできる
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          {view === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  メールアドレス
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  パスワード
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    ログイン中...
                  </span>
                ) : (
                  "ログイン"
                )}
              </button>

              <div className="flex flex-col gap-2 text-sm text-center">
                <button
                  type="button"
                  onClick={() => {
                    setView("signup");
                    setError("");
                    setEmail("");
                    setPassword("");
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  アカウントを作成
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView("forgot");
                    setError("");
                    setEmail("");
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  パスワードを忘れた方
                </button>
              </div>
            </form>
          )}

          {view === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  メールアドレス
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  パスワード
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  6文字以上
                </p>
              </div>

              <div>
                <label
                  htmlFor="signup-password-confirm"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  パスワード確認
                </label>
                <input
                  id="signup-password-confirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email || !password || !passwordConfirm}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    作成中...
                  </span>
                ) : (
                  "アカウントを作成"
                )}
              </button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setError("");
                    setEmail("");
                    setPassword("");
                    setPasswordConfirm("");
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  ログインはこちら
                </button>
              </div>
            </form>
          )}

          {view === "verify" && (
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  確認コードを入力
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {email}に送信した6桁のコードを入力してください。
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      codeInputRefs.current[index] = el;
                    }}
                    type="text"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    inputMode="numeric"
                    maxLength={1}
                    disabled={isLoading}
                    className="w-12 h-12 text-center text-lg font-semibold border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  />
                ))}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || code.some((c) => !c)}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    確認中...
                  </span>
                ) : (
                  "確認"
                )}
              </button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  コードを再送信
                </button>
              </div>
            </form>
          )}

          {view === "forgot" && (
            <form onSubmit={handleForgotSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  パスワードをリセット
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  登録されているメールアドレスを入力してください。
                  <br />
                  リセットメールをお送りします。
                </p>
              </div>

              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  メールアドレス
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    送信中...
                  </span>
                ) : (
                  "リセットメールを送信"
                )}
              </button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setError("");
                    setEmail("");
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  ログインに戻る
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
          ログインすることで、
          <br />
          利用規約に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}
