import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { Button } from '../../atoms/Button'
import { Toast, type ToastItem, type ToastVariant } from './Toast'

const toastByVariant: Record<ToastVariant, ToastItem> = {
  error: {
    id: 'error',
    variant: 'error',
    title: 'Erro',
    message: 'Mensagem não encontrada',
    duration: 0,
  },
  success: {
    id: 'success',
    variant: 'success',
    message: 'Mensagem enviada com Sucesso!',
    duration: 0,
  },
  warning: {
    id: 'warning',
    variant: 'warning',
    message: 'Revise os dados antes de continuar',
    duration: 0,
  },
}

const toastItems = Object.values(toastByVariant)

const variantButtons: Array<{
  label: string
  variant: ToastVariant
  tone?: 'brand' | 'positive' | 'negative'
  className?: string
}> = [
  { label: 'Erro', variant: 'error', tone: 'negative' },
  { label: 'Sucesso', variant: 'success', tone: 'positive' },
  {
    label: 'Warning',
    variant: 'warning',
    className: '!bg-feedback-warning !text-text-primary hover:!bg-feedback-warning active:!bg-feedback-warning',
  },
]

function ToastDocsDemo() {
  const [selectedVariant, setSelectedVariant] = useState<ToastVariant>('error')
  const selectedToast = toastByVariant[selectedVariant]

  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-6 bg-background-default p-6">
      <div className="flex flex-wrap justify-center gap-3">
        {variantButtons.map(({ label, variant, tone, className }) => (
          <Button
            key={variant}
            {...(tone ? { tone } : {})}
            className={className}
            onClick={() => setSelectedVariant(variant)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="w-full max-w-md">
        <Toast toast={selectedToast} onDismiss={() => undefined} />
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

function ToastDocsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1>Toast</h1>
        <p>Toast mostra feedback temporário de ações com empilhamento, dismiss manual e região aria-live.</p>
      </div>

      <div className="overflow-hidden rounded-sm border-sm border-border-default bg-background-surface">
        <ToastDocsDemo />
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
      page: ToastDocsPage,
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
