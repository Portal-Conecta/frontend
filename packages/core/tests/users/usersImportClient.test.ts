import { afterEach, describe, expect, it, vi } from 'vitest'

import { HttpError } from '@portal/core/http/errors'
import { importUsersClient, USER_IMPORT_TEMPLATE_URL } from '@portal/core/users/usersImportClient'
import type { UserImportResult } from '@portal/core/users/types'

function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

function stubFetch() {
  const mock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', mock)
  return mock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

const importResult: UserImportResult = {
  dryRun: false,
  created: 1,
  skipped: 0,
  rows: [{ line: 1, status: 'CREATED', message: 'ok' }],
}

describe('importUsersClient', () => {
  it('envia POST multipart para /api/imports/users com o arquivo e as opções', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, importResult))

    const file = new File(['name,email\nAna,ana@x.com'], 'planilha.csv', { type: 'text/csv' })
    await expect(
      importUsersClient(file, { onExisting: 'SKIP', dryRun: true }),
    ).resolves.toEqual(importResult)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/imports/users')
    expect(init?.method).toBe('POST')
    expect(init?.body).toBeInstanceOf(FormData)

    const body = init?.body as FormData
    expect(body.get('onExisting')).toBe('SKIP')
    expect(body.get('dryRun')).toBe('true')
    expect(body.get('file')).toBe(file)
  })

  it('mapeia 422 (planilha inválida) para HttpError validation', async () => {
    stubFetch().mockResolvedValue(response(422, { message: 'Colunas obrigatórias ausentes.' }))

    const file = new File(['x'], 'planilha.csv', { type: 'text/csv' })
    await expect(
      importUsersClient(file, { onExisting: 'REJECT', dryRun: false }),
    ).rejects.toMatchObject({ kind: 'validation', status: 422 })
  })

  it('mapeia 401 para HttpError unauthorized', async () => {
    stubFetch().mockResolvedValue(response(401, {}))

    const file = new File(['x'], 'planilha.csv', { type: 'text/csv' })
    await expect(
      importUsersClient(file, { onExisting: 'REJECT', dryRun: false }),
    ).rejects.toMatchObject({ kind: 'unauthorized' })
  })

  it('mapeia falha de rede para HttpError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('fetch failed'))

    const file = new File(['x'], 'planilha.csv', { type: 'text/csv' })
    const error = await importUsersClient(file, { onExisting: 'REJECT', dryRun: false }).catch(
      (e) => e,
    )

    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ kind: 'network' })
  })
})

describe('USER_IMPORT_TEMPLATE_URL', () => {
  it('aponta para a rota BFF do modelo de importação', () => {
    expect(USER_IMPORT_TEMPLATE_URL).toBe('/api/imports/templates/users')
  })
})
