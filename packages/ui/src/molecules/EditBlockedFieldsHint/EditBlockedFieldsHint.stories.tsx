import type { Meta, StoryObj } from '@storybook/react'

import { EditBlockedFieldsHint } from './EditBlockedFieldsHint'

const meta: Meta<typeof EditBlockedFieldsHint> = {
  title: 'Componentes/Feedback/EditBlockedFieldsHint',
  component: EditBlockedFieldsHint,
  parameters: { layout: 'padded' },
  args: {
    disabled: true,
  },
}

export default meta

type Story = StoryObj<typeof EditBlockedFieldsHint>

export const Default: Story = {}

export const VisibleWhenBlocked: Story = {
  args: {
    disabled: true,
  },
}
