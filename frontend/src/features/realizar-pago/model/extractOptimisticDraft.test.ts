import { describe, it, expect } from 'vitest'
import { extractOptimisticDraft } from './extractOptimisticDraft'

function makeFD(entries: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(entries)) fd.set(k, v)
  return fd
}

describe('extractOptimisticDraft', () => {
  it('returns draft when celular + monto válidos', () => {
    expect(
      extractOptimisticDraft(
        makeFD({ celularDestino: '3001234567', monto: '50000', concepto: 'Almuerzo' }),
      ),
    ).toEqual({ destino: '3001234567', monto: 50000, concepto: 'Almuerzo' })
  })

  it('returns null when celular inválido', () => {
    expect(extractOptimisticDraft(makeFD({ celularDestino: '123', monto: '50000', concepto: 'x' }))).toBeNull()
  })

  it('returns null when monto <= 0', () => {
    expect(extractOptimisticDraft(makeFD({ celularDestino: '3001234567', monto: '0', concepto: 'x' }))).toBeNull()
  })

  it('returns null when monto missing', () => {
    expect(extractOptimisticDraft(makeFD({ celularDestino: '3001234567', concepto: 'x' }))).toBeNull()
  })

  it('returns draft with empty concepto if missing', () => {
    const draft = extractOptimisticDraft(makeFD({ celularDestino: '3001234567', monto: '100' }))
    expect(draft?.concepto).toBe('')
  })

  it('handles non-string entries (File) safely', () => {
    const fd = new FormData()
    fd.set('celularDestino', new Blob([]) as unknown as string)
    fd.set('monto', '100')
    expect(extractOptimisticDraft(fd)).toBeNull()
  })
})
