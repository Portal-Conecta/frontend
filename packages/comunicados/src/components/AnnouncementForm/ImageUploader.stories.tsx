import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { ImageUploader } from './ImageUploader'
import type { ImageItem } from './types'

/** Swatch SVG como object-free preview (não depende de rede no Storybook). */
function swatch(color: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><rect width='100%' height='100%' fill='${color}'/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const sampleImages: ImageItem[] = [
  { id: 's1', previewUrl: swatch('#01258F'), name: 'capa.png' },
  { id: 's2', previewUrl: swatch('#3B82F6'), name: 'foto-1.png' },
  { id: 's3', previewUrl: swatch('#93C5FD'), name: 'foto-2.png' },
]

const meta: Meta<typeof ImageUploader> = {
  title: 'Comunicados/Organisms/ImageUploader',
  component: ImageUploader,
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
type Story = StoryObj<typeof ImageUploader>

function Demo({
  initial = [],
  maxImages,
  disabled,
  error,
}: {
  initial?: ImageItem[]
  maxImages?: number
  disabled?: boolean
  error?: string
}) {
  const [images, setImages] = useState<ImageItem[]>(initial)

  return (
    <ImageUploader
      value={images}
      onChange={setImages}
      disabled={disabled ?? false}
      {...(maxImages != null ? { maxImages } : {})}
      {...(error ? { error } : {})}
    />
  )
}

/** Vazio — clique na área grande (ou arraste) para enviar. */
export const Default: Story = { render: () => <Demo /> }

/** Com imagens: principal + miniaturas, cada uma removível. */
export const ComImagens: Story = { render: () => <Demo initial={sampleImages} /> }

/** Estado de erro (ex.: campo obrigatório). */
export const ComErro: Story = {
  render: () => <Demo error="Adicione ao menos uma imagem" />,
}

/** Desabilitado. */
export const Desabilitado: Story = {
  render: () => <Demo initial={sampleImages} disabled />,
}
