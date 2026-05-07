import { describe, it, expect } from 'vitest'
import { isEstadoTransaccion, isEstadoTerminal } from './transaccion.types'

describe('isEstadoTransaccion', () => {
  it('accepts valid estados', () => {
    expect(isEstadoTransaccion('Pendiente')).toBe(true)
    expect(isEstadoTransaccion('Confirmada')).toBe(true)
    expect(isEstadoTransaccion('Rechazada')).toBe(true)
  })

  it('rejects invalid values', () => {
    expect(isEstadoTransaccion('Cancelada')).toBe(false)
    expect(isEstadoTransaccion(null)).toBe(false)
    expect(isEstadoTransaccion(undefined)).toBe(false)
    expect(isEstadoTransaccion(42)).toBe(false)
    expect(isEstadoTransaccion({})).toBe(false)
  })

  it('narrows the type when used in a guard', () => {
    const value: unknown = 'Confirmada'
    if (isEstadoTransaccion(value)) {
      expect(value.length).toBeGreaterThan(0)
    }
  })
})

describe('isEstadoTerminal', () => {
  it('returns true for Confirmada / Rechazada', () => {
    expect(isEstadoTerminal('Confirmada')).toBe(true)
    expect(isEstadoTerminal('Rechazada')).toBe(true)
  })

  it('returns false for Pendiente', () => {
    expect(isEstadoTerminal('Pendiente')).toBe(false)
  })
})
