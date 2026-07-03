import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import { TimeInput } from './TimeInput'

/**
 * TimeInput — átomo de hora (input nativo + ícone `clock`). Fica sob a família
 * **Inputs/Select** por ser um campo de seleção. Controlado por `value` no
 * formato nativo `HH:mm` (24h); clicar em qualquer ponto abre o seletor de hora.
 */
const meta: Meta<typeof TimeInput> = {
  title: 'Componentes/Inputs/Select/TimeInput',
  component: TimeInput,
  parameters: { layout: 'padded' },
  argTypes: {
    error: { control: 'text', description: 'Presença ativa o estado de erro (barra + mensagem).' },
    disabled: { control: 'boolean' },
    value: { control: false },
    onChange: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="max-w-44">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TimeInput>

const render: Story['render'] = (args) => {
  const [value, setValue] = useState(args.value ?? '')
  return <TimeInput {...args} value={value} onChange={setValue} />
}

/** Playground — vazio mostra o formato local (--:--) em placeholder. */
export const Default: Story = {
  args: { 'aria-label': 'Hora' },
  render,
}

/** Preenchido — o valor vai para a cor de brand. */
export const Preenchido: Story = {
  args: { value: '12:00', 'aria-label': 'Hora' },
  render,
}

export const ErrorState: Story = {
  args: { error: 'Escolha um horário.', 'aria-label': 'Hora' },
  render,
}

export const Disabled: Story = {
  args: { disabled: true, value: '12:00', 'aria-label': 'Hora' },
  render,
}
