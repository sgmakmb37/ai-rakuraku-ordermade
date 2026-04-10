"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n";

export default function AuthCodeErrorPage() {
  const { t } = useLocale();
  const router = useRouter();

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
          {t("auth.error.title")}
        </h1>
        <p
          className="text-caption"
          style={{
            color: "var(--color-text-secondary)",
            marginBottom: "2rem",
          }}
        >
          {t("auth.error.description")}
        </p>
        <button
          onClick={() => router.push("/login")}
          className="btn-primary"
          style={{ width: "100%" }}
        >
          {t("auth.error.backToLogin")}
        </button>
      </div>
    </div>
  );
}
