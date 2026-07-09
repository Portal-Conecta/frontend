import { useId, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import { Text } from '@portal/ui/atoms'
import { Section } from './Section'

const salaOptions = [
  { value: 'sala-1', label: 'Selecionar sala' },
  { value: 'sala-2', label: 'Sala de reunião' },
  { value: 'sala-3', label: 'Auditório' },
] as const

const meta: Meta<typeof Section> = {
  title: 'Componentes/Navegação/Section/Section',
  component: Section,
  parameters: { layout: 'padded' },
  argTypes: {
    disabled: { control: 'boolean', description: 'Desabilita o grupo inteiro.' },
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl rounded-md p-6">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Section>

const render: Story['render'] = (args) => {
  const [value, setValue] = useState(args.value ?? 'sala-1')
  return <Section {...args} value={value} onChange={setValue} />
}

/** Playground — clique ou use as setas para navegar e selecionar. */
export const Default: Story = {
  args: { options: [...salaOptions], value: 'sala-1', 'aria-label': 'Selecionar sala' },
  render,
}

/** Seção de elemento único. */
export const SingleItem: Story = {
  args: {
    options: [{ value: 'sala-1', label: 'Selecionar sala' }],
    value: 'sala-1',
    'aria-label': 'Selecionar sala',
  },
  render,
}

/** Um item desabilitado no meio do grupo — pulado pela navegação por setas. */
export const OptionDisabled: Story = {
  args: {
    options: [
      { value: 'sala-1', label: 'Selecionar sala' },
      { value: 'sala-2', label: 'Sala ocupada', disabled: true },
      { value: 'sala-3', label: 'Auditório' },
    ],
    value: 'sala-1',
    'aria-label': 'Selecionar sala',
  },
  render,
}

/** Grupo inteiro desabilitado. */
export const Disabled: Story = {
  args: {
    options: [...salaOptions],
    value: 'sala-1',
    disabled: true,
    'aria-label': 'Selecionar sala',
  },
  render,
}

/** Composição com label externo (padrão de integração com Field). */
function WithLabelDemo() {
  const labelId = useId()
  const [value, setValue] = useState('sala-1')

  return (
    <div className="flex flex-col gap-2">
      <Text as="label" id={labelId} variant="body-md" tone="brand">
        Salas disponíveis
      </Text>
      <Section options={[...salaOptions]} value={value} onChange={setValue} aria-labelledby={labelId} />
    </div>
  )
}

export const WithLabel: Story = {
  render: () => <WithLabelDemo />,
}
