import type { Meta, StoryObj } from '@storybook/react'
import { Text, textVariants } from './Text'

const meta = {
    title: 'Componentes/Content/Text',
    component: Text,
    parameters: {
        layout: 'padded',
    },
    argTypes: {
        variant: {
            control: 'select',
            options: textVariants,
            description: 'Intenção tipográfica — pareia tamanho + entrelinha + peso + família do token. Default `body-md`.',
        },
        tone: {
            control: 'inline-radio',
            options: ['primary', 'secondary', 'brand', 'inverse', 'disabled'],
            description: 'Cor semântica do texto (token). Omitido herda a cor do contexto.',
        },
        as: {
            control: 'select',
            options: ['p', 'span', 'label', 'div', 'h1', 'h2', 'h3'],
            description: 'Elemento HTML renderizado. Default `p`.',
        },
    },
    args: {
        children: 'Texto de exemplo',
        variant: 'body-md',
    },
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Heading: Story = {
    args: { variant: 'heading-h1', children: 'Título Principal' },
}

export const AllVariants: Story = {
    render: (args) => (
        <div className="flex flex-col gap-4">
            {textVariants.map((v) => (
                <Text key={v} {...args} variant={v}>
                    {v} — O rato roeu a roupa do rei de Roma
                </Text>
            ))}
        </div>
    ),
}

export const OnDarkBackground: Story = {
    args: { tone: 'inverse', children: 'Texto sobre fundo escuro' },
    decorators: [
        (Story) => (
            <div className="rounded-md bg-interactive-default p-8">
                <Story />
            </div>
        ),
    ],
}
