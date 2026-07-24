'use client'

/**
 * CreateTurmaButton — botão "Criar Nova Turma" da PageTurma: ícone-only no
 * mobile, com label no desktop (mesmo padrão do `CreateUserButton`). Client-only
 * porque navega via `useRouter` (a página é Server Component). Leva à rota de
 * criação `/turmas/criar`.
 *
 * Componente próprio (não inline) porque é reusado pelo `TurmaListFallback` —
 * mesmo motivo do `CreateUserButton`: já divergiu uma vez entre página real e
 * loading skeleton quando o split responsivo vivia só num dos dois (#492).
 */
import { useRouter } from 'next/navigation'

import { Button } from '@portal/ui'

export function CreateTurmaButton() {
  const router = useRouter()
  const onClick = () => router.push('/turmas/criar')

  return (
    <>
      <div className="md:hidden">
        <Button size="sm" icon="plus" aria-label="Criar nova turma" onClick={onClick} />
      </div>
      <div className="hidden md:block">
        <Button iconLeft="plus" onClick={onClick}>
          Criar Nova Turma
        </Button>
      </div>
    </>
  )
}
