import type { Meta, StoryObj } from '@storybook/react'

import { UsersFiltersBar } from './UsersFiltersBar'

const meta: Meta<typeof UsersFiltersBar> = {
  title: 'Componentes/Data/UsersFiltersBar',
  component: UsersFiltersBar,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof UsersFiltersBar>

export const Padrao: Story = {}

export const Sheet: Story = {
  args: { variant: 'sheet' },
}
