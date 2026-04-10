"use client";

import { ErrorAlert } from "@/components/error-alert";

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
          確認コードを入力
        </h2>
        <p
          className="text-caption"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {email}に送信した6桁のコードを入力してください。
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
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
            style={{
              width: "48px",
              height: "56px",
              textAlign: "center",
              fontSize: "1.25rem",
              fontWeight: 600,
              borderRadius: "11px",
              border: "1px solid var(--color-input-border)",
              background: "var(--color-input-bg)",
              color: "var(--color-text)",
              outline: "none",
              transition: "border-color 200ms ease-in-out, box-shadow 200ms ease-in-out",
              opacity: isLoading ? 0.42 : 1,
              cursor: isLoading ? "not-allowed" : "text",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--color-primary)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 113, 227, 0.2)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--color-input-border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        ))}
      </div>

      <ErrorAlert message={error} />

      <button
        type="submit"
        disabled={isLoading || code.some((c) => !c)}
        className="btn-primary"
        style={{ width: "100%" }}
      >
        {isLoading ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span className="spinner-apple" style={{ width: 16, height: 16, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
            確認中...
          </span>
        ) : (
          "確認"
        )}
      </button>

      <div style={{ textAlign: "center" }}>
        <button
          type="button"
          onClick={onResend}
          disabled={isLoading}
          style={{
            background: "none",
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "14px",
            color: "var(--color-link)",
            textDecoration: "none",
            opacity: isLoading ? 0.42 : 1,
            padding: "4px 0",
          }}
          onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.textDecoration = "underline"; }}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          コードを再送信
        </button>
      </div>
    </form>
  );
}
