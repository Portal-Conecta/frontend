import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import { DateInput } from './DateInput'

/**
 * DateInput — átomo de data (input nativo + ícone `calendar`). Agrupado em
 * **Inputs/Input** (input plano, como o `Input`). Controlado por `value` no
 * formato nativo `yyyy-mm-dd`; o calendário abre pelo botão do ícone.
 */
const meta: Meta<typeof DateInput> = {
  title: 'Componentes/Inputs/Input/Date',
  component: DateInput,
  parameters: { layout: 'padded' },
  argTypes: {
    error: { control: 'text', description: 'Presença ativa o estado de erro (barra + mensagem).' },
    disabled: { control: 'boolean' },
    value: { control: false },
    onChange: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="max-w-56">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof DateInput>

const render: Story['render'] = (args) => {
  const [value, setValue] = useState(args.value ?? '')
  return <DateInput {...args} value={value} onChange={setValue} />
}

/** Playground — vazio mostra o formato local (dd/mm/aaaa) em placeholder. */
export const Default: Story = {
  args: { 'aria-label': 'Data' },
  render,
}

/** Preenchido — o valor vai para a cor de brand. */
export const Preenchido: Story = {
  args: { value: '2026-06-16', 'aria-label': 'Data' },
  render,
}

export const ErrorState: Story = {
  args: { error: 'Escolha uma data.', 'aria-label': 'Data' },
  render,
}

export const Disabled: Story = {
  args: { disabled: true, value: '2026-06-16', 'aria-label': 'Data' },
  render,
}
