import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'
import { PATCH } from '../issues/[id]/cancel/route'
import { cancelIssue } from '@portal/checklist/services/server/issueService'
import { bffErrorResponse } from '../_lib/bffError'

vi.mock('@portal/checklist/services/server/issueService', () => ({
  cancelIssue: vi.fn(),
}))

vi.mock('../_lib/bffError', () => ({
  bffErrorResponse: vi.fn(),
}))

vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((data) => ({ status: 200, json: async () => data })),
    },
  }
})

describe('PATCH /api/checklist/issues/[id]/cancel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve chamar cancelIssue e retornar o resultado com sucesso', async () => {
    const mockData = { id: '123', status: 'CANCELED' }
    vi.mocked(cancelIssue).mockResolvedValue(mockData as never)

    const req = {} as Request
    const params = Promise.resolve({ id: '123' })

    const response = await PATCH(req, { params })

    expect(cancelIssue).toHaveBeenCalledWith('123')
    expect(NextResponse.json).toHaveBeenCalledWith(mockData)
    expect(response).toEqual({ status: 200, json: expect.any(Function) })
  })

  it('deve chamar bffErrorResponse em caso de erro', async () => {
    const mockError = new Error('Erro ao cancelar')
    vi.mocked(cancelIssue).mockRejectedValue(mockError)
    
    const mockErrorResponse = { status: 500, data: 'Error' } as never
    vi.mocked(bffErrorResponse).mockReturnValue(mockErrorResponse)

    const req = {} as Request
    const params = Promise.resolve({ id: '123' })

    const response = await PATCH(req, { params })

    expect(cancelIssue).toHaveBeenCalledWith('123')
    expect(bffErrorResponse).toHaveBeenCalledWith(mockError)
    expect(response).toBe(mockErrorResponse)
  })
})
