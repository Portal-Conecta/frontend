import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import { DateInput } from './DateInput'

/**
 * DateInput — átomo de data (input nativo + ícone `calendar`). Agrupado em
 * **Inputs/Input** (input plano, como o `Input`). Controlado por `value` no
 * formato nativo `yyyy-mm-dd`; o calendário abre pelo botão do ícone.
 */
const meta: Meta<typeof DateInput> = {
  title: 'Componentes/Inputs/Pickers/DateInput',
  component: DateInput,
  parameters: { layout: 'padded' },
  argTypes: {
    error: { control: 'text', description: 'Presença ativa o estado de erro (barra + mensagem).' },
    disabled: { control: 'boolean' },
    min: { control: 'text', description: 'Limite inferior `yyyy-mm-dd`. Default `2000-01-01` (omitir não deixa ilimitado).' },
    max: { control: 'text', description: 'Limite superior `yyyy-mm-dd`. Default `2600-12-31` (barra ano com >4 dígitos).' },
    value: { control: false },
    onChange: { control: false },
    onBlur: {
      control: false,
      description: 'Disparado ao sair do campo. Correção/validação de intervalo pertence aqui — o input nativo emite `onChange` a cada dígito.',
    },
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

/**
 * Faixa personalizada — `min`/`max` explícitos sobrepõem os defaults
 * (`2000-01-01`…`2600-12-31`). Útil quando o consumidor precisa restringir o
 * calendário (ex.: agendamento a partir de hoje).
 */
export const ComLimites: Story = {
  args: { value: '2026-06-16', min: '2026-01-01', max: '2026-12-31', 'aria-label': 'Data' },
  render,
}
