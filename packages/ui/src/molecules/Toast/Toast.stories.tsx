import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'

import { Button } from '../../atoms/Button'
import { ToastProvider, useToast } from './Toast'

function ToastActions() {
  const { toast } = useToast()

  return (
    <div className="flex flex-wrap gap-3">
      <Button tone="negative" onClick={() => toast.error('Mensagem não encontrada', { title: 'Erro' })}>
        Erro
      </Button>
      <Button tone="positive" onClick={() => toast.success('Mensagem enviada com Sucesso!')}>
        Sucesso
      </Button>
      <Button onClick={() => toast.info('faça uma prova agora', { title: 'Notificação' })}>
        Info
      </Button>
      <Button onClick={() => toast.warning('Revise os dados antes de continuar')}>
        Warning
      </Button>
    </div>
  )
}

function ToastDemo() {
  return (
    <ToastProvider defaultDuration={0} maxToasts={4}>
      <ToastPreview />
      <ToastActions />
    </ToastProvider>
  )
}

function ToastPreview() {
  const { toast } = useToast()

  useEffect(() => {
    toast.warning('Revise os dados antes de continuar', { id: 'story-warning' })
    toast.info('faça uma prova agora', { title: 'Notificação', id: 'story-info' })
    toast.success('Mensagem enviada com Sucesso!', { id: 'story-success' })
    toast.error('Mensagem não encontrada', { title: 'Erro', id: 'story-error' })
  }, [toast])

  return null
}

function StackedToastDemo() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() => {
        toast.info('faça uma prova agora', { title: 'Notificação', id: 'story-info' })
        toast.success('Mensagem enviada com Sucesso!', { id: 'story-success' })
        toast.error('Mensagem não encontrada', { title: 'Erro', id: 'story-error' })
      }}
    >
      Mostrar pilha
    </Button>
  )
}

function StackedDemo() {
  return (
    <ToastProvider defaultDuration={0}>
      <StackedToastDemo />
    </ToastProvider>
  )
}

const meta: Meta<typeof ToastDemo> = {
  title: 'Componentes/Overlay/Toast',
  component: ToastDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
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

export const Variants: Story = {
  tags: ['!autodocs'],
}

export const Stack: Story = {
  render: () => <StackedDemo />,
}
