'use client'

/**
 * CreateTurmaButton — botão "Criar Nova Turma" da PageTurma. Client-only porque
 * navega via `useRouter` (a página é Server Component). Leva à rota de criação
 * `/turmas/criar`.
 */
import { useRouter } from 'next/navigation'

import { Button } from '@portal/ui'

export function CreateTurmaButton() {
  const router = useRouter()

  return (
    <Button iconLeft="plus" onClick={() => router.push('/turmas/criar')}>
      Criar Nova Turma
    </Button>
  )
}
