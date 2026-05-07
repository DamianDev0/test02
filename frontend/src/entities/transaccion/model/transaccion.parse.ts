import { z } from 'zod'
import type { TransaccionId, TransaccionPago } from './transaccion.types'
import type { NumeroCelular } from 'entities/cuenta-billetera'

const DineroSchema = z.object({ monto: z.number(), moneda: z.string() })

const TransaccionSchema = z.object({
  id: z.uuid(),
  cuentaId: z.uuid(),
  destino: z.string(),
  monto: DineroSchema,
  concepto: z.string(),
  estado: z.enum(['Pendiente', 'Confirmada', 'Rechazada']),
  creadaEn: z.string(),
})

const TransaccionListSchema = z.array(TransaccionSchema)

export function parseTransacciones(json: unknown): TransaccionPago[] {
  return TransaccionListSchema.parse(json).map((raw) => ({
    id: raw.id as TransaccionId,
    cuentaId: raw.cuentaId,
    destino: raw.destino as NumeroCelular,
    monto: raw.monto,
    concepto: raw.concepto,
    estado: raw.estado,
    creadaEn: raw.creadaEn,
  }))
}
