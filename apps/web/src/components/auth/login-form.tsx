"use client";

import { ErrorAlert } from "@/components/error-alert";

interface LoginFormProps {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  isLoading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  onNavigate: (view: string) => void;
}

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  error,
  onSubmit,
  onNavigate,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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

      <ErrorAlert message={error} />

      <button
        type="submit"
        disabled={isLoading || !email || !password}
        className="btn-primary"
        style={{ width: "100%" }}
      >
        {isLoading ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span className="spinner-apple" style={{ width: 16, height: 16, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
            ログイン中...
          </span>
        ) : (
          "ログイン"
        )}
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={() => onNavigate("signup")}
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
          onClick={() => onNavigate("forgot")}
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
  );
}
