import type { Meta, StoryObj } from '@storybook/react'

import { Toast, type ToastItem } from './Toast'

const toastItems: ToastItem[] = [
  {
    id: 'error',
    variant: 'error',
    title: 'Erro',
    message: 'Mensagem não encontrada',
    duration: 0,
  },
  {
    id: 'success',
    variant: 'success',
    message: 'Mensagem enviada com Sucesso!',
    duration: 0,
  },
  {
    id: 'info',
    variant: 'info',
    title: 'Notificação',
    message: 'faça uma prova agora',
    duration: 0,
  },
  {
    id: 'warning',
    variant: 'warning',
    message: 'Revise os dados antes de continuar',
    duration: 0,
  },
]

function ToastVariants() {
  return (
    <div className="flex min-h-80 items-center justify-center bg-background-default p-6">
      <div className="flex w-full max-w-lg flex-col gap-2">
        {toastItems.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => undefined} />
        ))}
      </div>
    </div>
  )
}

const meta: Meta<typeof ToastVariants> = {
  title: 'Componentes/Overlay/Toast',
  component: ToastVariants,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {}
