import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  comunicadosGatewayPath,
  resolveApiGatewayUrl,
} from '../../src/services/comunicadosGateway'

describe('comunicadosGateway', () => {
  beforeEach(() => {
    process.env.API_GATEWAY_URL = 'http://localhost:8081'
  })

  afterEach(() => {
    delete process.env.API_GATEWAY_URL
  })

  it('monta path com prefixo /comunicados', () => {
    expect(comunicadosGatewayPath('/api/posts/publish')).toBe('/comunicados/api/posts/publish')
  })

  it('resolve base URL do gateway', () => {
    expect(resolveApiGatewayUrl()).toBe('http://localhost:8081')
  })

  it('falha quando API_GATEWAY_URL não está configurada', () => {
    delete process.env.API_GATEWAY_URL
    expect(() => resolveApiGatewayUrl()).toThrow('API_GATEWAY_URL não configurada')
  })
})
