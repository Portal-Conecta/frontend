import type { Meta, StoryObj } from '@storybook/react'

import { EditBlockedFieldsHint } from '../EditBlockedFieldsHint'

const meta: Meta<typeof EditBlockedFieldsHint> = {
  title: 'Comunicados/Molecules/EditBlockedFieldsHint',
  component: EditBlockedFieldsHint,
  parameters: { layout: 'padded' },
  args: {
    blocked: true,
  },
  argTypes: {
    blocked: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl bg-background-default p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
