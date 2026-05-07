import { describe, it, expect } from 'vitest'
import { parseNumeroCelular, formatNumeroCelular } from './numero-celular'

describe('parseNumeroCelular', () => {
  it('accepts valid Colombian mobile (3 + 9 digits)', () => {
    expect(parseNumeroCelular('3001234567')).toBe('3001234567')
  })

  it('strips spaces and dashes', () => {
    expect(parseNumeroCelular('300 123-4567')).toBe('3001234567')
  })

  it('rejects numbers not starting with 3', () => {
    expect(() => parseNumeroCelular('2001234567')).toThrow()
  })

  it('rejects wrong length', () => {
    expect(() => parseNumeroCelular('300123456')).toThrow()
    expect(() => parseNumeroCelular('30012345678')).toThrow()
  })
})

describe('formatNumeroCelular', () => {
  it('formats as "300 123 4567"', () => {
    const num = parseNumeroCelular('3001234567')
    expect(formatNumeroCelular(num)).toBe('300 123 4567')
  })
})
