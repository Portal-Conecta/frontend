/**
 * Testes do service server de execuções (`services/server/executionService`).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@portal/core/auth/session', () => ({
  getSession: () => Promise.resolve('jwt-token'),
}))

import {
  cancelExecution,
  createDraft,
  findExecutionById,
  listExecutionHistoryByClass,
  listExecutions,
  submitExecution,
  updateExecutionAnswers,
} from '../../../src/services/server/executionService'
import type { ChecklistExecutionResponse } from '../../../src/types/execution'

const API_GATEWAY_URL = 'https://gateway.test'

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

const pageResponse = {
  content: [execution],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 20,
  first: true,
  last: true,
  empty: false,
}

beforeEach(() => {
  process.env.API_GATEWAY_URL = API_GATEWAY_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.API_GATEWAY_URL
})

describe('createDraft', () => {
  it('faz POST em /checklist/api/checklist-executions/drafts com o corpo e Bearer', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(201, execution))

    await expect(
      createDraft({ templateId: 't1', roomId: 'r1', classId: 'c1', checklistType: 'ARRIVAL' }),
    ).resolves.toEqual(execution)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/checklist/api/checklist-executions/drafts`)
    expect(init?.method).toBe('POST')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-token')
    expect(JSON.parse(init?.body as string)).toEqual({
      templateId: 't1',
      roomId: 'r1',
      classId: 'c1',
      checklistType: 'ARRIVAL',
    })
  })

  it('mapeia 403 para HttpError forbidden', async () => {
    stubFetch().mockResolvedValue(response(403, {}))
    await expect(
      createDraft({ templateId: 't1', roomId: 'r1', classId: 'c1', checklistType: 'ARRIVAL' }),
    ).rejects.toMatchObject({ kind: 'forbidden' })
  })
})

describe('submitExecution', () => {
  it('faz POST em /{id}/submit com as respostas', async () => {
    const fetchMock = stubFetch()
    const submitted = { ...execution, status: 'SUBMITTED' as const, complianceScore: 100 }
    fetchMock.mockResolvedValue(response(200, submitted))

    const answers = [{ itemKey: 'oleo', value: 'COMPLIANT' as const }]
    await expect(submitExecution('e1', { answers })).resolves.toMatchObject({ status: 'SUBMITTED' })

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/checklist/api/checklist-executions/e1/submit`)
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({ answers })
  })

  it('preserva status 409 quando a execução já foi submetida/cancelada', async () => {
    stubFetch().mockResolvedValue(response(409, {}))
    await expect(submitExecution('e1', { answers: [] })).rejects.toMatchObject({ status: 409 })
  })
})

describe('cancelExecution', () => {
  it('faz PATCH em /{id}/cancel', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, { ...execution, status: 'CANCELED' }))

    await expect(cancelExecution('e1')).resolves.toMatchObject({ status: 'CANCELED' })

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/checklist/api/checklist-executions/e1/cancel`)
    expect(init?.method).toBe('PATCH')
  })

  it('mapeia 404 para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(cancelExecution('missing')).rejects.toMatchObject({ kind: 'not_found' })
  })
})

describe('findExecutionById', () => {
  it('faz GET em /{id}', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, execution))

    await expect(findExecutionById('e1')).resolves.toEqual(execution)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/checklist/api/checklist-executions/e1`)
    expect(init?.method).toBe('GET')
  })
})

describe('listExecutions', () => {
  it('faz GET paginado com os valores default (page=0, size=20)', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, pageResponse))

    await expect(listExecutions()).resolves.toEqual(pageResponse)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/checklist/api/checklist-executions?page=0&size=20`)
    expect(init?.method).toBe('GET')
  })

  it('repassa page/size customizados', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, pageResponse))

    await listExecutions(2, 50)

    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/checklist/api/checklist-executions?page=2&size=50`)
  })

  it('mapeia erro de rede para HttpError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(listExecutions()).rejects.toMatchObject({ kind: 'network' })
  })
})

describe('listExecutionHistoryByClass', () => {
  it('faz GET em /history/class/{classId} paginado', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, pageResponse))

    await expect(listExecutionHistoryByClass('c1')).resolves.toEqual(pageResponse)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(
      `${API_GATEWAY_URL}/checklist/api/checklist-executions/history/class/c1?page=0&size=20`,
    )
    expect(init?.method).toBe('GET')
  })

  it('mapeia 404 (turma não existe) para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(listExecutionHistoryByClass('missing')).rejects.toMatchObject({
      kind: 'not_found',
    })
  })
})

describe('updateExecutionAnswers', () => {
  it('faz PATCH em /{id}/answers com as respostas', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, execution))

    const answers = [{ itemKey: 'oleo', value: 'NON_COMPLIANT' as const, observation: 'vazando' }]
    await expect(updateExecutionAnswers('e1', { answers })).resolves.toEqual(execution)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/checklist/api/checklist-executions/e1/answers`)
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(init?.body as string)).toEqual({ answers })
  })

  it('preserva status 409 quando a execução não está SUBMITTED', async () => {
    stubFetch().mockResolvedValue(response(409, {}))
    await expect(updateExecutionAnswers('e1', { answers: [] })).rejects.toMatchObject({
      status: 409,
    })
  })
})
