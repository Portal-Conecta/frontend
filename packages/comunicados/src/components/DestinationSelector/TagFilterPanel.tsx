'use client'

import { useState } from 'react'

import { Field, Select, type SelectOption } from '@portal/ui'

import { makeRecipient, type Recipient, type RecipientKind } from './types'

export interface TagFilterPanelProps {
  courses: SelectOption[]
  classes: SelectOption[]
  shifts: SelectOption[]
  onAdd: (recipient: Recipient) => void
  disabled?: boolean
}

/**
 * Modo "Filtrar usuários por curso, turma ou turno".
 *
 * Três `Select` (curso/turma/turno). Escolher uma opção adiciona o destinatário
 * correspondente à lista e devolve o campo ao placeholder, permitindo empilhar
 * várias seleções. Curso e turma vêm das tags (`COURSE`/`CLASS`); turno é lista
 * fixa (ver `mockData.ts`).
 */
export function TagFilterPanel({
  courses,
  classes,
  shifts,
  onAdd,
  disabled = false,
}: TagFilterPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <AddSelect kind="course" label="Curso" options={courses} onAdd={onAdd} disabled={disabled} />
      <AddSelect kind="class" label="Turma" options={classes} onAdd={onAdd} disabled={disabled} />
      <AddSelect kind="shift" label="Turno" options={shifts} onAdd={onAdd} disabled={disabled} />
    </div>
  )
}

function AddSelect({
  kind,
  label,
  options,
  onAdd,
  disabled,
}: {
  kind: RecipientKind
  label: string
  options: SelectOption[]
  onAdd: (recipient: Recipient) => void
  disabled: boolean
}) {
  // Valor transitório: some após adicionar, voltando ao placeholder "Todos".
  const [selected, setSelected] = useState<string | null>(null)

  function handleChange(value: string | null) {
    if (value == null) {
      setSelected(null)
      return
    }
    const option = options.find((item) => item.value === value)
    if (option) onAdd(makeRecipient(kind, option.value, option.label))
    setSelected(null)
  }

  return (
    <Field label={label}>
      <Select
        options={options}
        value={selected}
        onChange={handleChange}
        placeholder="Todos"
        disabled={disabled}
      />
    </Field>
  )
}
