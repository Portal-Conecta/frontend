import type { Meta, StoryObj } from "@storybook/react";
import { FormField } from "./FormField";

const meta: Meta<typeof FormField> = {
    title: 'Molecules/FormField',
    component: FormField,
    parameters: { layout: 'padded' },
    decorators: [
        (Story) => (
            <div className="max-w-md rounded-md p-6">
                <Story />
            </div>
        ),
    ],
}

export default meta
type Story = StoryObj<typeof FormField>

export const Default: Story = {
    args: {
        placeholder:'placeholder',
        label:'Titulo'
    },
}