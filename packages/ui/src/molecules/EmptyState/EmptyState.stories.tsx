import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '../../atoms/Button'
import { Icon } from '../../atoms/Icon'
import { EmptyState } from './EmptyState'

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
      <Button asChild>
        <a href="#empty-state-link-action">Criar item</a>
      </Button>
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
