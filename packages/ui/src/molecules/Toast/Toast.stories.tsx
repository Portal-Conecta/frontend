import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '../../atoms/Button'
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

function ToastButtons() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button tone="negative">
        Erro
      </Button>
      <Button tone="positive">
        Sucesso
      </Button>
      <Button>
        Info
      </Button>
      <Button>
        Warning
      </Button>
    </div>
  )
}

function ToastDocsDemo() {
  return (
    <div className="grid min-h-64 grid-cols-1 items-center gap-8 bg-background-default p-6 md:grid-cols-2">
      <ToastButtons />
      <div className="flex w-full max-w-lg flex-col gap-2 justify-self-center">
        {toastItems.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => undefined} />
        ))}
      </div>
    </div>
  )
}

function ToastVariants() {
  return (
    <div className="flex min-h-96 bg-background-default p-6">
      <div className="flex w-full max-w-lg flex-col gap-2">
        {toastItems.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => undefined} />
        ))}
      </div>
    </div>
  )
}

const meta: Meta<typeof ToastDocsDemo> = {
  title: 'Componentes/Overlay/Toast',
  component: ToastDocsDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Toast mostra feedback temporário de ações com empilhamento, dismiss manual e região aria-live.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const DocsPreview: Story = {
  name: 'Toast',
  tags: ['!dev'],
}

export const Variants: Story = {
  render: () => <ToastVariants />,
  tags: ['!autodocs'],
}
