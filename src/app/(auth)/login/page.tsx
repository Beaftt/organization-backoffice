"use client";

import Script from "next/script";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/language-context";
import { login, googleLogin } from "@/lib/api/auth";
import { getDefaultModule } from "@/lib/storage/preferences";
import { setWorkspaceId } from "@/lib/storage/workspace";
import { ApiError } from "@/lib/api/client";
import { resolveDefaultRoute } from "@/lib/navigation/default-route";
import { useTheme } from "@/components/providers/ThemeProvider";
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

export default function LoginPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async () => {
    setError(null);
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
      const response = await login({ email, password });
      if (response.defaultWorkspaceId) {
        setWorkspaceId(response.defaultWorkspaceId);
      }
      const storedDefault = getDefaultModule();
      router.push(resolveDefaultRoute(storedDefault));
    } catch (err) {
      const apiError = err as ApiError;
      const message =
        apiError.messageI18n?.[language] ?? apiError.message ?? "Erro";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await googleLogin({ idToken });
      if (response.defaultWorkspaceId) {
        setWorkspaceId(response.defaultWorkspaceId);
      }
      const storedDefault = getDefaultModule();
      router.push(resolveDefaultRoute(storedDefault));
    } catch (err) {
      const apiError = err as ApiError;
      const message =
        apiError.messageI18n?.[language] ?? apiError.message ?? "Erro";
      setError(message);
    } finally {
      setLoading(false);
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
          handleGoogleLogin(response.credential);
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={handleGoogleScript}
      />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--sidebar)] text-sm font-semibold text-white shadow-sm">
            OP
          </div>
          <div>
            <p className="text-sm font-semibold">Organization</p>
            <p className="text-xs text-[var(--foreground)]/60">Backoffice</p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)]/70 transition hover:text-[var(--foreground)]"
          aria-label={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
        >
          {theme === "light" ? "☾" : "☀︎"}
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          {t.auth.title}
        </h2>
        <p className="text-sm text-[var(--foreground)]/70">
          {t.auth.subtitle}
        </p>
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
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]/70">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border border-[var(--border)]"
          />
          {t.auth.remember}
        </label>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button onClick={handleLogin} disabled={loading}>
        {loading ? "..." : t.auth.login}
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
            if (googleWindow.google?.accounts?.id) {
              googleWindow.google.accounts.id.prompt();
            }
          }}
          disabled={loading}
          aria-label={t.auth.google}
        >
          <Image src="/google-icon.svg" alt="" width={22} height={22} />
        </Button>
      </div>

      <Link className="text-sm text-[var(--foreground)]/70" href="/register">
        {t.auth.goToRegister}
      </Link>
    </div>
  );
}
