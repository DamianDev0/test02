import { describe, it, expect } from 'vitest'
import { parseBancos } from './banco.parse'

describe('parseBancos', () => {
  it('parses a valid list', () => {
    const result = parseBancos([
      { codigo: 'BANCOLOMBIA', nombre: 'Bancolombia' },
      { codigo: 'NEQUI', nombre: 'Nequi' },
    ])
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ codigo: 'BANCOLOMBIA', nombre: 'Bancolombia' })
  })

  it('rejects empty codigo', () => {
    expect(() => parseBancos([{ codigo: '', nombre: 'X' }])).toThrow()
  })

  it('rejects missing fields', () => {
    expect(() => parseBancos([{ codigo: 'X' }])).toThrow()
  })

  it('rejects non-array input', () => {
    expect(() => parseBancos({ codigo: 'X', nombre: 'Y' })).toThrow()
  })

  it('returns empty array for empty input', () => {
    expect(parseBancos([])).toEqual([])
  })
})
