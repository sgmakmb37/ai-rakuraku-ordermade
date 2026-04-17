"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n";

export default function AuthCodeErrorPage() {
  const { t } = useLocale();
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm w-full max-w-[480px] text-center">
        <h1 className="text-white font-bold text-2xl mb-3">
          {t("auth.error.title")}
        </h1>
        <p className="text-sm text-zinc-400 mb-8">
          {t("auth.error.description")}
        </p>
        <button
          onClick={() => router.push("/login")}
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110"
        >
          {t("auth.error.backToLogin")}
        </button>
      </div>
    </div>
  );
}
