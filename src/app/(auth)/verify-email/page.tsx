"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { verifyEmail } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useLanguage } from "@/lib/i18n/language-context";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("E-mail confirmado com sucesso.");
      })
      .catch((err) => {
        const apiError = err as ApiError;
        const detail =
          apiError.messageI18n?.[language] ?? apiError.message ?? "Erro";
        setStatus("error");
        setMessage(detail);
      });
  }, [token, language]);

  const resolvedStatus = token ? status : "error";
  const resolvedMessage = token ? message : "Token inválido.";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Confirmar e-mail</h2>
        <p className="text-sm text-zinc-600">
          {resolvedStatus === "loading"
            ? "Validando seu e-mail..."
            : resolvedStatus === "success"
              ? "Seu e-mail foi confirmado."
              : "Não foi possível confirmar o e-mail."}
        </p>
      </div>

      {resolvedMessage ? (
        <p className="text-sm text-zinc-600">{resolvedMessage}</p>
      ) : null}

      <Link href="/login">
        <Button variant="secondary">Ir para o login</Button>
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
