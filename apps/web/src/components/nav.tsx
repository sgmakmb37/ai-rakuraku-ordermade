"use client";

import { useRouter } from "next/navigation";
import { Sun, Moon, LogOut, ChevronLeft, Globe } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useLocale } from "@/lib/i18n";

interface NavProps {
  /** Left side content: "back" shows ← back link, "brand" shows service name */
  left?: "back" | "brand";
  /** Right side: optional label text, logout button, dark mode toggle */
  rightLabel?: string;
  onLogout?: () => void;
  isLogoutLoading?: boolean;
}

export function Nav({ left = "brand", rightLabel, onLogout, isLogoutLoading }: NavProps) {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { locale, setLocale } = useLocale();

  return (
    <nav
      className="nav-glass"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 48,
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          width: "100%",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left */}
        {left === "back" ? (
          <button
            onClick={() => router.push("/dashboard")}
            className="text-caption"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-link)",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <ChevronLeft size={16} />
            <span>{locale === "en" ? "Back" : "戻る"}</span>
          </button>
        ) : (
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>
            {locale === "en" ? "AI Easy Ordermade" : "AIらくらくオーダーメイド"}
          </span>
        )}

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {rightLabel && (
            <span
              className="text-caption"
              style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}
            >
              {rightLabel}
            </span>
          )}

          <button
            onClick={() => setLocale(locale === "ja" ? "en" : "ja")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-tertiary)",
              padding: 4,
              display: "flex",
              alignItems: "center",
              gap: 3,
              borderRadius: 8,
              transition: "color 200ms",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
            aria-label="Toggle language"
          >
            <Globe size={14} />
            <span>{locale === "ja" ? "EN" : "JA"}</span>
          </button>

          <button
            onClick={toggle}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-tertiary)",
              padding: 4,
              display: "flex",
              alignItems: "center",
              borderRadius: 8,
              transition: "color 200ms",
            }}
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              disabled={isLogoutLoading}
              className="text-caption"
              style={{
                background: "none",
                border: "none",
                cursor: isLogoutLoading ? "not-allowed" : "pointer",
                color: "var(--color-text-tertiary)",
                opacity: isLogoutLoading ? 0.5 : 1,
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <LogOut size={14} />
              <span>{isLogoutLoading ? "..." : (locale === "en" ? "Logout" : "ログアウト")}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
