import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";

const meta: Meta <typeof Checkbox> = {

    title:'atoms/Checkbox',
    component:Checkbox,
    parameters: { layout: 'padded' },
    decorators: [
        (Story) => (
            <div className="max-w-md rounded-md p-6">
                <Story />
            </div>
        ),
    ],
}

export default meta;
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
    args: {
    },
}