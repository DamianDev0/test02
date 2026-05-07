import type { NumeroCelular } from 'entities/cuenta-billetera'
import type { Dinero } from 'entities/cuenta-billetera'

export type TransaccionId = string & { readonly __brand: 'TransaccionId' }

export const ESTADOS_TRANSACCION = ['Pendiente', 'Confirmada', 'Rechazada'] as const
export type EstadoTransaccion = (typeof ESTADOS_TRANSACCION)[number]

export const ESTADOS_TERMINALES = ['Confirmada', 'Rechazada'] as const satisfies ReadonlyArray<EstadoTransaccion>

export function isEstadoTransaccion(value: unknown): value is EstadoTransaccion {
  return typeof value === 'string' && (ESTADOS_TRANSACCION as readonly string[]).includes(value)
}

export function isEstadoTerminal(estado: EstadoTransaccion): estado is (typeof ESTADOS_TERMINALES)[number] {
  return (ESTADOS_TERMINALES as readonly string[]).includes(estado)
}

export interface TransaccionPago {
  readonly id: TransaccionId
  readonly cuentaId: string
  readonly destino: NumeroCelular
  readonly monto: Dinero
  readonly concepto: string
  readonly estado: EstadoTransaccion
  readonly creadaEn: string
}
