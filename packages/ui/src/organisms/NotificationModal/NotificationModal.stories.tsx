import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Button } from '../../atoms/Button'
import { NotificationModal } from './NotificationModal'

/**
 * Modal de detalhe de notificação: acionado via Portal do React, exibe título
 * e corpo completos. Controlado (`isOpen`/`onClose`) — o gatilho e o estado
 * ficam com quem consome (aqui, o `NotificationListItem`). Nas stories, um
 * wrapper com `useState` provê o gatilho e o estado.
 */
const meta: Meta<typeof NotificationModal> = {
  title: 'Componentes/Sobreposição/NotificationModal',
  component: NotificationModal,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof NotificationModal>

function Demo({ title, body }: { title: string; body: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir notificação</Button>
      <NotificationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        body={body}
      />
    </>
  )
}

export const Default: Story = {
  render: () => (
    <Demo
      title="Checklist de Manutenção Finalizado"
      body="Este é o corpo da notificação. Aqui estará o texto longo detalhando o que aconteceu no checklist de manutenção, permitindo ao utilizador ler toda a informação necessária diretamente no pop-up."
    />
  ),
}
