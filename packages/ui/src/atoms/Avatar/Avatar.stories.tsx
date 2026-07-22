import type { Meta, StoryObj } from '@storybook/react'

import { Avatar } from './Avatar'

const meta: Meta<typeof Avatar> = {
  title: 'Componentes/Content/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'lg'],
      description: '`sm` = 32px (linha de lista) · `lg` = 80px (cabeçalho de perfil). Default `lg`.',
    },
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

/** `lg` (80px) — usado no cabeçalho da página de perfil. */
export const Default: Story = {}

/** `sm` (32px) — usado em linhas de lista, ex.: `AssociateUsersCard`. */
export const Small: Story = {
  args: { size: 'sm' },
}
