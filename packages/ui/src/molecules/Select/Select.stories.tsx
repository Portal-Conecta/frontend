import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import { Select, type SelectOption } from './Select'

/**
 * Select — seleção única com dropdown próprio (Fase 1).
 *
 * Título em `Componentes/Inputs/Select/*` (grupo próprio da família Select,
 * conforme ADR-0011 adendo 2026-06-26) — base aqui, `SelectAsync`/`Creatable`
 * entram como irmãos nas fases seguintes.
 */
const salas: SelectOption[] = [
  { value: '204', label: '204 — Sala de aula' },
  { value: '205', label: '205 — Sala de aula' },
  { value: '206', label: '206 — Laboratório' },
  { value: '207', label: '207 — Auditório', disabled: true },
  { value: '208', label: '208 — Sala de reunião' },
]

const meta: Meta<typeof Select> = {
  title: 'Componentes/Inputs/Select/Select',
  component: Select,
  parameters: { layout: 'padded' },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Altura/tipografia do trigger. Default `md`.',
    },
    disabled: { control: 'boolean' },
    error: { control: 'text', description: 'Presença ativa o estado de erro (barra + mensagem).' },
    placeholder: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Select>

const render: Story['render'] = (args) => {
  const [value, setValue] = useState<string | null>(args.value ?? null)
  return <Select {...args} value={value} onChange={setValue} />
}

/** Playground — clique ou use as setas; Enter/Espaço seleciona, Esc fecha. */
export const Default: Story = {
  args: { options: salas, placeholder: 'Todos', 'aria-label': 'Período' },
  render,
}

/** Já com um valor selecionado. */
export const Selecionado: Story = {
  args: { options: salas, value: '205', 'aria-label': 'Período' },
  render,
}

/** Opção desabilitada (207 — Auditório) fica esmaecida, não clicável e é pulada pela navegação por teclado. */
export const WithDisabledOption: Story = {
  args: { options: salas, placeholder: 'Todos', 'aria-label': 'Período' },
  render,
}

export const ErrorStatus: Story = {
  args: {
    options: salas,
    placeholder: 'Todos',
    error: 'Selecione uma sala.',
    'aria-label': 'Período',
  },
  render,
}

export const Disabled: Story = {
  args: { options: salas, placeholder: 'Todos', disabled: true, 'aria-label': 'Período' },
  render,
}

export const Sizes: Story = {
  render: () => {
    const [a, setA] = useState<string | null>(null)
    const [b, setB] = useState<string | null>('205')
    const [c, setC] = useState<string | null>(null)
    return (
      <div className="flex flex-col gap-4">
        <Select options={salas} size="sm" placeholder="sm" aria-label="sm" value={a} onChange={setA} />
        <Select options={salas} size="md" placeholder="md" aria-label="md" value={b} onChange={setB} />
        <Select options={salas} size="lg" placeholder="lg" aria-label="lg" value={c} onChange={setC} />
      </div>
    )
  },
}
