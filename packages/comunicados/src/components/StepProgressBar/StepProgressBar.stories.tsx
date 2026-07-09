import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { Button } from '@portal/ui'

import { StepProgressBar } from './StepProgressBar'

const LABELS = ['Conteúdo', 'Destinatários', 'Publicação'] as const

const meta: Meta<typeof StepProgressBar> = {
  title: 'Comunicados/Molecules/StepProgressBar',
  component: StepProgressBar,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  args: {
    totalSteps: 3,
    currentStep: 0,
    labels: LABELS,
  },
}

export default meta
type Story = StoryObj<typeof StepProgressBar>

export const Etapa1: Story = {
  args: { currentStep: 0 },
}

export const Etapa2: Story = {
  args: { currentStep: 1 },
}

export const Etapa3: Story = {
  args: { currentStep: 2 },
}

function InteractiveDemo() {
  const [step, setStep] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      <StepProgressBar totalSteps={3} currentStep={step} labels={LABELS} />
      <div className="flex gap-2">
        <Button variant="outlined" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Voltar
        </Button>
        <Button onClick={() => setStep((s) => Math.min(2, s + 1))} disabled={step === 2}>
          Avançar
        </Button>
      </div>
    </div>
  )
}

export const Interativo: Story = {
  render: () => <InteractiveDemo />,
}
