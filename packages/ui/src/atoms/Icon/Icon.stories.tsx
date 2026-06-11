import type { Meta, StoryObj } from '@storybook/react'

import { Icon } from './Icon'
import { iconRegistry, type IconName } from './icons'

const iconNames = Object.keys(iconRegistry) as IconName[]

const meta = {
  title: 'Atoms/Icon',
  component: Icon,
  parameters: { layout: 'centered' },
  argTypes: {
    name: { control: 'select', options: iconNames },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: { control: 'inline-radio', options: [undefined, 'primary', 'secondary', 'inverse'] },
    decorative: { control: 'boolean' },
  },
  args: { name: 'search', size: 'md' },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

/** Playground — use os controls para trocar name/size/tone. */
export const Default: Story = {}

/** Todos os ícones aprovados do DS. Serve de contrato visual com o design. */
export const Gallery: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-6">
      {iconNames.map((name) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon name={name} size="md" tone="secondary" />
          <span className="text-label-xs text-text-secondary">{name}</span>
        </div>
      ))}
    </div>
  ),
}

/** Os três tamanhos permitidos: 16 · 24 · 32. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-6">
      <Icon {...args} size="sm" />
      <Icon {...args} size="md" />
      <Icon {...args} size="lg" />
    </div>
  ),
  args: { name: 'bell' },
}

/** Cor via token semântico. `inverse` aparece sobre o painel azul. */
export const Tones: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <Icon {...args} tone="primary" />
      <Icon {...args} tone="secondary" />
      <div className="rounded-md bg-interactive-default p-3">
        <Icon {...args} tone="inverse" />
      </div>
    </div>
  ),
  args: { name: 'settings' },
}

/** `loading-circle` gira automaticamente. */
export const Loading: Story = {
  args: { name: 'loading-circle', tone: 'primary', size: 'lg' },
}
