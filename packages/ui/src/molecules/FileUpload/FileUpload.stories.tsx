import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { FileUpload } from './FileUpload'
import type { FileUploadItem } from './FileUpload'

/** Swatch SVG como object-free preview (não depende de rede no Storybook). */
function swatch(color: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><rect width='100%' height='100%' fill='${color}'/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const sampleFiles: FileUploadItem[] = [
  { id: 's1', previewUrl: swatch('#01258F'), name: 'capa.png' },
  { id: 's2', previewUrl: swatch('#3B82F6'), name: 'foto-1.png' },
  { id: 's3', previewUrl: swatch('#93C5FD'), name: 'foto-2.png' },
]

const meta: Meta<typeof FileUpload> = {
  title: 'Componentes/Inputs/FileUpload',
  component: FileUpload,
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
type Story = StoryObj<typeof FileUpload>

function Demo({
  initial = [],
  maxFiles,
  maxSize,
  disabled,
  error,
}: {
  initial?: FileUploadItem[]
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  error?: string
}) {
  const [files, setFiles] = useState<FileUploadItem[]>(initial)

  return (
    <FileUpload
      value={files}
      onChange={setFiles}
      disabled={disabled ?? false}
      {...(maxFiles != null ? { maxFiles } : {})}
      {...(maxSize != null ? { maxSize } : {})}
      {...(error ? { error } : {})}
    />
  )
}

/** Vazio — clique na área grande (ou arraste) para enviar. */
export const Default: Story = { render: () => <Demo /> }

/** Com arquivos: principal + miniaturas, cada um removível. */
export const ComArquivos: Story = { render: () => <Demo initial={sampleFiles} /> }

/** Estado de erro (ex.: campo obrigatório ou rejeição de tipo/tamanho). */
export const ComErro: Story = {
  render: () => <Demo error="Adicione ao menos um arquivo" />,
}

/** Desabilitado. */
export const Desabilitado: Story = {
  render: () => <Demo initial={sampleFiles} disabled />,
}

/** Limite cheio — anexar mais arquivos exibe mensagem de rejeição. */
export const LimiteAtingido: Story = {
  render: () => (
    <Demo
      initial={[
        { id: '1', previewUrl: swatch('#01258F'), name: '1.png' },
        { id: '2', previewUrl: swatch('#3B82F6'), name: '2.png' },
        { id: '3', previewUrl: swatch('#93C5FD'), name: '3.png' },
        { id: '4', previewUrl: swatch('#60A5FA'), name: '4.png' },
        { id: '5', previewUrl: swatch('#2563EB'), name: '5.png' },
      ]}
      maxFiles={5}
    />
  ),
}

/** Tamanho máximo por arquivo — rejeita arquivos acima de 1 KB nesta story de demonstração. */
export const ComTamanhoMaximo: Story = {
  render: () => <Demo maxSize={1024} />,
}
