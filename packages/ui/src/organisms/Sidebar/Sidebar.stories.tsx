import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { Text } from '../../atoms/Text'
import { Sidebar, type SidebarItem } from './Sidebar'

const items: SidebarItem[] = [
  { key: 'checklist', icon: 'clipboard-list', label: 'Checklist' },
  { key: 'comunicados', icon: 'newspaper', label: 'Comunicados' },
  { key: 'mapa-salas', icon: 'map', label: 'Mapa de Sala' },
  { key: 'config', icon: 'settings', label: 'Configurações' },
]

/**
 * A Sidebar é controlada: o estado `expanded` vive no pai. Esta demo segura o
 * estado num `useState` e monta o organismo ao lado de um conteúdo fake para
 * mostrar o rail empurrando a página (desktop) ou o drawer/FAB (< lg).
 *
 * Redimensione o canvas do Storybook para ver os dois modos: ≥1024px = rail;
 * < 1024px = FAB (colapsado) → drawer com scrim (expandido).
 */
function Demo({ activeKey, initialExpanded }: { activeKey: string; initialExpanded: boolean }) {
  const [expanded, setExpanded] = useState(initialExpanded)
  return (
    <div className="flex h-screen w-full bg-background-default">
      <Sidebar
        items={items}
        activeKey={activeKey}
        expanded={expanded}
        onToggle={() => setExpanded((value) => !value)}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <Text variant="heading-h2" as="h2" tone="primary">
          Conteúdo da página
        </Text>
        <Text variant="body-sm" as="p" tone="secondary" className="mt-2">
          Estado: {expanded ? 'expandida' : 'colapsada'}.
        </Text>
      </main>
    </div>
  )
}

const meta: Meta<typeof Sidebar> = {
  title: 'Organisms/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof Sidebar>

export const Expandida: Story = {
  render: () => <Demo initialExpanded activeKey="comunicados" />,
}

export const Colapsada: Story = {
  render: () => <Demo initialExpanded={false} activeKey="comunicados" />,
}
