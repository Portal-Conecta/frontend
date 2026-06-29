/**
 * Tipos e tamanhos compartilhados pela família Select (Select, SelectList e,
 * nas próximas fases, SelectAsync/multi). Mora num módulo à parte para o
 * controle (`Select`) e a lista (`SelectList`) importarem sem ciclo.
 */
import type { IconSize } from '../../atoms/Icon'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export type SelectSize = 'sm' | 'md' | 'lg'

// Tamanhos diferenciados por altura/padding. O texto fica em 16px no md/lg
// porque a escala de tipografia salta de label-md (16px) para label-xl (32px),
// sem token intermediário — diferenciar por texto quebraria o trigger.
export const sizeStyles: Record<SelectSize, { trigger: string; option: string; icon: IconSize }> = {
  sm: { trigger: 'h-9 px-3 text-label-sm', option: 'px-3 py-1.5 text-label-sm', icon: 'sm' },
  md: { trigger: 'h-11 px-3 text-label-md', option: 'px-3 py-2.5 text-label-md', icon: 'sm' },
  lg: { trigger: 'h-12 px-4 text-label-md', option: 'px-4 py-3 text-label-md', icon: 'md' },
}
