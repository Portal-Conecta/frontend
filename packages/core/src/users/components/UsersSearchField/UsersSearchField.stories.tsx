import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { UsersSearchField } from './UsersSearchField'

const meta: Meta<typeof UsersSearchField> = {
  title: 'Componentes/Data/UsersSearchField',
  component: UsersSearchField,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof UsersSearchField>

export const Padrao: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div className="w-full max-w-3xl">
        <UsersSearchField value={value} onChange={setValue} />
      </div>
    )
  },
}
