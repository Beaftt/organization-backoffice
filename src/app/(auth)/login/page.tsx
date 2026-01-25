"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/language-context";
import { login, googleLogin } from "@/lib/api/auth";
import { getAuthTokens, setAuthTokens } from "@/lib/storage/auth";
import { getDefaultModule } from "@/lib/storage/preferences";
import { setWorkspaceId } from "@/lib/storage/workspace";
import { ApiError } from "@/lib/api/client";
import { resolveDefaultRoute } from "@/lib/navigation/default-route";

export default function LoginPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    const tokens = getAuthTokens();
    if (!tokens?.accessToken) {
      return;
    }

    const storedDefault = getDefaultModule();
    router.replace(resolveDefaultRoute(storedDefault));
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await login({ email, password });
      setAuthTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      }, { persist: rememberMe });
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
      setAuthTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      }, { persist: rememberMe });
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
    if (!clientId || !(window as unknown as { google?: any }).google?.accounts) {
      return;
    }

    const google = (window as unknown as { google: any }).google;
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential?: string }) => {
        if (response.credential) {
          handleGoogleLogin(response.credential);
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={handleGoogleScript}
      />
      <div>
        <h2 className="text-2xl font-semibold">{t.auth.title}</h2>
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
        <label className="flex items-center gap-2 text-sm text-zinc-600">
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

      <Button
        variant="secondary"
        onClick={() => {
          const google = (window as unknown as { google?: any }).google;
          if (google?.accounts?.id) {
            google.accounts.id.prompt();
          }
        }}
        disabled={loading}
      >
        {t.auth.google}
      </Button>

      <Link className="text-sm text-zinc-600" href="/register">
        {t.auth.goToRegister}
      </Link>
    </div>
  );
}
