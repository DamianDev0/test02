import type { Banco } from 'entities/banco'
import { getBancos } from 'features/cargar-saldo'

export interface CargarSaldoData {
  bancos: Banco[]
}

export async function getCargarSaldoData(): Promise<CargarSaldoData> {
  const bancos = await getBancos()
  return { bancos }
}
