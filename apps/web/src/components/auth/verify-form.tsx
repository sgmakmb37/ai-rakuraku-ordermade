"use client";

import { ErrorAlert } from "@/components/error-alert";
import { useLocale } from "@/lib/i18n";

interface VerifyFormProps {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  isLoading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  onNavigate: (view: string) => void;
  code: string[];
  setCode: (code: string[]) => void;
  codeInputRefs: React.RefObject<(HTMLInputElement | null)[]>;
  onCodeChange: (index: number, value: string) => void;
  onCodeKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onResend: () => void;
}

export function VerifyForm({
  email,
  isLoading,
  error,
  onSubmit,
  code,
  codeInputRefs,
  onCodeChange,
  onCodeKeyDown,
  onResend,
}: VerifyFormProps) {
  const { t } = useLocale();
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <h2 className="text-white font-bold text-xl mb-2">
          {t("login.verify.title")}
        </h2>
        <p className="text-sm text-zinc-400">
          {t("login.verify.description", { email })}
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
            onChange={(e) => onCodeChange(index, e.target.value)}
            onKeyDown={(e) => onCodeKeyDown(index, e)}
            inputMode="numeric"
            maxLength={1}
            disabled={isLoading}
            className="w-12 h-14 text-center text-xl font-semibold rounded-lg border border-white/[0.08] bg-white/[0.03] text-white outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ))}
      </div>

      <ErrorAlert message={error} />

      <button
        type="submit"
        disabled={isLoading || code.some((c) => !c)}
        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            {t("login.verify.submitting")}
          </span>
        ) : (
          t("login.verify.submit")
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onResend}
          disabled={isLoading}
          className="text-sm text-blue-400 cursor-pointer transition-colors hover:text-blue-300 bg-transparent border-none p-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("login.verify.resend")}
        </button>
      </div>
    </form>
  );
}
