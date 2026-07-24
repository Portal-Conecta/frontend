import type { Meta, StoryObj } from '@storybook/react'

import type { DirectoryUser } from '../../../classes/types'
import { UsersTable } from './UsersTable'

const users: DirectoryUser[] = [
  {
    id: '1',
    name: 'Bruno Luís Medeiros',
    email: 'b@example.com',
    typeUser: 'STUDENT',
    active: true,
    accountStatus: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Daniel Muller',
    email: 'd@example.com',
    typeUser: 'TEACHER',
    active: true,
    accountStatus: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

const meta: Meta<typeof UsersTable> = {
  title: 'Componentes/Data/UsersTable',
  component: UsersTable,
  parameters: { layout: 'padded' },
  args: {
    users,
    onViewProfile: () => {},
  },
}

export default meta
type Story = StoryObj<typeof UsersTable>

export const Padrao: Story = {}

export const Loading: Story = {
  args: { loading: true, users: [] },
}

export const Vazio: Story = {
  args: { users: [], hasActiveFilter: true },
}

export const Erro: Story = {
  args: { users: [], error: true },
}
