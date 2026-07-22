import type { Meta, StoryObj } from '@storybook/react'
import { useState, type ComponentProps } from 'react'

import { RichTextContent } from './RichTextContent'
import { RichTextEditor } from './RichTextEditor'

const meta: Meta<typeof RichTextEditor> = {
  title: 'Componentes/Inputs/RichTextEditor',
  component: RichTextEditor,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof RichTextEditor>

function ControlledEditor(props: Partial<ComponentProps<typeof RichTextEditor>>) {
  const [value, setValue] = useState(props.value ?? '<p></p>')
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <RichTextEditor
        value={value}
        onChange={setValue}
        placeholder="Descreva aqui os detalhes…"
        {...props}
      />
      <RichTextContent html={value} aria-label="Prévia" />
    </div>
  )
}

export const Default: Story = {
  render: () => <ControlledEditor />,
}

export const WithContent: Story = {
  render: () => (
    <ControlledEditor value="<p>Comunicado com <strong>negrito</strong>, <em>itálico</em> e <u>sublinhado</u>.</p><ul><li>Item um</li><li>Item dois</li></ul>" />
  ),
}

export const WithError: Story = {
  render: () => <ControlledEditor error="A descrição é obrigatória." value="<p></p>" />,
}

export const Disabled: Story = {
  render: () => <ControlledEditor disabled value="<p>Edição desabilitada.</p>" />,
}
