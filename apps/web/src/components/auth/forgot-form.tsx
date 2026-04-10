"use client";

import { ErrorAlert } from "@/components/error-alert";
import { useLocale } from "@/lib/i18n";

interface ForgotFormProps {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  isLoading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  onNavigate: (view: string) => void;
}

export function ForgotForm({
  email,
  setEmail,
  isLoading,
  error,
  onSubmit,
  onNavigate,
}: ForgotFormProps) {
  const { t } = useLocale();
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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
          {t("login.forgot.title")}
        </h2>
        <p
          className="text-caption"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {t("login.forgot.description")}
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
          {t("login.email")}
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

      <ErrorAlert message={error} />

      <button
        type="submit"
        disabled={isLoading || !email}
        className="btn-primary"
        style={{ width: "100%" }}
      >
        {isLoading ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span className="spinner-apple" style={{ width: 16, height: 16, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
            {t("login.forgot.submitting")}
          </span>
        ) : (
          t("login.forgot.submit")
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
          {t("login.forgot.backToLogin")}
        </button>
      </div>
    </form>
  );
}
