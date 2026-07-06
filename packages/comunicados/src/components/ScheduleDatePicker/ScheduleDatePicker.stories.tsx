import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import { ScheduleDatePicker } from './ScheduleDatePicker'

/**
 * ScheduleDatePicker — seção "Publicar agora / Agendar publicação" (molecule)
 * que compõe o `RadioGroup` (publicar agora × agendar) + os átomos `DateInput` e
 * `TimeInput`. Agrupado em **Inputs/Input**, junto dos átomos de data/hora que
 * compõe.
 *
 * Um único `value` ISO-8601 UTC (`scheduledFor`) controla tudo: `null` =
 * publicar agora (opção "Publicar agora", campos ocultos). O `onChange` devolve
 * o instante completo em UTC (ou `null`). Instante no passado dispara o aviso de
 * validação no client.
 */
const meta: Meta<typeof ScheduleDatePicker> = {
  title: 'Componentes/Inputs/Input/ScheduleDatePicker',
  component: ScheduleDatePicker,
  parameters: { layout: 'padded' },
  argTypes: {
    error: {
      control: 'text',
      description: 'Erro externo (ex.: backend). Tem precedência sobre o aviso de data no passado.',
    },
    disabled: { control: 'boolean' },
    value: { control: false },
    onChange: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ScheduleDatePicker>

const render: Story['render'] = (args) => {
  const [value, setValue] = useState<string | null>(args.value ?? null)
  return (
    <div className="flex flex-col gap-4">
      <ScheduleDatePicker {...args} value={value} onChange={setValue} />
      {value ? (
        <p className="text-label-xs font-inter text-text-secondary">
          Agendado para: <code>{new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</code>
        </p>
      ) : null}
    </div>
  )
}

/** Publicar agora — opção padrão, campos ocultos. Selecione "Agendar publicação" para revelar. */
export const Default: Story = {
  args: {},
  render,
}

/** Já agendado para um instante futuro. */
export const Agendado: Story = {
  args: { value: '2099-06-16T14:00:00.000Z' },
  render,
}

/** Instante no passado dispara o aviso de validação do client. */
export const DataNoPassado: Story = {
  args: { value: '2000-01-01T09:00:00.000Z' },
  render,
}

/** Erro externo (ex.: rejeição do backend) — tem precedência sobre a validação local. */
export const ComErroExterno: Story = {
  args: { value: '2099-06-16T14:00:00.000Z', error: 'Não foi possível agendar para esse horário.' },
  render,
}

export const Disabled: Story = {
  args: { disabled: true, value: '2099-06-16T14:00:00.000Z' },
  render,
}
