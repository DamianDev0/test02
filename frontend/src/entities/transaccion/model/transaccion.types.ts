import type { NumeroCelular } from 'entities/cuenta-billetera'
import type { Dinero } from 'entities/cuenta-billetera'

export type TransaccionId = string & { readonly __brand: 'TransaccionId' }

export type EstadoTransaccion = 'Pendiente' | 'Confirmada' | 'Rechazada'

export interface TransaccionPago {
  readonly id: TransaccionId
  readonly cuentaId: string
  readonly destino: NumeroCelular
  readonly monto: Dinero
  readonly concepto: string
  readonly estado: EstadoTransaccion
  readonly creadaEn: string
}
