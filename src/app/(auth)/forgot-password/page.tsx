"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/language-context";
import { requestPasswordReset } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { isValidEmail } from "@/lib/validation";

export default function ForgotPasswordPage() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError(t.auth.emailRequired);
      return;
    }
    if (!isValidEmail(email)) {
      setError(t.auth.emailInvalid);
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset({ email: email.trim() });
      setSuccess(t.auth.forgotSuccess);
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
          {t.auth.forgotTitle}
        </h2>
        <p className="text-sm text-[var(--foreground)]/70">
          {t.auth.forgotSubtitle}
        </p>
      </div>

      <Input
        label={t.auth.email}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "..." : t.auth.forgotAction}
      </Button>

      <Link className="text-sm text-[var(--foreground)]/70" href="/login">
        {t.auth.backToLogin}
      </Link>
    </div>
  );
}
