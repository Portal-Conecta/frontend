import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '../../atoms/Button'
import { Icon } from '../../atoms/Icon'
import { EmptyState } from './EmptyState'

const linkClassName = [
  'inline-flex items-center justify-center rounded-md bg-interactive-default px-4 py-2',
  'text-label-md-emphasis font-inter text-text-inverse',
  'hover:bg-interactive-hover active:bg-interactive-pressed',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2',
].join(' ')

const meta = {
  title: 'Componentes/Feedback/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
  args: {
    title: 'Nenhum item encontrado',
    description: 'Quando houver itens, eles aparecerão aqui.',
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const WithoutAction: Story = {}

export const WithLinkAction: Story = {
  args: {
    action: (
      <a href="#empty-state-link-action" className={linkClassName}>
        Criar item
      </a>
    ),
  },
}

export const WithButtonAction: Story = {
  args: {
    action: <Button variant="outlined">Tentar novamente</Button>,
  },
}

export const WithCustomIllustration: Story = {
  args: {
    illustration: (
      <div className="mb-4 text-text-disabled" aria-hidden="true">
        <Icon name="circle-alert" size="lg" decorative />
      </div>
    ),
  },
}
