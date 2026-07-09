import type { Meta, StoryObj } from '@storybook/react'
import { useState, type ComponentProps } from 'react'

import { Button } from '../../atoms/Button'
import { ConfirmDialog } from './ConfirmDialog'

/**
 * Diálogo de confirmação controlado (`open`/`onClose`) e dirigido por props:
 * `subTitle`/`title`/`content` montam o texto; `labelCancel`/`labelConfirm`
 * nomeiam as ações e `confirmButton` define a cor da confirmação. Por padrão o
 * scrim é decorativo (clicar fora não fecha) e só o botão cancelar (ou `Esc`)
 * fecha. Nas stories, um wrapper com `useState` provê o gatilho e o estado.
 */
const meta: Meta<typeof ConfirmDialog> = {
  title: 'Componentes/Sobreposição/ConfirmDialog',
  component: ConfirmDialog,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof ConfirmDialog>

/**
 * Wrapper de demonstração: botão gatilho + estado local. `onConfirm` fecha por
 * padrão (só para a demo ficar navegável); um consumidor real decide quando
 * fechar depois da ação.
 */
function Demo({
  triggerLabel = 'Abrir modal',
  onConfirm,
  ...modalProps
}: {
  triggerLabel?: string
  onConfirm?: () => void
} & Omit<ComponentProps<typeof ConfirmDialog>, 'open' | 'onClose' | 'onConfirm'>) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>{triggerLabel}</Button>
      <ConfirmDialog
        open={open}
        onClose={close}
        onConfirm={onConfirm ?? close}
        {...modalProps}
      />
    </>
  )
}

/** Confirmação padrão (`confirmTone="brand"`): título + texto + cancelar/confirmar. */
export const Default: Story = {
  render: () => (
    <Demo
      triggerLabel="Publicar comunicado"
      subTitle="Comunicados"
      title="Publicar comunicado?"
      content="O comunicado ficará visível para todos os usuários. Você pode editá-lo depois."
      labelCancel="Cancelar"
      labelConfirm="Publicar"
      confirmTone="brand"
    />
  ),
}

/** Ação destrutiva: `confirmTone="negative"` deixa o confirmar vermelho. */
export const Exclusao: Story = {
  render: () => (
    <Demo
      triggerLabel="Excluir comunicado"
      subTitle="Comunicados"
      title="Excluir comunicado?"
      content="Esta ação não pode ser desfeita. O comunicado será removido permanentemente."
      labelCancel="Cancelar"
      labelConfirm="Excluir"
      confirmTone="negative"
    />
  ),
}

/** Confirmação positiva: `confirmTone="positive"` (verde). */
export const Positivo: Story = {
  render: () => (
    <Demo
      triggerLabel="Aprovar solicitação"
      subTitle="Solicitações"
      title="Aprovar solicitação?"
      content="O solicitante será notificado da aprovação."
      labelCancel="Voltar"
      labelConfirm="Aprovar"
      confirmTone="positive"
    />
  ),
}

/**
 * Scrim clicável (`closeOnScrimClick`): comportamento opcional — clicar no fundo
 * também fecha. Fora isso, o padrão é o scrim decorativo.
 */
export const ScrimFechaAoClicar: Story = {
  render: () => (
    <Demo
      triggerLabel="Abrir (scrim fecha)"
      closeOnScrimClick
      subTitle="Mapa de salas"
      title="Limpar mapa?"
      content="Todos os assentos atribuídos serão removidos."
      labelCancel="Cancelar"
      labelConfirm="Limpar mapa"
      confirmTone="negative"
    />
  ),
}
