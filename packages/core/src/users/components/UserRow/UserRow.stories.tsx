import type { Meta, StoryObj } from '@storybook/react'

import type { DirectoryUser } from '../../../classes/types'
import { UserRow } from './UserRow'

const sample: DirectoryUser = {
  id: 'u-1',
  name: 'Bruno Luís Medeiros',
  email: 'bruno@example.com',
  typeUser: 'STUDENT',
  active: true,
  accountStatus: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const meta: Meta<typeof UserRow> = {
  title: 'Componentes/Data/UserRow',
  component: UserRow,
  parameters: { layout: 'padded' },
  args: {
    user: sample,
    onViewProfile: () => {},
  },
}

export default meta
type Story = StoryObj<typeof UserRow>

export const Padrao: Story = {}

export const Inativo: Story = {
  args: {
    user: {
      ...sample,
      id: 'u-2',
      name: 'Ana Souza',
      active: false,
      accountStatus: 'DISABLED',
      typeUser: 'TEACHER',
    },
  },
}

export const Pendente: Story = {
  args: {
    user: {
      ...sample,
      id: 'u-4',
      name: 'Marcos Vinícius',
      active: false,
      accountStatus: 'PENDING_ACTIVATION',
      typeUser: 'STUDENT',
    },
  },
}

export const Lista: Story = {
  render: (args) => (
    <div className="w-full">
      <UserRow {...args} user={sample} />
      <UserRow
        {...args}
        user={{ ...sample, id: 'u-2', name: 'Daniel Muller', typeUser: 'TEACHER' }}
      />
      <UserRow
        {...args}
        user={{
          ...sample,
          id: 'u-3',
          name: 'Eduarda Ferrazza Stein',
          typeUser: 'ADMIN',
          active: false,
          accountStatus: 'DISABLED',
        }}
      />
      <UserRow
        {...args}
        user={{
          ...sample,
          id: 'u-4',
          name: 'Marcos Vinícius',
          typeUser: 'STUDENT',
          active: false,
          accountStatus: 'PENDING_ACTIVATION',
        }}
      />
    </div>
  ),
}
