import { describe, it, expect } from 'vitest'
import { parseTransacciones } from './transaccion.parse'

const valid = {
  id: '01938e9c-4d3e-7c1a-b2c3-1234567890ab',
  cuentaId: '01938e9c-4d3e-7c1a-b2c3-1234567890ac',
  destino: '3001234567',
  monto: { monto: 50000, moneda: 'COP' },
  concepto: 'Almuerzo',
  estado: 'Confirmada' as const,
  creadaEn: '2026-05-06T10:00:00Z',
}

describe('parseTransacciones', () => {
  it('parses a valid transaction', () => {
    const [tx] = parseTransacciones([valid])
    expect(tx.id).toBe(valid.id)
    expect(tx.estado).toBe('Confirmada')
    expect(tx.monto.monto).toBe(50000)
  })

  it('rejects invalid uuid', () => {
    expect(() => parseTransacciones([{ ...valid, id: 'not-a-uuid' }])).toThrow()
  })

  it('rejects unknown estado', () => {
    expect(() => parseTransacciones([{ ...valid, estado: 'Cancelada' }])).toThrow()
  })

  it('parses Pendiente / Confirmada / Rechazada estados', () => {
    const result = parseTransacciones([
      { ...valid, estado: 'Pendiente' },
      { ...valid, estado: 'Confirmada' },
      { ...valid, estado: 'Rechazada' },
    ])
    expect(result.map((t) => t.estado)).toEqual(['Pendiente', 'Confirmada', 'Rechazada'])
  })
})
