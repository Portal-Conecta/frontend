/**
 * Alert — mensagem com barra lateral, usada sobre o painel azul (overlay).
 *
 * Ainda não é componente no DS, mas o comportamento é conhecido (idealização
 * do Login): uma barra vertical colorida + a mensagem. Dois usos:
 *  - `error` → erro vindo do back-end (barra vermelha, `feedback/error`).
 *  - `info`  → informação, ex: "senha gerenciada por admin" (barra branca).
 *
 * Primeira MOLÉCULA do @portal/ui: compõe o átomo `Text` (a mensagem).
 * Modelado para o contexto overlay (texto branco) — versão fundo-claro e
 * variantes success/warning ficam para quando o design definir.
 */
import type { ReactNode } from 'react'

import { Text } from '../../atoms/Text'

export type AlertVariant = 'error' | 'info'

const barClass: Record<AlertVariant, string> = {
  error: 'bg-feedback-error',
  info: 'bg-white',
}

const roleByVariant: Record<AlertVariant, 'alert' | 'status'> = {
  error: 'alert',
  info: 'status',
}

export interface AlertProps {
  variant?: AlertVariant
  children: ReactNode
  className?: string
}

export function Alert({ variant = 'error', children, className }: AlertProps) {
  return (
    <div
      role={roleByVariant[variant]}
      className={['flex items-stretch gap-4', className].filter(Boolean).join(' ')}
    >
      <span className={`w-[3px] shrink-0 rounded-full ${barClass[variant]}`} aria-hidden="true" />
      <Text variant="label-md" tone="inverse">
        {children}
      </Text>
    </div>
  )
}
