import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import {
  MAPA_SALA_GATEWAY_PREFIX,
  resolveApiGatewayUrl,
  mapaSalaGatewayPath,
} from '../../src/services/mapaSalaGateway'

const ORIGINAL_ENV = process.env

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

afterEach(() => {
  process.env = ORIGINAL_ENV
})

describe('resolveApiGatewayUrl', () => {
  it('retorna a URL sem barra final', () => {
    process.env.API_GATEWAY_URL = 'http://localhost:8080/'
    expect(resolveApiGatewayUrl()).toBe('http://localhost:8080')
  })

  it('retorna a URL intacta se não tem barra final', () => {
    process.env.API_GATEWAY_URL = 'http://localhost:8080'
    expect(resolveApiGatewayUrl()).toBe('http://localhost:8080')
  })

  it('throw quando API_GATEWAY_URL não está configurada', () => {
    delete process.env.API_GATEWAY_URL
    expect(() => resolveApiGatewayUrl()).toThrow('API_GATEWAY_URL não configurada')
  })
})

describe('mapaSalaGatewayPath', () => {
  it('prefixa o path com /mapa', () => {
    expect(mapaSalaGatewayPath('/api/mapas')).toBe('/mapa/api/mapas')
  })

  it('adiciona barra se o path não começa com /', () => {
    expect(mapaSalaGatewayPath('api/mapas')).toBe('/mapa/api/mapas')
  })

  it('usa o prefixo constante exportado', () => {
    expect(MAPA_SALA_GATEWAY_PREFIX).toBe('/mapa')
  })
})