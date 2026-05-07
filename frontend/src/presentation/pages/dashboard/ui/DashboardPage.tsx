import { getTranslations } from 'next-intl/server'
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/ui'
import { DottedBackground } from '@/shared/ui/atoms'
import { TransaccionItem } from 'entities/transaccion'
import { CuentaResumen } from 'widgets/cuenta-resumen'
import { TransaccionesFeed } from 'widgets/transacciones-feed'
import type { DashboardData } from '../api/getDashboardData'

interface DashboardPageProps {
  data: DashboardData
}

export async function DashboardPage({ data }: Readonly<DashboardPageProps>) {
  const t = await getTranslations('Dashboard')
  const { cuenta, transacciones } = data
  const isEmpty = transacciones.length === 0

  return (
    <main className="relative flex flex-1 flex-col gap-5 p-4 max-w-lg mx-auto w-full">
      <DottedBackground className="opacity-40" />

      <header className="flex items-end justify-between pt-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {t('saludo')}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{t('titulo')}</h1>
        </div>
      </header>

      <CuentaResumen>
        <CuentaResumen.Header numeroCelular={cuenta.numeroCelular}>
          {t('miCuenta')}
        </CuentaResumen.Header>
        <CuentaResumen.Saldo saldo={cuenta.saldo} />
        <CuentaResumen.Acciones>
          <Button render={<Link href="/cargar" />} className="flex-1 group">
            <ArrowDownIcon className="size-4 transition-transform group-hover:-translate-y-0.5" />
            {t('acciones.cargar')}
          </Button>
          <Button
            variant="outline"
            render={<Link href="/pagar" />}
            className="flex-1 group"
          >
            <ArrowUpIcon className="size-4 transition-transform group-hover:translate-y-0.5 group-hover:-rotate-12" />
            {t('acciones.pagar')}
          </Button>
        </CuentaResumen.Acciones>
      </CuentaResumen>

      <TransaccionesFeed>
        <TransaccionesFeed.Title>{t('transacciones.titulo')}</TransaccionesFeed.Title>
        {isEmpty ? (
          <TransaccionesFeed.Empty>{t('transacciones.vacio')}</TransaccionesFeed.Empty>
        ) : (
          <TransaccionesFeed.List>
            {transacciones.map((tx) => (
              <div key={tx.id} className="px-6">
                <TransaccionItem transaccion={tx} />
              </div>
            ))}
          </TransaccionesFeed.List>
        )}
      </TransaccionesFeed>
    </main>
  )
}
