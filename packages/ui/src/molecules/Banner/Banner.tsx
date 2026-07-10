/**
 * Banner — aviso persistente e inline no conteúdo da página.
 *
 * Diferente do `Alert` (escopado pro painel de overlay) e do `Toast`
 * (efêmero, some sozinho), o Banner fica no fluxo normal da página até o
 * usuário agir ou o conteúdo que o motivou deixar de existir. Sem botão de
 * fechar, sem timer.
 *
 * `role="status"` fixo, sem variar por variante: ao contrário do Alert/Toast
 * (inseridos dinamicamente, onde a live region tem efeito real), o Banner é
 * conteúdo majoritariamente estático já presente no carregamento da página —
 * `role="alert"` nesse caso não anuncia nada e em algumas combinações de
 * leitor de tela/navegador pode disparar leitura indesejada no load.
 */
import type { ReactNode } from 'react'

import { Icon, type IconName } from '../../atoms/Icon'
import { Text } from '../../atoms/Text'

export type BannerVariant = 'info' | 'error' | 'warning'

export interface BannerProps {
  variant?: BannerVariant
  children: ReactNode
  className?: string
}

const variantIcon: Record<BannerVariant, IconName> = {
  info: 'circle-alert',
  error: 'x',
  warning: 'triangle-alert',
}

const toneClass: Record<BannerVariant, string> = {
  info: 'text-text-brand',
  error: 'text-feedback-error',
  warning: 'text-text-brand',
}

const dividerClass: Record<BannerVariant, string> = {
  info: 'border-border-focus',
  error: 'border-border-error',
  warning: 'border-border-focus',
}

export function Banner({ variant = 'info', children, className }: BannerProps) {
  return (
    <div
      role="status"
      className={['flex items-center gap-3', toneClass[variant], className].filter(Boolean).join(' ')}
    >
      <span className={`flex shrink-0 items-center self-stretch border-r-sm pr-3 ${dividerClass[variant]}`}>
        <Icon name={variantIcon[variant]} size="lg" decorative />
      </span>
      <Text as="p" variant="label-xs" className="min-w-0">
        {children}
      </Text>
    </div>
  )
}
