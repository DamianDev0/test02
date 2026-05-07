export interface OptimisticDraft {
  readonly destino: string
  readonly monto: number
  readonly concepto: string
}

const CELULAR_REGEX = /^3\d{9}$/

function asString(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value : ''
}

export function extractOptimisticDraft(formData: FormData): OptimisticDraft | null {
  const destino = asString(formData.get('celularDestino'))
  const concepto = asString(formData.get('concepto'))
  const rawMonto = formData.get('monto')
  const monto = typeof rawMonto === 'string' ? Number(rawMonto) : 0

  if (monto <= 0 || !CELULAR_REGEX.test(destino)) return null

  return { destino, monto, concepto }
}
