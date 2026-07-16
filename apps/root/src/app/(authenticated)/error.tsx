'use client'

import { startTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button, ErrorPage } from '@portal/ui'
import { ERROR_PRESENTATION } from '@portal/core/http/errorPresentation'

/**
 * Error boundary do grupo `(authenticated)` (#405): erro de página autenticada
 * renderiza só o conteúdo — o AppShell vem do layout do grupo e fica na tela.
 * O error.tsx raiz continua cobrindo falhas do próprio layout (e lá, sem shell:
 * client não resolve o usuário). Mesma mecânica de retry do boundary raiz:
 * `reset` sozinho re-renderiza sobre o payload que falhou, então o
 * `router.refresh()` refaz o render server-side antes.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  function handleRetry() {
    startTransition(() => {
      router.refresh()
      reset()
    })
  }

  return (
    <div className="flex flex-col items-center gap-8 p-6 md:p-8">
      <ErrorPage {...ERROR_PRESENTATION.server} />
      <Button variant="solid" tone="brand" onClick={handleRetry}>
        Tentar novamente
      </Button>
    </div>
  )
}
