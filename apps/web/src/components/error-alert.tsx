"use client";

interface ErrorAlertProps {
  message?: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="error-alert">
      <div className="error-content">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="error-icon"
        >
          <path
            d="M8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M8 4V8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle
            cx="8"
            cy="11"
            r="0.75"
            fill="currentColor"
          />
        </svg>
        <span className="error-message">{message}</span>
      </div>

      <style jsx>{`
        .error-alert {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 12px 16px;
          margin: 8px 0;
        }

        .error-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .error-icon {
          color: #dc2626;
          flex-shrink: 0;
        }

        .error-message {
          color: #dc2626;
          font-size: 14px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}