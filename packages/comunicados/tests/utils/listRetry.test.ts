import { afterEach, describe, expect, it, vi } from 'vitest'

import { HttpError } from '@portal/core/http/errors'

import {
  LIST_RETRY_ATTEMPTS,
  isRetryableListError,
  withListRetry,
} from '../../src/utils/listRetry'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('listRetry', () => {
  it('classifica só server/network como retryable', () => {
    expect(isRetryableListError(new HttpError('server', 500))).toBe(true)
    expect(isRetryableListError(new HttpError('network'))).toBe(true)
    expect(isRetryableListError(new HttpError('forbidden', 403))).toBe(false)
    expect(isRetryableListError(new HttpError('validation', 400))).toBe(false)
    expect(isRetryableListError(new Error('boom'))).toBe(false)
  })

  it('retorna na primeira tentativa bem-sucedida', async () => {
    const load = vi.fn().mockResolvedValue({ ok: true })
    await expect(withListRetry(load)).resolves.toEqual({ ok: true })
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('retenta 5xx e resolve quando o back estabiliza', async () => {
    vi.useFakeTimers()
    const load = vi
      .fn()
      .mockRejectedValueOnce(new HttpError('server', 500))
      .mockRejectedValueOnce(new HttpError('server', 503))
      .mockResolvedValueOnce({ items: [] })

    const pending = withListRetry(load)
    await vi.runAllTimersAsync()

    await expect(pending).resolves.toEqual({ items: [] })
    expect(load).toHaveBeenCalledTimes(3)
  })

  it('não retenta forbidden e propaga na hora', async () => {
    const load = vi.fn().mockRejectedValue(new HttpError('forbidden', 403))
    await expect(withListRetry(load)).rejects.toMatchObject({ kind: 'forbidden' })
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('esgota as tentativas e propaga o último erro retryable', async () => {
    vi.useFakeTimers()
    const load = vi.fn().mockRejectedValue(new HttpError('server', 500))

    const pending = withListRetry(load)
    const expectation = expect(pending).rejects.toMatchObject({ kind: 'server', status: 500 })
    await vi.runAllTimersAsync()
    await expectation

    expect(load).toHaveBeenCalledTimes(LIST_RETRY_ATTEMPTS)
  })
})
