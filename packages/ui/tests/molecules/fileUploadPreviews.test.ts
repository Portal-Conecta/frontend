/**
 * Testes da política de revogação de blob URL do FileUpload (#326).
 *
 * Em wizards multi-etapa o componente desmonta ao trocar de passo, mas o pai
 * ainda guarda os itens — revogar no unmount quebrava a preview ao voltar.
 * A responsabilidade é: revogar só o que saiu de `value`, ou a lista inteira
 * no unmount do wizard via `revokeLocalFileUploadPreviews`.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  revokeLocalFileUploadPreviews,
  revokeRemovedFileUploadPreviews,
  type FileUploadItem,
} from '../../src/molecules/FileUpload/FileUpload'

afterEach(() => {
  vi.restoreAllMocks()
})

function item(id: string, previewUrl: string): FileUploadItem {
  return { id, previewUrl, name: `${id}.png` }
}

describe('revokeRemovedFileUploadPreviews', () => {
  it('não revoga blob URLs que ainda estão em value (trocar etapa e voltar)', () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const kept = item('a', 'blob:http://localhost/a')
    const alsoKept = item('b', 'blob:http://localhost/b')

    revokeRemovedFileUploadPreviews([kept, alsoKept], [kept, alsoKept])

    expect(revokeSpy).not.toHaveBeenCalled()
  })

  it('revoga só a blob URL do item removido de value', () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const kept = item('a', 'blob:http://localhost/a')
    const removed = item('b', 'blob:http://localhost/b')

    revokeRemovedFileUploadPreviews([kept, removed], [kept])

    expect(revokeSpy).toHaveBeenCalledTimes(1)
    expect(revokeSpy).toHaveBeenCalledWith('blob:http://localhost/b')
  })

  it('não revoga preview remota (https) ao remover item', () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const remote = item('r', 'https://cdn.example/foto.png')

    revokeRemovedFileUploadPreviews([remote], [])

    expect(revokeSpy).not.toHaveBeenCalled()
  })
})

describe('revokeLocalFileUploadPreviews', () => {
  it('revoga todas as blob URLs ao descartar o wizard', () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const local = item('a', 'blob:http://localhost/a')
    const remote = item('r', 'https://cdn.example/foto.png')

    revokeLocalFileUploadPreviews([local, remote])

    expect(revokeSpy).toHaveBeenCalledTimes(1)
    expect(revokeSpy).toHaveBeenCalledWith('blob:http://localhost/a')
  })
})
