"use client";

import { Suspense, useEffect, useState } from "react";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/language-context";
import { register, googleLogin } from "@/lib/api/auth";
import { setWorkspaceId } from "@/lib/storage/workspace";
import { ApiError } from "@/lib/api/client";
import { isValidEmail } from "@/lib/validation";

type GoogleIdPrompt = {
  prompt: () => void;
  initialize: (options: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
  }) => void;
};

type GoogleAccounts = {
  id?: GoogleIdPrompt;
};

type GoogleWindow = {
  google?: {
    accounts?: GoogleAccounts;
  };
};

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
  const [googleLoading, setGoogleLoading] = useState(false);

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
    if (!isValidEmail(email)) {
      setError(t.auth.emailInvalid);
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

  const handleGoogleRegister = async (idToken: string) => {
    setGoogleLoading(true);
    setError(null);
    try {
      const response = await googleLogin({ idToken });
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
      setGoogleLoading(false);
    }
  };

  const handleGoogleScript = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const googleWindow = window as unknown as GoogleWindow;
    if (!clientId || !googleWindow.google?.accounts?.id) {
      return;
    }
    googleWindow.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential?: string }) => {
        if (response.credential) {
          handleGoogleRegister(response.credential);
        }
      },
    });
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={handleGoogleScript}
      />
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

        <Button onClick={handleRegister} disabled={loading || googleLoading}>
          {loading ? "..." : t.auth.register}
        </Button>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs text-[var(--foreground)]/60">
            {t.auth.google}
          </span>
          <span className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <div className="flex justify-center">
          <Button
            variant="secondary"
            className="h-12 w-12 rounded-full p-0"
            onClick={() => {
              const googleWindow = window as unknown as GoogleWindow;
              googleWindow.google?.accounts?.id?.prompt();
            }}
            disabled={loading || googleLoading}
            aria-label={t.auth.google}
          >
            <Image src="/google-icon.svg" alt="" width={22} height={22} />
          </Button>
        </div>

        <Link className="text-sm text-zinc-600" href="/login">
          {t.auth.goToLogin}
        </Link>
      </div>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
