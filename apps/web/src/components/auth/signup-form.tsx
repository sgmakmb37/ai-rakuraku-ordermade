"use client";

import { ErrorAlert } from "@/components/error-alert";

interface SignupFormProps {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  passwordConfirm: string;
  setPasswordConfirm: (v: string) => void;
  isLoading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  onNavigate: (view: string) => void;
}

export function SignupForm({
  email,
  setEmail,
  password,
  setPassword,
  passwordConfirm,
  setPasswordConfirm,
  isLoading,
  error,
  onSubmit,
  onNavigate,
}: SignupFormProps) {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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

      <ErrorAlert message={error} />

      <button
        type="submit"
        disabled={isLoading || !email || !password || !passwordConfirm}
        className="btn-primary"
        style={{ width: "100%" }}
      >
        {isLoading ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span className="spinner-apple" style={{ width: 16, height: 16, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
            作成中...
          </span>
        ) : (
          "アカウントを作成"
        )}
      </button>

      <div style={{ textAlign: "center" }}>
        <button
          type="button"
          onClick={() => onNavigate("login")}
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
  );
}
