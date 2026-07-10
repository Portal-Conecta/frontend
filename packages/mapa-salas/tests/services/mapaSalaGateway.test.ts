import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  mapaSalaGatewayPath,
  resolveApiGatewayUrl,
} from '../../src/services/mapaSalaGateway'

describe('mapaSalaGateway', () => {
  beforeEach(() => {
    process.env.API_GATEWAY_URL = 'http://localhost:8081'
  })

  afterEach(() => {
    delete process.env.API_GATEWAY_URL
  })

  it('monta path com prefixo /mapa', () => {
    expect(mapaSalaGatewayPath('/api/mapas')).toBe('/mapa/api/mapas')
  })

  it('resolve base URL do gateway', () => {
    expect(resolveApiGatewayUrl()).toBe('http://localhost:8081')
  })

  it('falha quando API_GATEWAY_URL não está configurada', () => {
    delete process.env.API_GATEWAY_URL
    expect(() => resolveApiGatewayUrl()).toThrow('API_GATEWAY_URL não configurada')
  })
})
