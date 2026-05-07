import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'
import { CargarSaldoForm } from 'features/cargar-saldo'
import type { CargarSaldoData } from '../api/getCargarSaldoData'

interface CargarSaldoPageProps {
  data: CargarSaldoData
}

export async function CargarSaldoPage({ data }: Readonly<CargarSaldoPageProps>) {
  const t = await getTranslations('CargarSaldo')

  return (
    <main className="flex flex-1 items-start justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('titulo')}</CardTitle>
          <CardDescription>{t('subtitulo')}</CardDescription>
        </CardHeader>
        <CardContent>
          <CargarSaldoForm bancos={data.bancos} />
        </CardContent>
      </Card>
    </main>
  )
}
