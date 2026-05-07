import { getCargarSaldoData } from 'pages/cargar-saldo'
import { CargarSaldoPage } from 'pages/cargar-saldo'

export default async function Page() {
  const data = await getCargarSaldoData()
  return <CargarSaldoPage data={data} />
}
