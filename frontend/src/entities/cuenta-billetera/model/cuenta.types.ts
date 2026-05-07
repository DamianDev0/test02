import type { NumeroCelular } from './numero-celular'

export type EstadoCuenta = 'Activa' | 'Bloqueada' | 'Cerrada'

export interface Dinero {
  readonly monto: number
  readonly moneda: string
}

export interface CuentaBilletera {
  readonly id: string
  readonly numeroCelular: NumeroCelular
  readonly saldo: Dinero
  readonly estado: EstadoCuenta
}
