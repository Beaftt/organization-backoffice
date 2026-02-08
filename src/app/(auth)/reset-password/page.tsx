"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";
import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

function ResetPasswordPageContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!token) {
      setError(t.auth.resetInvalidToken);
      return;
    }

    if (password.length < 8) {
      setError(t.auth.passwordMin);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, password });
      setSuccess(t.auth.resetSuccess);
    } catch (err) {
      const apiError = err as ApiError;
      const message =
        apiError.messageI18n?.[language] ?? apiError.message ?? "Erro";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          {t.auth.resetTitle}
        </h2>
        <p className="text-sm text-[var(--foreground)]/70">
          {t.auth.resetSubtitle}
        </p>
      </div>

      <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
        <span className="font-medium text-[var(--foreground)]/90">
          {t.auth.password}
        </span>
        <div className="relative">
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 pr-20 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? t.auth.hidePassword : t.auth.showPassword}
          </button>
        </div>
      </label>

      <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
        <span className="font-medium text-[var(--foreground)]/90">
          {t.auth.confirmPassword}
        </span>
        <input
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "..." : t.auth.resetAction}
      </Button>

      <Link className="text-sm text-[var(--foreground)]/70" href="/login">
        {t.auth.backToLogin}
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[var(--foreground)]/70" />}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
