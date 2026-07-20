/**
 * Testes do service client de execuções (`services/client/executionClient`).
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createDraftClient,
  findExecutionByIdClient,
  saveDraftAnswersClient,
  submitExecutionClient,
  updateExecutionAnswersClient,
} from '../../../src/services/client/executionClient'
import type { ChecklistExecutionResponse } from '../../../src/types/execution'

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

const execution: ChecklistExecutionResponse = {
  id: 'e1',
  templateId: 't1',
  templateVersion: 1,
  roomId: 'r1',
  classId: 'c1',
  filledBy: 'u1',
  period: 'MORNING',
  checklistType: 'ARRIVAL',
  status: 'DRAFT',
  answersJson: { answers: [], summary: { totalItems: 0, answeredItems: 0, compliantItems: 0, nonCompliantItems: 0 } },
  summary: { totalItems: 0, answeredItems: 0, compliantItems: 0, nonCompliantItems: 0 },
  startedAt: '2026-01-01T00:00:00.000Z',
  issues: [],
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createDraftClient', () => {
  it('faz POST em /api/checklist/executions/drafts com o corpo', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(201, execution))

    await expect(
      createDraftClient({ templateId: 't1', roomId: 'r1', classId: 'c1', checklistType: 'ARRIVAL' }),
    ).resolves.toEqual(execution)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/checklist/executions/drafts')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({
      templateId: 't1',
      roomId: 'r1',
      classId: 'c1',
      checklistType: 'ARRIVAL',
    })
  })

  it('mapeia 400 (fora da janela de submissão ou duplicado) para HttpError', async () => {
    stubFetch().mockResolvedValue(response(400, {}))
    await expect(
      createDraftClient({ templateId: 't1', roomId: 'r1', classId: 'c1', checklistType: 'ARRIVAL' }),
    ).rejects.toMatchObject({ status: 400 })
  })
})

describe('findExecutionByIdClient', () => {
  it('faz GET em /api/checklist/executions/{id}', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, execution))

    await expect(findExecutionByIdClient('e1')).resolves.toEqual(execution)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/checklist/executions/e1')
    expect(init?.method).toBeUndefined()
  })
})

describe('saveDraftAnswersClient', () => {
  it('faz PATCH em /{id}/draft com as respostas parciais', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, execution))

    const answers = [{ itemKey: 'oleo', value: 'COMPLIANT' as const }]
    await expect(saveDraftAnswersClient('e1', { answers })).resolves.toEqual(execution)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/checklist/executions/e1/draft')
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(init?.body as string)).toEqual({ answers })
  })

  it('mapeia 409 (execução travada por issue não validada) para HttpError', async () => {
    stubFetch().mockResolvedValue(response(409, {}))
    await expect(saveDraftAnswersClient('e1', { answers: [] })).rejects.toMatchObject({
      status: 409,
    })
  })
})

describe('submitExecutionClient', () => {
  it('faz POST em /{id}/submit com as respostas', async () => {
    const fetchMock = stubFetch()
    const submitted = { ...execution, status: 'SUBMITTED' as const, complianceScore: 100 }
    fetchMock.mockResolvedValue(response(200, submitted))

    const answers = [{ itemKey: 'oleo', value: 'COMPLIANT' as const }]
    await expect(submitExecutionClient('e1', { answers })).resolves.toMatchObject({
      status: 'SUBMITTED',
    })

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/checklist/executions/e1/submit')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({ answers })
  })
})

describe('updateExecutionAnswersClient', () => {
  it('faz PATCH em /{id}/answers com as respostas', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, execution))

    const answers = [{ itemKey: 'oleo', value: 'NON_COMPLIANT' as const, observation: 'vazando' }]
    await expect(updateExecutionAnswersClient('e1', { answers })).resolves.toEqual(execution)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/checklist/executions/e1/answers')
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(init?.body as string)).toEqual({ answers })
  })

  it('mapeia 409 (item travado por issue não validada) para HttpError', async () => {
    stubFetch().mockResolvedValue(response(409, {}))
    await expect(updateExecutionAnswersClient('e1', { answers: [] })).rejects.toMatchObject({
      status: 409,
    })
  })
})
