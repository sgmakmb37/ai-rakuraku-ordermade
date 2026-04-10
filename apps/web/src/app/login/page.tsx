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
    <div
      className="animate-fade-in"
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "448px", padding: "0 1.5rem 3rem" }}>
        {/* Logo & Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--color-primary)",
                marginBottom: "1.25rem",
              }}
            >
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "-0.5px",
                }}
              >
                AI
              </span>
            </div>
          </div>
          <h1
            className="text-section"
            style={{
              color: "var(--color-text)",
              marginBottom: "0.5rem",
            }}
          >
            AIらくらく
            <br />
            オーダーメイド
          </h1>
          <p
            className="text-caption"
            style={{ color: "var(--color-text-secondary)" }}
          >
            誰でもAIをオーダーメイドできる
          </p>
        </div>

        {/* Card */}
        <div className="card-apple">
          {view === "login" && (
            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label
                  htmlFor="login-email"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.5rem",
                  }}
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
                  className="input-apple"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.5rem",
                  }}
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
                  className="input-apple"
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    background: "rgba(255, 59, 48, 0.1)",
                    color: "var(--color-error)",
                  }}
                >
                  <p style={{ fontSize: "14px", margin: 0 }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="btn-primary"
                style={{ width: "100%" }}
              >
                {isLoading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <span className="spinner-apple" />
                    ログイン中...
                  </span>
                ) : (
                  "ログイン"
                )}
              </button>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setView("signup");
                    setError("");
                    setEmail("");
                    setPassword("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "var(--color-link)",
                    textDecoration: "none",
                    padding: "4px 0",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
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
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "var(--color-link)",
                    textDecoration: "none",
                    padding: "4px 0",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  パスワードを忘れた方
                </button>
              </div>
            </form>
          )}

          {view === "signup" && (
            <form onSubmit={handleSignupSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label
                  htmlFor="signup-email"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.5rem",
                  }}
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
                  className="input-apple"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.5rem",
                  }}
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
                  className="input-apple"
                />
                <p
                  className="text-micro"
                  style={{ color: "var(--color-text-tertiary)", marginTop: "0.25rem" }}
                >
                  6文字以上
                </p>
              </div>

              <div>
                <label
                  htmlFor="signup-password-confirm"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.5rem",
                  }}
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
                  className="input-apple"
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    background: "rgba(255, 59, 48, 0.1)",
                    color: "var(--color-error)",
                  }}
                >
                  <p style={{ fontSize: "14px", margin: 0 }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email || !password || !passwordConfirm}
                className="btn-primary"
                style={{ width: "100%" }}
              >
                {isLoading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <span className="spinner-apple" />
                    作成中...
                  </span>
                ) : (
                  "アカウントを作成"
                )}
              </button>

              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setError("");
                    setEmail("");
                    setPassword("");
                    setPasswordConfirm("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "var(--color-link)",
                    textDecoration: "none",
                    padding: "4px 0",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  ログインはこちら
                </button>
              </div>
            </form>
          )}

          {view === "verify" && (
            <form onSubmit={handleVerifySubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                <h2
                  style={{
                    fontSize: "1.31rem",
                    fontWeight: 700,
                    color: "var(--color-text)",
                    marginBottom: "0.5rem",
                    lineHeight: 1.19,
                  }}
                >
                  確認コードを入力
                </h2>
                <p
                  className="text-caption"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {email}に送信した6桁のコードを入力してください。
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
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
                    style={{
                      width: "48px",
                      height: "56px",
                      textAlign: "center",
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      borderRadius: "11px",
                      border: "1px solid var(--color-input-border)",
                      background: "var(--color-input-bg)",
                      color: "var(--color-text)",
                      outline: "none",
                      transition: "border-color 200ms ease-in-out, box-shadow 200ms ease-in-out",
                      opacity: isLoading ? 0.42 : 1,
                      cursor: isLoading ? "not-allowed" : "text",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-primary)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 113, 227, 0.2)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-input-border)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                ))}
              </div>

              {error && (
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    background: "rgba(255, 59, 48, 0.1)",
                    color: "var(--color-error)",
                  }}
                >
                  <p style={{ fontSize: "14px", margin: 0 }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || code.some((c) => !c)}
                className="btn-primary"
                style={{ width: "100%" }}
              >
                {isLoading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <span className="spinner-apple" />
                    確認中...
                  </span>
                ) : (
                  "確認"
                )}
              </button>

              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    color: "var(--color-link)",
                    textDecoration: "none",
                    opacity: isLoading ? 0.42 : 1,
                    padding: "4px 0",
                  }}
                  onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.textDecoration = "underline"; }}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  コードを再送信
                </button>
              </div>
            </form>
          )}

          {view === "forgot" && (
            <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                <h2
                  style={{
                    fontSize: "1.31rem",
                    fontWeight: 700,
                    color: "var(--color-text)",
                    marginBottom: "0.5rem",
                    lineHeight: 1.19,
                  }}
                >
                  パスワードをリセット
                </h2>
                <p
                  className="text-caption"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  登録されているメールアドレスを入力してください。
                  <br />
                  リセットメールをお送りします。
                </p>
              </div>

              <div>
                <label
                  htmlFor="forgot-email"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.5rem",
                  }}
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
                  className="input-apple"
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    background: "rgba(255, 59, 48, 0.1)",
                    color: "var(--color-error)",
                  }}
                >
                  <p style={{ fontSize: "14px", margin: 0 }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="btn-primary"
                style={{ width: "100%" }}
              >
                {isLoading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <span className="spinner-apple" />
                    送信中...
                  </span>
                ) : (
                  "リセットメールを送信"
                )}
              </button>

              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setError("");
                    setEmail("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "var(--color-link)",
                    textDecoration: "none",
                    padding: "4px 0",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  ログインに戻る
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p
          className="text-micro"
          style={{
            textAlign: "center",
            color: "var(--color-text-tertiary)",
            marginTop: "2rem",
          }}
        >
          ログインすることで、
          <br />
          利用規約に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}
