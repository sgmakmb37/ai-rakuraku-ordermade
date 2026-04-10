"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/lib/i18n";

export default function PasswordResetPage() {
  const { t } = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t("auth.reset.errorMinLength"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.reset.errorMismatch"));
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(
          error.message === "Auth session missing!"
            ? t("auth.reset.errorExpired")
            : error.message
        );
      } else {
        setIsComplete(true);
      }
    } catch {
      setError(t("auth.reset.errorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 animate-fade-in"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="card-apple w-full text-center" style={{ maxWidth: 480 }}>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 400,
              color: "var(--color-text-primary)",
              marginBottom: "0.75rem",
              letterSpacing: "-0.02em",
            }}
          >
            {t("auth.reset.complete.title")}
          </h1>
          <p
            className="text-caption"
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "2rem",
            }}
          >
            {t("auth.reset.complete.description")}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-primary"
            style={{ width: "100%" }}
          >
            {t("auth.reset.complete.toDashboard")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 animate-fade-in"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="card-apple w-full" style={{ maxWidth: 480 }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 400,
            color: "var(--color-text-primary)",
            marginBottom: "0.5rem",
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          {t("auth.reset.title")}
        </h1>
        <p
          className="text-caption"
          style={{
            color: "var(--color-text-secondary)",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          {t("auth.reset.description")}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--color-text-primary)",
                marginBottom: "0.375rem",
              }}
            >
              {t("auth.reset.newPassword")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.reset.passwordPlaceholder")}
              required
              className="input-apple"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--color-text-primary)",
                marginBottom: "0.375rem",
              }}
            >
              {t("auth.reset.confirmPassword")}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("auth.reset.confirmPlaceholder")}
              required
              className="input-apple"
              style={{ width: "100%" }}
            />
          </div>

          {error && (
            <p
              className="text-caption"
              style={{ color: "var(--color-error)" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: "100%", marginTop: "0.5rem", opacity: isLoading ? 0.6 : 1 }}
          >
            {isLoading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span className="spinner-apple" />
                {t("auth.reset.submitting")}
              </span>
            ) : (
              t("auth.reset.submit")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
