/**
 * Testes da lógica pura de processamento de arquivos do `FileUpload`.
 */
import { describe, expect, it } from 'vitest'

import {
  formatRejectionMessage,
  processFiles,
  type FileRejection,
} from '../../src/molecules/FileUpload/fileValidation'

function file(name: string, type: string, size = 1): File {
  return new File([new Uint8Array(size)], name, { type })
}

describe('processFiles', () => {
  it('aceita apenas o que casa com accept (default image/*)', () => {
    const result = processFiles(
      [file('foto.png', 'image/png'), file('doc.pdf', 'application/pdf')],
      5,
    )

    expect(result.accepted).toHaveLength(1)
    expect(result.accepted[0]?.name).toBe('foto.png')
    expect(result.rejected).toEqual([{ file: expect.any(File), reason: 'invalid-type' }])
    expect(result.rejected[0]?.file.name).toBe('doc.pdf')
  })

  it('aceita padrão accept customizado', () => {
    const result = processFiles(
      [file('doc.pdf', 'application/pdf'), file('foto.png', 'image/png')],
      5,
      'application/pdf',
    )

    expect(result.accepted.map((item) => item.name)).toEqual(['doc.pdf'])
    expect(result.rejected[0]?.reason).toBe('invalid-type')
  })

  it('limita ao remaining e rejeita o excedente', () => {
    const files = [
      file('a.png', 'image/png'),
      file('b.png', 'image/png'),
      file('c.png', 'image/png'),
    ]
    const result = processFiles(files, 2)

    expect(result.accepted.map((item) => item.name)).toEqual(['a.png', 'b.png'])
    expect(result.rejected).toHaveLength(1)
    expect(result.rejected[0]?.reason).toBe('limit-exceeded')
    expect(result.rejected[0]?.file.name).toBe('c.png')
  })

  it('rejeita arquivo acima de maxSize', () => {
    const result = processFiles(
      [file('grande.png', 'image/png', 2048), file('pequeno.png', 'image/png', 10)],
      5,
      'image/*',
      1024,
    )

    expect(result.accepted.map((item) => item.name)).toEqual(['pequeno.png'])
    expect(result.rejected).toEqual([{ file: expect.any(File), reason: 'too-large' }])
    expect(result.rejected[0]?.file.name).toBe('grande.png')
  })

  it('retorna vazio quando remaining é zero', () => {
    const result = processFiles([file('a.png', 'image/png')], 0)
    expect(result).toEqual({ accepted: [], rejected: [] })
  })

  it('retorna vazio quando files é null', () => {
    expect(processFiles(null, 5)).toEqual({ accepted: [], rejected: [] })
  })
})

describe('formatRejectionMessage', () => {
  it('formata rejeição por tipo inválido', () => {
    const rejections: FileRejection[] = [
      { file: file('a.pdf', 'application/pdf'), reason: 'invalid-type' },
    ]
    expect(formatRejectionMessage(rejections, 5)).toBe('1 arquivo tem um formato não aceito.')
  })

  it('formata rejeição por tamanho excedido', () => {
    const rejections: FileRejection[] = [
      { file: file('a.png', 'image/png'), reason: 'too-large' },
    ]
    expect(formatRejectionMessage(rejections, 5)).toBe('1 arquivo excedeu o tamanho máximo.')
  })

  it('formata rejeição por limite excedido', () => {
    const rejections: FileRejection[] = [
      { file: file('c.png', 'image/png'), reason: 'limit-exceeded' },
      { file: file('d.png', 'image/png'), reason: 'limit-exceeded' },
    ]
    expect(formatRejectionMessage(rejections, 5)).toBe(
      '2 arquivos excederam o limite de 5 arquivos.',
    )
  })

  it('combina os três motivos', () => {
    const rejections: FileRejection[] = [
      { file: file('a.pdf', 'application/pdf'), reason: 'invalid-type' },
      { file: file('b.png', 'image/png'), reason: 'too-large' },
      { file: file('c.png', 'image/png'), reason: 'limit-exceeded' },
    ]
    expect(formatRejectionMessage(rejections, 5)).toBe(
      '1 arquivo tem um formato não aceito. 1 arquivo excedeu o tamanho máximo. 1 arquivo excedeu o limite de 5 arquivos.',
    )
  })

  it('retorna null quando não há rejeições', () => {
    expect(formatRejectionMessage([], 5)).toBeNull()
  })
})
