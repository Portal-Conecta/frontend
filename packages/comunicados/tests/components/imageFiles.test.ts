/**
 * Testes da lógica pura de processamento de arquivos do `ImageUploader`.
 */
import { describe, expect, it } from 'vitest'

import {
  formatRejectionMessage,
  processImageFiles,
  type ImageFileRejection,
} from '../../src/components/AnnouncementForm/imageFiles'

function file(name: string, type: string): File {
  return new File(['x'], name, { type })
}

describe('processImageFiles', () => {
  it('aceita apenas imagens', () => {
    const result = processImageFiles(
      [file('foto.png', 'image/png'), file('doc.pdf', 'application/pdf')],
      5,
    )

    expect(result.accepted).toHaveLength(1)
    expect(result.accepted[0]?.name).toBe('foto.png')
    expect(result.rejected).toEqual([{ file: expect.any(File), reason: 'not-image' }])
    expect(result.rejected[0]?.file.name).toBe('doc.pdf')
  })

  it('limita ao remaining e rejeita o excedente', () => {
    const files = [
      file('a.png', 'image/png'),
      file('b.png', 'image/png'),
      file('c.png', 'image/png'),
    ]
    const result = processImageFiles(files, 2)

    expect(result.accepted.map((item) => item.name)).toEqual(['a.png', 'b.png'])
    expect(result.rejected).toHaveLength(1)
    expect(result.rejected[0]?.reason).toBe('limit-exceeded')
    expect(result.rejected[0]?.file.name).toBe('c.png')
  })

  it('retorna vazio quando remaining é zero', () => {
    const result = processImageFiles([file('a.png', 'image/png')], 0)
    expect(result).toEqual({ accepted: [], rejected: [] })
  })

  it('retorna vazio quando files é null', () => {
    expect(processImageFiles(null, 5)).toEqual({ accepted: [], rejected: [] })
  })
})

describe('formatRejectionMessage', () => {
  it('formata rejeição por tipo não-imagem', () => {
    const rejections: ImageFileRejection[] = [
      { file: file('a.pdf', 'application/pdf'), reason: 'not-image' },
    ]
    expect(formatRejectionMessage(rejections, 5)).toBe('1 arquivo não é uma imagem.')
  })

  it('formata rejeição por limite excedido', () => {
    const rejections: ImageFileRejection[] = [
      { file: file('c.png', 'image/png'), reason: 'limit-exceeded' },
      { file: file('d.png', 'image/png'), reason: 'limit-exceeded' },
    ]
    expect(formatRejectionMessage(rejections, 5)).toBe(
      '2 arquivos excederam o limite de 5 imagens.',
    )
  })

  it('combina os dois motivos', () => {
    const rejections: ImageFileRejection[] = [
      { file: file('a.pdf', 'application/pdf'), reason: 'not-image' },
      { file: file('c.png', 'image/png'), reason: 'limit-exceeded' },
    ]
    expect(formatRejectionMessage(rejections, 5)).toBe(
      '1 arquivo não é uma imagem. 1 arquivo excedeu o limite de 5 imagens.',
    )
  })

  it('retorna null quando não há rejeições', () => {
    expect(formatRejectionMessage([], 5)).toBeNull()
  })
})
