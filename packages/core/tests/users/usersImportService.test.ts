import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HttpError } from '@portal/core/http/errors'
import { getUserImportTemplate, importUsers } from '@portal/core/users/usersImportService'
import type { UserImportResult } from '@portal/core/users/types'

const API_GATEWAY_URL = 'https://gateway.test'
const TOKEN = 'jwt-token'

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

function blobResponse(status: number, blob: Blob): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({}),
    blob: async () => blob,
  } as unknown as Response
}

function stubFetch() {
  const mock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', mock)
  return mock
}

beforeEach(() => {
  process.env.API_GATEWAY_URL = API_GATEWAY_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.API_GATEWAY_URL
})

const importResult: UserImportResult = {
  dryRun: false,
  created: 2,
  skipped: 1,
  rows: [
    { line: 1, status: 'CREATED', message: 'ok' },
    { line: 2, status: 'CREATED', message: 'ok' },
    { line: 3, status: 'SKIPPED', message: 'e-mail já cadastrado' },
  ],
}

describe('importUsers', () => {
  it('envia POST multipart para /hub/imports/users com onExisting/dryRun na query', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(jsonResponse(200, importResult))

    const file = new Blob(['name,email\nAna,ana@x.com'], { type: 'text/csv' })
    await expect(
      importUsers(file, 'planilha.csv', { onExisting: 'SKIP', dryRun: true }, TOKEN),
    ).resolves.toEqual(importResult)

    const [url, init] = fetchMock.mock.calls[0]!
    const parsed = new URL(url as string)
    expect(parsed.pathname).toBe('/hub/imports/users')
    expect(parsed.searchParams.get('onExisting')).toBe('SKIP')
    expect(parsed.searchParams.get('dryRun')).toBe('true')
    expect(init?.method).toBe('POST')
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` })
    expect(init?.body).toBeInstanceOf(FormData)
  })

  it('mapeia 422 (planilha inválida) para HttpError validation', async () => {
    stubFetch().mockResolvedValue(jsonResponse(422, { message: 'Colunas obrigatórias ausentes.' }))

    const file = new Blob(['x'], { type: 'text/csv' })
    await expect(
      importUsers(file, 'planilha.csv', { onExisting: 'REJECT', dryRun: false }, TOKEN),
    ).rejects.toMatchObject({
      kind: 'validation',
      status: 422,
      body: { message: 'Colunas obrigatórias ausentes.' },
    })
  })

  it('mapeia 401 para HttpError unauthorized', async () => {
    stubFetch().mockResolvedValue(jsonResponse(401, {}))

    const file = new Blob(['x'], { type: 'text/csv' })
    await expect(
      importUsers(file, 'planilha.csv', { onExisting: 'REJECT', dryRun: false }, TOKEN),
    ).rejects.toMatchObject({ kind: 'unauthorized' })
  })

  it('mapeia falha de rede para HttpError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('fetch failed'))

    const file = new Blob(['x'], { type: 'text/csv' })
    const error = await importUsers(
      file,
      'planilha.csv',
      { onExisting: 'REJECT', dryRun: false },
      TOKEN,
    ).catch((e) => e)

    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ kind: 'network' })
  })

  it('lança HttpError server quando API_GATEWAY_URL não está configurada', async () => {
    delete process.env.API_GATEWAY_URL
    const file = new Blob(['x'], { type: 'text/csv' })

    const error = await importUsers(
      file,
      'planilha.csv',
      { onExisting: 'REJECT', dryRun: false },
      TOKEN,
    ).catch((e) => e)

    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ kind: 'server' })
  })
})

describe('getUserImportTemplate', () => {
  it('busca o modelo em /hub/imports/templates/users e devolve um blob', async () => {
    const fetchMock = stubFetch()
    const templateBlob = new Blob(['name,email'], { type: 'text/csv' })
    fetchMock.mockResolvedValue(blobResponse(200, templateBlob))

    await expect(getUserImportTemplate(TOKEN)).resolves.toBe(templateBlob)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/imports/templates/users`)
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` })
  })

  it('mapeia 500 para HttpError server', async () => {
    stubFetch().mockResolvedValue(jsonResponse(500, {}))

    await expect(getUserImportTemplate(TOKEN)).rejects.toMatchObject({ kind: 'server' })
  })

  it('mapeia falha de rede para HttpError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('fetch failed'))

    const error = await getUserImportTemplate(TOKEN).catch((e) => e)
    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ kind: 'network' })
  })
})
