'use client'

/**
 * Botão do detalhe da turma que só navega. Mesmo motivo do `CreateTurmaButton`:
 * a página é Server Component, então o `push` mora num client component fino.
 *
 * Genérico (recebe `href`) porque a tela tem dois destinos — gerenciar usuários
 * e alterar representantes — e um wrapper por destino seria duplicação boba.
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
