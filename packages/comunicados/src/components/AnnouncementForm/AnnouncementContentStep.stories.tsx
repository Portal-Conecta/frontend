import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { AnnouncementContentStep } from './AnnouncementContentStep'
import { EMPTY_ANNOUNCEMENT_CONTENT, type AnnouncementContentValue } from './types'

const meta: Meta<typeof AnnouncementContentStep> = {
  title: 'Comunicados/Organisms/AnnouncementContentStep',
  component: AnnouncementContentStep,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AnnouncementContentStep>

function Demo({ initial = EMPTY_ANNOUNCEMENT_CONTENT }: { initial?: AnnouncementContentValue }) {
  const [content, setContent] = useState<AnnouncementContentValue>(initial)
  return <AnnouncementContentStep value={content} onChange={setContent} />
}

export const Default: Story = { render: () => <Demo /> }

export const ComErros: Story = {
  render: () => {
    function DemoErros() {
      const [content, setContent] = useState<AnnouncementContentValue>(EMPTY_ANNOUNCEMENT_CONTENT)
      return (
        <AnnouncementContentStep
          value={content}
          onChange={setContent}
          errors={{
            images: 'Adicione ao menos uma imagem',
            title: 'O título é obrigatório',
            description: 'A descrição é obrigatória',
          }}
        />
      )
    }
    return <DemoErros />
  },
}
