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
      <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm w-full max-w-[480px] text-center">
          <h1 className="text-white font-bold text-2xl mb-3">
            {t("auth.reset.complete.title")}
          </h1>
          <p className="text-sm text-zinc-400 mb-8">
            {t("auth.reset.complete.description")}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110"
          >
            {t("auth.reset.complete.toDashboard")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm w-full max-w-[480px]">
        <h1 className="text-white font-bold text-2xl text-center mb-2">
          {t("auth.reset.title")}
        </h1>
        <p className="text-sm text-zinc-400 text-center mb-8">
          {t("auth.reset.description")}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              {t("auth.reset.newPassword")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.reset.passwordPlaceholder")}
              required
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              {t("auth.reset.confirmPassword")}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("auth.reset.confirmPlaceholder")}
              required
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
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
