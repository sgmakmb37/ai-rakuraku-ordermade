"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/lib/i18n";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { VerifyForm } from "@/components/auth/verify-form";
import { ForgotForm } from "@/components/auth/forgot-form";
import { Globe } from "lucide-react";

type AuthView = "login" | "signup" | "verify" | "forgot";

export default function LoginPage() {
  const { t, locale, setLocale } = useLocale();
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 px-5">
      {/* Language toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setLocale(locale === "ja" ? "en" : "ja")}
          className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-400 cursor-pointer transition-colors duration-200 hover:border-white/[0.15] hover:text-white"
        >
          <Globe size={13} />
          {locale === "ja" ? "EN" : "JP"}
        </button>
      </div>

      <div className="w-full max-w-[448px] pb-12">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="mb-5">
            <span className="logo-text text-2xl font-bold">AI Rakuraku</span>
          </div>
          <p className="text-sm text-zinc-400">
            {t("common.tagline")}
          </p>
        </div>

        {/* View tabs (button style) */}
        {view !== "verify" && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => handleNavigate("login")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium cursor-pointer transition-all duration-200 ${
                view === "login"
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-[0_0_16px_rgba(99,102,241,0.3)]"
                  : "border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:border-white/[0.15] hover:text-white"
              }`}
            >
              {t("login.title")}
            </button>
            <button
              onClick={() => handleNavigate("signup")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium cursor-pointer transition-all duration-200 ${
                view === "signup"
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-[0_0_16px_rgba(99,102,241,0.3)]"
                  : "border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:border-white/[0.15] hover:text-white"
              }`}
            >
              {t("login.signup.title")}
            </button>
            <button
              onClick={() => handleNavigate("forgot")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium cursor-pointer transition-all duration-200 ${
                view === "forgot"
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-[0_0_16px_rgba(99,102,241,0.3)]"
                  : "border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:border-white/[0.15] hover:text-white"
              }`}
            >
              {t("login.forgotPassword")}
            </button>
          </div>
        )}

        {/* Form card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm">
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
        <p className="text-xs text-zinc-500 text-center mt-8">
          {t("login.terms")}
        </p>
      </div>
    </div>
  );
}
