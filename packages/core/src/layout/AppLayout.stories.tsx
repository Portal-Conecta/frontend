import type { Meta, StoryObj } from '@storybook/react'

import { Text, type SidebarItem } from '@portal/ui'

import { AppLayout } from './AppLayout'

const items: SidebarItem[] = [
  { key: 'checklist', icon: 'clipboard-list', label: 'Checklist' },
  { key: 'comunicados', icon: 'newspaper', label: 'Comunicados' },
  { key: 'mapa-salas', icon: 'map', label: 'Mapa de Sala' },
  { key: 'config', icon: 'settings', label: 'Configurações' },
]

function FakeContent() {
  return (
    <div className="p-6">
      <Text as="h1" variant="heading-h2" tone="primary">
        Mural de Comunicados
      </Text>
      <Text as="p" variant="body-md" tone="secondary" className="mt-2">
        Conteúdo da tela do módulo. Redimensione o canvas para ver os três breakpoints: ≥1024px = rail que
        empurra o conteúdo; &lt;1024px = FAB (colapsado) → drawer (expandido).
      </Text>
    </div>
  )
}

const meta: Meta<typeof AppLayout> = {
  title: 'Layout/AppLayout',
  component: AppLayout,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    items: { control: false, description: 'Itens de navegação da sidebar (`{ key, icon, label, onClick? }`).' },
    activeKey: { control: 'text', description: 'Key do item de navegação ativo.' },
    defaultExpanded: {
      control: 'boolean',
      description: 'Estado inicial da sidebar. Default colapsado (`false`).',
    },
    children: { control: false, description: 'Conteúdo da tela (área central rolável).' },
    onLogoClick: { control: false, description: 'Clique na logo do header.' },
    onProfileClick: { control: false, description: 'Clique no perfil (header).' },
    onNotificationsClick: { control: false, description: 'Clique nas notificações (header).' },
    onMoreOptionsClick: { control: false, description: 'Clique em "mais opções" (header).' },
  },
  args: {
    items,
    activeKey: 'comunicados',
    children: <FakeContent />,
  },
}

export default meta
type Story = StoryObj<typeof AppLayout>

/** Colapsado (default). Desktop: rail de 96px. Clique em "Reduzir" no footer para expandir. */
export const Colapsada: Story = {
  args: { defaultExpanded: false },
}

/** Expandida. Desktop: rail de 254px com os labels. */
export const Expandida: Story = {
  args: { defaultExpanded: true },
}
