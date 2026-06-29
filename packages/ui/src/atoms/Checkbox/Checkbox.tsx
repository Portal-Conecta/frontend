'use client'

/**
 * Checkbox — átomo de seleção controlado (button + Icon + Text).
 * Hover e pressed são pseudo-classes CSS: funcionam ao importar o átomo, sem
 * wrapper. O estado marcado fixa a cor de brand. Icon e Text herdam a cor via
 * currentColor, então basta colorir o button.
 */
import { Icon } from '../Icon'
import { Text } from '../Text'

export type CheckboxSize = 'sm' | 'md' | 'lg'

export interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  size?: CheckboxSize
  disabled?: boolean
  id?: string
}

// Foco visível por token, alinhado ao RadioGroup (mesmo padrão de controle).
const base =
  'flex items-center gap-3 rounded-sm transition-colors duration-300 ease-in-out ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-70'

export function Checkbox({ checked, onChange, label, size = 'md', disabled, id }: CheckboxProps) {
  const colorClass = checked
    ? 'text-text-brand'
    : 'text-text-secondary hover:text-interactive-hover active:text-interactive-pressed'

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      id={id}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`${base} ${colorClass}`}
    >
      <Icon name={checked ? 'square-check' : 'square'} size={size} decorative />
      {label && <Text>{label}</Text>}
    </button>
  )
}
