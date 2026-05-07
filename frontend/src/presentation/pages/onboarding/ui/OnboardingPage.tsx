import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'
import { CrearCuentaForm } from 'features/crear-cuenta'

export async function OnboardingPage() {
  const t = await getTranslations('Onboarding')

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('titulo')}</CardTitle>
          <CardDescription>{t('subtitulo')}</CardDescription>
        </CardHeader>
        <CardContent>
          <CrearCuentaForm />
        </CardContent>
      </Card>
    </main>
  )
}
