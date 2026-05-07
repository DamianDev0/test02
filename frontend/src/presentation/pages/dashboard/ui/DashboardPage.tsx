import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/ui'
import { CuentaResumen } from 'widgets/cuenta-resumen'
import { TransaccionesFeed } from 'widgets/transacciones-feed'
import type { DashboardData } from '../api/getDashboardData'

interface DashboardPageProps {
  data: DashboardData
}

export async function DashboardPage({ data }: Readonly<DashboardPageProps>) {
  const t = await getTranslations('Dashboard')
  const { cuenta, transacciones } = data

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <h1 className="text-xl font-semibold">{t('titulo')}</h1>

      <CuentaResumen cuenta={cuenta}>
        <CuentaResumen.Header>{t('miCuenta')}</CuentaResumen.Header>
        <CuentaResumen.Saldo />
        <CuentaResumen.Acciones>
          <Button render={<Link href="/cargar" />}>{t('acciones.cargar')}</Button>
          <Button variant="outline" render={<Link href="/pagar" />}>{t('acciones.pagar')}</Button>
        </CuentaResumen.Acciones>
      </CuentaResumen>

      <TransaccionesFeed transacciones={transacciones}>
        <TransaccionesFeed.Title>{t('transacciones.titulo')}</TransaccionesFeed.Title>
        <TransaccionesFeed.Empty>{t('transacciones.vacio')}</TransaccionesFeed.Empty>
        <TransaccionesFeed.List />
      </TransaccionesFeed>
    </main>
  )
}
