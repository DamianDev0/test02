import { z } from 'zod'
import type { CuentaBilletera } from './cuenta.types'

const DineroSchema = z.object({
  monto: z.number(),
  moneda: z.string().length(3),
})

const CuentaSchema = z.object({
  id: z.uuid(),
  numeroCelular: z.string().regex(/^3\d{9}$/),
  saldo: DineroSchema,
  estado: z.enum(['Activa', 'Bloqueada', 'Cerrada']),
})

export function parseCuenta(json: unknown): CuentaBilletera {
  return CuentaSchema.parse(json) as CuentaBilletera
}
