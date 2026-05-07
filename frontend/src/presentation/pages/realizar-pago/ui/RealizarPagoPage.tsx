import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'
import { RealizarPagoForm } from 'features/realizar-pago'

export async function RealizarPagoPage() {
  const t = await getTranslations('RealizarPago')

  return (
    <main className="flex flex-1 items-start justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('titulo')}</CardTitle>
          <CardDescription>{t('subtitulo')}</CardDescription>
        </CardHeader>
        <CardContent>
          <RealizarPagoForm />
        </CardContent>
      </Card>
    </main>
  )
}
