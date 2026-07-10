"use client";

import { useEffect } from "react";

import { Button, ErrorPage } from "@portal/ui";
import { ERROR_PRESENTATION } from "@portal/core/http/errorPresentation";
import Image  from "next/image"

/**
 * Error boundary raiz (App Router). Precisa ser client component. Em produção o
 * Next redige a mensagem e remove props custom do erro (sobra só o `digest`),
 * então aqui é sempre um 500 genérico — o mapeamento por kind (403/404) acontece
 * na camada de fetch/página, onde o erro ainda é rico. Sem AppShell: client não
 * resolve o usuário (getCurrentUser é server-only).
 */
export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {


  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-20">
      <div className="flex flex-col gap-8 items-center">
        <ErrorPage {...ERROR_PRESENTATION.server}/>
        <Image
          src="/illustration-error.png"
          alt="Ilustração de erro"
          width={600}
          height={600}
          className="h-auto w-[300px] md:w-[400px] lg:w-[500px]"
        />
      </div>
      <Button variant="solid" tone="brand" onClick={() => window.location.reload()}>
        Tentar novamente
      </Button>
    </main>
  );
}
