import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import { SelectAsync } from './SelectAsync'
import type { SelectOption } from './types'

const salas: SelectOption[] = [
  { value: '204', label: '204 — Sala de aula' },
  { value: '205', label: '205 — Sala de aula' },
  { value: '206', label: '206 — Laboratório' },
  { value: '208', label: '208 — Sala de reunião' },
]

const loadAfter =
  (opts: SelectOption[], ms = 1200) =>
  () =>
    new Promise<SelectOption[]>((resolve) => setTimeout(() => resolve(opts), ms))

const failAfter =
  (ms = 1200) =>
  () =>
    new Promise<SelectOption[]>((_, reject) => setTimeout(() => reject(new Error('falha')), ms))

const meta: Meta<typeof SelectAsync> = {
  title: 'Componentes/Inputs/Select/SelectAsync',
  component: SelectAsync,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof SelectAsync>

/** Carrega ao abrir (spinner + "Carregando…" lado a lado); depois mostra a lista. Digite para filtrar. */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null)
    return (
      <SelectAsync
        aria-label="Sala"
        placeholder="Selecione"
        value={value}
        onChange={setValue}
        loadOptions={loadAfter(salas)}
      />
    )
  },
}

/** Resposta vazia → mensagem "Nenhuma opção encontrada". */
export const Empty: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null)
    return (
      <SelectAsync
        aria-label="Sala"
        placeholder="Selecione"
        value={value}
        onChange={setValue}
        loadOptions={loadAfter([])}
      />
    )
  },
}

/**
 * Falha no carregamento → cai no estado único "Nenhuma opção encontrada" (sem UI de erro
 * dedicada). Reabrir o dropdown tenta carregar de novo (retry implícito).
 */
export const FailureBecomesEmpty: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null)
    return (
      <SelectAsync
        aria-label="Sala"
        placeholder="Selecione"
        value={value}
        onChange={setValue}
        loadOptions={failAfter()}
      />
    )
  },
}
