import { Suspense } from 'react'
import { getCargarSaldoData, CargarSaldoPage } from 'pages/cargar-saldo'
import Loading from '../../loading'

async function CargarContent() {
  const data = await getCargarSaldoData()
  return <CargarSaldoPage data={data} />
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <CargarContent />
    </Suspense>
  )
}
