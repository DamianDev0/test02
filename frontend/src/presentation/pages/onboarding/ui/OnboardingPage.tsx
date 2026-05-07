import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'
import { DottedBackground } from '@/shared/ui/atoms'
import { CrearCuentaForm } from 'features/crear-cuenta'
import { OnboardingFAQ } from './OnboardingFAQ'
import { OnboardingPasos } from './OnboardingPasos'

export async function OnboardingPage() {
  const t = await getTranslations('Onboarding')

  return (
    <main className="relative flex flex-1 items-center justify-center p-4">
      <DottedBackground />
      <div className="relative w-full max-w-md space-y-6">
        <Card className="border-border/40 shadow-xl backdrop-blur-sm relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-px mx-auto h-px w-3/4 bg-linear-to-r from-transparent via-primary/40 to-transparent"
          />
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl tracking-tight">{t('titulo')}</CardTitle>
            <CardDescription>{t('subtitulo')}</CardDescription>
          </CardHeader>
          <CardContent>
            <CrearCuentaForm />
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-card/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
              {t('pasos.titulo')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OnboardingPasos
              paso1={{ titulo: t('pasos.crear.titulo'), descripcion: t('pasos.crear.descripcion') }}
              paso2={{ titulo: t('pasos.cargar.titulo'), descripcion: t('pasos.cargar.descripcion') }}
              paso3={{ titulo: t('pasos.pagar.titulo'), descripcion: t('pasos.pagar.descripcion') }}
            />
          </CardContent>
        </Card>

        <OnboardingFAQ
          title={t('faq.titulo')}
          items={[
            { id: 'que-es', title: t('faq.queEs.titulo'), content: t('faq.queEs.contenido') },
            { id: 'comisiones', title: t('faq.comisiones.titulo'), content: t('faq.comisiones.contenido') },
            { id: 'limites', title: t('faq.limites.titulo'), content: t('faq.limites.contenido') },
            { id: 'seguridad', title: t('faq.seguridad.titulo'), content: t('faq.seguridad.contenido') },
          ]}
        />
      </div>
    </main>
  )
}
