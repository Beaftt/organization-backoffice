"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/language-context";
import { register } from "@/lib/api/auth";
import { setAuthTokens } from "@/lib/storage/auth";
import { setWorkspaceId } from "@/lib/storage/workspace";
import { ApiError } from "@/lib/api/client";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inviteToken = searchParams.get("invite");

  useEffect(() => {
    const prefillEmail = searchParams.get("email");
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [searchParams]);

  const handleRegister = async () => {
    setError(null);
    if (!email.trim()) {
      setError(t.auth.emailRequired);
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
      const response = await register({
        email,
        password,
        inviteToken: inviteToken ?? undefined,
      });
      setAuthTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      if (response.defaultWorkspaceId) {
        setWorkspaceId(response.defaultWorkspaceId);
      }
      router.push("/dashboard");
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
      <div>
        <h2 className="text-2xl font-semibold">{t.auth.register}</h2>
        <p className="text-sm text-zinc-600">{t.auth.subtitle}</p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label={t.auth.email}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label={t.auth.password}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Input
          label={t.auth.confirmPassword}
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button onClick={handleRegister} disabled={loading}>
        {loading ? "..." : t.auth.register}
      </Button>

      <Link className="text-sm text-zinc-600" href="/login">
        {t.auth.goToLogin}
      </Link>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
