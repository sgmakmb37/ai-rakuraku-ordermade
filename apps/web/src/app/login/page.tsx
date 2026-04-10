"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/lib/i18n";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { VerifyForm } from "@/components/auth/verify-form";
import { ForgotForm } from "@/components/auth/forgot-form";

type AuthView = "login" | "signup" | "verify" | "forgot";

export default function LoginPage() {
  const { t } = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [code, setCode] = useState(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleNavigate = (nextView: string) => {
    setError("");
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setView(nextView as AuthView);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        router.refresh();
        router.push("/dashboard");
      }
    } catch {
      setError(t("login.errorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t("login.signup.errorMinLength"));
      return;
    }

    if (password !== passwordConfirm) {
      setError(t("login.signup.errorMismatch"));
      return;
    }

    setIsLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setView("verify");
        setPassword("");
        setPasswordConfirm("");
      }
    } catch {
      setError(t("login.signup.errorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const token = code.join("");
    if (token.length !== 6) {
      setError(t("login.verify.errorLength"));
      return;
    }

    setIsLoading(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (verifyError) {
        setError(verifyError.message);
      } else {
        router.refresh();
        router.push("/dashboard");
      }
    } catch {
      setError(t("login.verify.errorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setIsLoading(true);

    try {
      const { error: resendError } = await supabase.auth.resend({
        email,
        type: "signup",
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        setCode(Array(6).fill(""));
        codeInputRefs.current[0]?.focus();
      }
    } catch {
      setError(t("login.verify.errorResend"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        });

      if (resetError) {
        setError(resetError.message);
      } else {
        setView("login");
        setEmail("");
      }
    } catch {
      setError(t("login.forgot.errorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view === "verify") {
      codeInputRefs.current[0]?.focus();
    }
  }, [view]);

  const commonProps = { email, setEmail, password, setPassword, isLoading, error };

  return (
    <div
      className="animate-fade-in"
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "448px", padding: "0 1.5rem 3rem" }}>
        {/* Logo & Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--color-primary)",
                marginBottom: "1.25rem",
              }}
            >
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "-0.5px",
                }}
              >
                AI
              </span>
            </div>
          </div>
          <h1
            className="text-section"
            style={{
              color: "var(--color-text)",
              marginBottom: "0.5rem",
            }}
          >
            {t("common.appName")}
          </h1>
          <p
            className="text-caption"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {t("common.tagline")}
          </p>
        </div>

        {/* Card */}
        <div className="card-apple">
          {view === "login" && (
            <LoginForm
              {...commonProps}
              onSubmit={handleLoginSubmit}
              onNavigate={handleNavigate}
            />
          )}
          {view === "signup" && (
            <SignupForm
              {...commonProps}
              passwordConfirm={passwordConfirm}
              setPasswordConfirm={setPasswordConfirm}
              onSubmit={handleSignupSubmit}
              onNavigate={handleNavigate}
            />
          )}
          {view === "verify" && (
            <VerifyForm
              {...commonProps}
              onSubmit={handleVerifySubmit}
              onNavigate={handleNavigate}
              code={code}
              setCode={setCode}
              codeInputRefs={codeInputRefs}
              onCodeChange={handleCodeChange}
              onCodeKeyDown={handleCodeKeyDown}
              onResend={handleResendCode}
            />
          )}
          {view === "forgot" && (
            <ForgotForm
              {...commonProps}
              onSubmit={handleForgotSubmit}
              onNavigate={handleNavigate}
            />
          )}
        </div>

        {/* Footer */}
        <p
          className="text-micro"
          style={{
            textAlign: "center",
            color: "var(--color-text-tertiary)",
            marginTop: "2rem",
          }}
        >
          {t("login.terms")}
        </p>
      </div>
    </div>
  );
}
