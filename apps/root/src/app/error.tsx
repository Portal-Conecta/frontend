"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  // `reset` sozinho só re-renderiza o boundary: o payload do servidor continua
  // sendo o que falhou, então o erro estoura de novo e o botão parece morto.
  // O `router.refresh()` refaz o render server-side antes do boundary tentar.
  function handleRetry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-20">
      <div className="flex flex-col gap-8 items-center">
        <ErrorPage {...ERROR_PRESENTATION.server}/>
        <Image
          src="/illustration-error.png"
          alt=""
          width={600}
          height={600}
          className="h-auto w-full max-w-[300px] md:max-w-md lg:max-w-lg"
        />
      </div>
      <Button variant="solid" tone="brand" onClick={handleRetry}>
        Tentar novamente
      </Button>
    </main>
  );
}
