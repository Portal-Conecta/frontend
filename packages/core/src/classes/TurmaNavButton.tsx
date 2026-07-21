'use client'

/**
 * Botão do detalhe da turma que só navega. Mesmo motivo do `CreateTurmaButton`:
 * a página é Server Component, então o `push` mora num client component fino.
 *
 * Genérico (recebe `href`) em vez de fixar o destino: hoje só "Gerenciar usuário
 * da turma" usa, mas o botão de alterar representantes entra aqui quando a tela
 * existir, sem precisar de um wrapper por destino.
 */
import { useRouter } from 'next/navigation'

import { Button, type ButtonProps } from '@portal/ui'

export interface TurmaNavButtonProps extends Omit<ButtonProps, 'onClick'> {
  href: string
}

export function TurmaNavButton({ href, ...buttonProps }: TurmaNavButtonProps) {
  const router = useRouter()

  return <Button {...buttonProps} onClick={() => router.push(href)} />
}
