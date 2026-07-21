'use client'

/**
 * ShiftFilter — filtro "Com turmas registradas no turno" (issue #357).
 *
 * Seleção única: os dois turnos do Hub (`HUB_SHIFT`) são valores compostos
 * (`FULL_AM_PM` = Manhã/Tarde, `FULL_PM_NT` = Tarde/Noite), então cada botão
 * mapeia 1:1 para um `HubShift`. Clicar no ativo desmarca (volta a "todos os
 * turnos"). O valor enviado ao BFF vem do enum; os rótulos são a cópia do
 * protótipo (barra, não "e").
 *
 * Botão ativo = solid (preenchido); inativo = outlined. `aria-pressed` expõe o
 * estado ao leitor de tela.
 */
import { HUB_SHIFT, type HubShift } from '@portal/shared'
import { Button, Text } from '@portal/ui'

/** Rótulos do protótipo, atrelados ao valor do enum enviado ao BFF. */
const SHIFT_OPTIONS: readonly { shift: HubShift; label: string }[] = [
  { shift: HUB_SHIFT.FULL_AM_PM, label: 'Manhã/Tarde' },
  { shift: HUB_SHIFT.FULL_PM_NT, label: 'Tarde/Noite' },
]

export interface ShiftFilterProps {
  /** Turno selecionado, ou `null` para "todos". */
  value: HubShift | null
  onChange: (shift: HubShift | null) => void
  className?: string
}

export function ShiftFilter({ value, onChange, className }: ShiftFilterProps) {
  return (
    <section
      aria-label="Filtrar por turno"
      className={['flex flex-col gap-3', className].filter(Boolean).join(' ')}
    >
      <Text as="h2" variant="label-md-emphasis" tone="brand">
        Com turmas registradas no turno:
      </Text>
      <div role="group" aria-label="Turno" className="flex items-center gap-3">
        {SHIFT_OPTIONS.map(({ shift, label }) => {
          const active = value === shift
          return (
            <Button
              key={shift}
              variant={active ? 'solid' : 'outlined'}
              size="sm"
              aria-pressed={active}
              onClick={() => onChange(active ? null : shift)}
              className="flex-1"
            >
              {label}
            </Button>
          )
        })}
      </div>
    </section>
  )
}
