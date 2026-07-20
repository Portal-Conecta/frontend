import type { Meta, StoryObj } from '@storybook/react'

import { SectionTabs } from './SectionTabs'

const tabs = [
  { label: 'Visão geral', href: '/checklist' },
  { label: 'Itens', href: '/checklist/itens' },
  { label: 'Histórico', href: '/checklist/historico' },
]

const meta: Meta<typeof SectionTabs> = {
  title: 'Checklist/SectionTabs',
  component: SectionTabs,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/checklist' },
    },
  },
  args: {
    tabs,
  },
}

export default meta
type Story = StoryObj<typeof SectionTabs>

export const Default: Story = {}

/**
 * `isActive` cobre subrotas (`pathname.startsWith(href + '/')`) — aqui a rota
 * mockada é `/checklist/itens/123`, então a aba "Itens" marca como atual.
 */
export const SubrotaAtiva: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: '/checklist/itens/123' },
    },
  },
}

export const UltimaAbaAtiva: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: '/checklist/historico' },
    },
  },
}
