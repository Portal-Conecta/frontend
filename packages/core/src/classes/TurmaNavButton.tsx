'use client'

/**
 * Botão do detalhe da turma que só navega. Mesmo motivo do `CreateTurmaButton`:
 * a página é Server Component, então o `push` mora num client component fino.
 *
 * Genérico (recebe `href`) porque a tela tem dois destinos — gerenciar usuários
 * e alterar representantes — e um wrapper por destino seria duplicação boba.
 *
 * Ícone-only no mobile, com label no desktop — mesmo padrão do
 * `CreateTurmaButton`/`CreateUserButton` (#492): symbol sozinho não cabe uma
 * régua inteira em telas estreitas.
 */
import { useRouter } from 'next/navigation'

import { Button, type ButtonProps, type IconName } from '@portal/ui'

export interface TurmaNavButtonProps extends Omit<ButtonProps, 'onClick' | 'icon' | 'iconLeft'> {
  href: string
  /** Ícone do botão — usado sozinho no mobile e ao lado do label no desktop. */
  icon: IconName
  /** Nome acessível do modo icon-only (mobile). */
  'aria-label': string
}

export function TurmaNavButton({
  href,
  icon,
  className,
  children,
  'aria-label': ariaLabel,
  ...buttonProps
}: TurmaNavButtonProps) {
  const router = useRouter()
  const onClick = () => router.push(href)

  return (
    <>
      <div className={`md:hidden ${className ?? ''}`}>
        <Button {...buttonProps} icon={icon} aria-label={ariaLabel} onClick={onClick} />
      </div>
      <div className={`hidden md:block ${className ?? ''}`}>
        <Button {...buttonProps} iconLeft={icon} onClick={onClick}>
          {children}
        </Button>
      </div>
    </>
  )
}
