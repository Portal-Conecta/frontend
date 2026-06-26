import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import { iconRegistry, type IconName } from '../Icon'
import { Tag, type TagTone } from './Tag'

const iconOptions = [undefined, ...(Object.keys(iconRegistry) as IconName[])]

const meta: Meta<typeof Tag> = {
  title: 'Componentes/Data/Tag',
  component: Tag,
  parameters: { layout: 'padded' },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'positive', 'negative', 'warning', 'info'],
      description: 'Tom semântico do rótulo. Default `neutral`.',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Tamanho compacto. Default `md`.',
    },
    radius: {
      control: 'inline-radio',
      options: ['sm', 'md', 'full'],
      description: 'Raio do contorno. Default `full` (pill).',
    },
    icon: {
      control: 'select',
      options: iconOptions,
      description: 'Ícone opcional (set aprovado).',
    },
    iconPosition: {
      control: 'inline-radio',
      options: ['left', 'right'],
      description: 'Posição do ícone. Default `left`.',
    },
  },
  args: {
    children: 'example',
    tone: 'info',
    size: 'md',
    radius: 'full',
    icon: 'search',
    iconPosition: 'left',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md rounded-md p-6">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Tag>

export const Default: Story = {}

/** Todos os tons semânticos (Figma + issue #142). */
export const AllTones: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Tag tone="info" icon="search" size="md">
        example
      </Tag>
      <Tag tone="positive" icon="check-check" size="md">
        example
      </Tag>
      <Tag tone="negative" icon="bell" size="md">
        example
      </Tag>
      <Tag tone="warning" icon="bell" size="md" >
        example
      </Tag>
      <Tag tone="neutral" icon="settings" size="md">
        example
      </Tag>
    </div>
  ),
}

/** Ícone à esquerda e à direita — espelha variantes do Figma. */
export const IconPositions: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Tag tone="info" icon="search" iconPosition="left" size="md">
        example
      </Tag>
      <Tag tone="info" icon="search" iconPosition="right" size="md">
        example
      </Tag>
    </div>
  ),
}

/** Tamanhos disponíveis. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-row flex-wrap items-center gap-4">
      <Tag tone="info" size="sm" icon="search">
        example
      </Tag>
      <Tag tone="info" size="md" icon="search">
        example
      </Tag>
      <Tag tone="info" size="lg" icon="search">
        example
      </Tag>
    </div>
  ),
}

/** Variações de border radius. */
export const Radius: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Tag tone="positive" radius="sm" icon="check-check">
        example
      </Tag>
      <Tag tone="positive" radius="md" icon="check-check">
        example
      </Tag>
      <Tag tone="positive" radius="full" icon="check-check">
        example
      </Tag>
    </div>
  ),
}

/** Tag removível — botão `x` com callback. */
export const Removable: Story = {
  render: () => {
    const [visible, setVisible] = useState(true)
    if (!visible) {
      return (
        <button
          type="button"
          className="text-label-sm font-inter text-text-brand underline"
          onClick={() => setVisible(true)}
        >
          Restaurar tag
        </button>
      )
    }
    return (
      <Tag tone="info" icon="search" onRemove={() => setVisible(false)}>
        example
      </Tag>
    )
  },
}

/** Matriz: tons × ícone esquerda/direita (referência Figma node 1081:65). */
export const FigmaMatrix: Story = {
  render: () => {
    const rows: Array<{ tone: TagTone; icon: IconName }> = [
      { tone: 'info', icon: 'search' },
      { tone: 'positive', icon: 'check-check' },
      { tone: 'negative', icon: 'bell' },
      { tone: 'warning', icon: 'bell' },
      { tone: 'neutral', icon: 'settings' },
    ]

    return (
      <div className="flex flex-col items-start gap-3">
        {rows.map(({ tone, icon }) => (
          <div key={tone} className="flex flex-row flex-wrap items-center gap-3">
            <Tag tone={tone} icon={icon} iconPosition="left">
              example
            </Tag>
            <Tag tone={tone} icon={icon} iconPosition="right">
              example
            </Tag>
          </div>
        ))}
      </div>
    )
  },
}

/** Removível + ícone + pill — combinação completa. */
export const RemovableWithIcon: Story = {
  render: () => (
    <Tag tone="negative"  size="md" onRemove={() => undefined}>
      example
    </Tag>
  ),
}
