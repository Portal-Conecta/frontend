import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { Text } from '@portal/ui'

import { DestinationSelector, type DestinationSelectorProps } from './DestinationSelector'
import { mockClasses, mockCourses, mockShifts, mockUsers } from './mockData'
import { makeRecipient, type Recipient } from './types'

const meta: Meta<typeof DestinationSelector> = {
  title: 'Comunicados/Organisms/DestinationSelector',
  component: DestinationSelector,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof DestinationSelector>

/** Não controlado: o componente gerencia a própria lista de destinatários. */
export const Default: Story = {
  args: {
    courses: mockCourses,
    classes: mockClasses,
    shifts: mockShifts,
    users: mockUsers,
  },
}

/** Persona sem permissão para os demais modos — só a busca de usuários. */
export const ApenasBuscaDeUsuarios: Story = {
  args: { modes: ['user'], users: mockUsers, usersPageSize: 5 },
}

export const Desabilitado: Story = {
  args: { disabled: true },
}

function ControlledDemo(args: DestinationSelectorProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([
    makeRecipient('course', 'curso-ds', 'Desenvolvimento de Sistemas'),
    makeRecipient('group', 'STUDENTS', 'Todos os Alunos'),
  ])

  return (
    <div className="flex flex-col gap-6">
      <DestinationSelector {...args} value={recipients} onChange={setRecipients} />

      <div className="flex flex-col gap-2 rounded-md bg-background-default p-4">
        <Text as="p" variant="label-sm-emphasis" tone="brand">
          Estado (value) — o que o formulário #197 receberá:
        </Text>
        <pre className="overflow-auto text-label-xs text-text-secondary">
          {JSON.stringify(recipients, null, 2)}
        </pre>
      </div>
    </div>
  )
}

/** Controlado + pré-selecionado, mostrando o `Recipient[]` que sai do componente. */
export const Controlado: Story = {
  render: (args) => <ControlledDemo {...args} />,
}
