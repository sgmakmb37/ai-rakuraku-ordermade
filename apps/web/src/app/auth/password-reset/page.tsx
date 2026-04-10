"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PasswordResetPage() {
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
      setError("パスワードは6文字以上で入力してください");
      return;
    }
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(
          error.message === "Auth session missing!"
            ? "リセットリンクの有効期限が切れました。もう一度パスワードリセットを申し込んでください。"
            : error.message
        );
      } else {
        setIsComplete(true);
      }
    } catch {
      setError("エラーが発生しました");
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
            パスワード更新完了
          </h1>
          <p
            className="text-caption"
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "2rem",
            }}
          >
            新しいパスワードが設定されました。
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-primary"
            style={{ width: "100%" }}
          >
            ダッシュボードへ
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
          新しいパスワード設定
        </h1>
        <p
          className="text-caption"
          style={{
            color: "var(--color-text-secondary)",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          新しいパスワードを入力してください。
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
              新しいパスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
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
              パスワード確認
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="もう一度入力"
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
                更新中...
              </span>
            ) : (
              "パスワードを更新"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
