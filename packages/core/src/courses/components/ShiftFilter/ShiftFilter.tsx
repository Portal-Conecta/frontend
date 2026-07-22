'use client'

/**
 * ShiftFilter — filtro "Com turmas registradas no turno" (issue #357).
 *
 * Select com "Todos" + os dois turnos do Hub (`HUB_SHIFT`). O valor enviado ao
 * BFF continua sendo o enum; `null` = sem filtro. Rótulos vêm de
 * `HUB_SHIFT_LABELS` ("Manhã e tarde" / "Tarde e noite").
 */
import { HUB_SHIFT, HUB_SHIFT_LABELS, type HubShift } from '@portal/shared'
import { Field, Select, Text, type SelectOption } from '@portal/ui'

const TODOS = 'todos'

const SHIFT_OPTIONS: SelectOption[] = [
  { value: TODOS, label: 'Todos' },
  { value: HUB_SHIFT.FULL_AM_PM, label: HUB_SHIFT_LABELS[HUB_SHIFT.FULL_AM_PM] },
  { value: HUB_SHIFT.FULL_PM_NT, label: HUB_SHIFT_LABELS[HUB_SHIFT.FULL_PM_NT] },
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
      <Field label="Turno">
        <Select
          options={SHIFT_OPTIONS}
          value={value ?? TODOS}
          onChange={(next) => {
            onChange(!next || next === TODOS ? null : (next as HubShift))
          }}
          placeholder="Todos"
        />
      </Field>
    </section>
  )
}
