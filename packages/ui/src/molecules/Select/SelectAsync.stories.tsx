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

/** Carrega ao abrir (spinner girando) e oferece o botão de atualizar no topo da lista. */
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

/** Resposta vazia → mensagem "Nenhuma opção". */
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

/** Falha no carregamento → mensagem de erro + "Tentar de novo". */
export const ErrorState: Story = {
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
