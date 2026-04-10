import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: 12,
        borderRadius: 8,
        background: "rgba(255, 59, 48, 0.08)",
      }}
    >
      <AlertCircle size={16} style={{ color: "var(--color-error)", flexShrink: 0, marginTop: 2 }} />
      <p className="text-caption" style={{ color: "var(--color-error)", margin: 0 }}>
        {message}
      </p>
    </div>
  );
}
