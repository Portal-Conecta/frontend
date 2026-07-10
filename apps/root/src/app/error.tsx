"use client";

import { useEffect } from "react";

import { Button, ErrorPage } from "@portal/ui";

/**
 * Error boundary raiz (App Router). Precisa ser client component. Em produção o
 * Next redige a mensagem e remove props custom do erro (sobra só o `digest`),
 * então aqui é sempre um 500 genérico — o mapeamento por kind (403/404) acontece
 * na camada de fetch/página, onde o erro ainda é rico. Sem AppShell: client não
 * resolve o usuário (getCurrentUser é server-only).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8">
      <ErrorPage
        code="500"
        title="Erro interno do servidor"
        description="Algo deu errado do nosso lado. Tente novamente em alguns instantes"
      />
      <Button variant="solid" tone="brand" onClick={reset}>
        Tentar novamente
      </Button>
    </main>
  );
}
