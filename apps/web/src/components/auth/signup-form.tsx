"use client";

import { ErrorAlert } from "@/components/error-alert";
import { useLocale } from "@/lib/i18n";

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
}: SignupFormProps) {
  const { t } = useLocale();
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <label
          htmlFor="signup-email"
          className="block text-xs font-medium text-zinc-500 mb-1.5"
        >
          {t("login.email")}
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={isLoading}
          className="w-full bg-transparent text-sm text-white placeholder-zinc-600 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <label
          htmlFor="signup-password"
          className="block text-xs font-medium text-zinc-500 mb-1.5"
        >
          {t("login.password")}
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={isLoading}
          className="w-full bg-transparent text-sm text-white placeholder-zinc-600 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-zinc-600 mt-1.5">
          {t("login.signup.passwordHint")}
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <label
          htmlFor="signup-password-confirm"
          className="block text-xs font-medium text-zinc-500 mb-1.5"
        >
          {t("login.signup.passwordConfirm")}
        </label>
        <input
          id="signup-password-confirm"
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="••••••••"
          required
          disabled={isLoading}
          className="w-full bg-transparent text-sm text-white placeholder-zinc-600 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <ErrorAlert message={error} />

      <button
        type="submit"
        disabled={isLoading || !email || !password || !passwordConfirm}
        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </span>
        ) : (
          t("login.signup.submit")
        )}
      </button>
    </form>
  );
}
