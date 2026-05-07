import { z } from 'zod'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { apiFetch } from '@/shared/api'
import { CACHE_TAGS } from '@/shared/lib/cache'
import type { CuentaBilletera } from 'entities/cuenta-billetera'
import type { NumeroCelular } from 'entities/cuenta-billetera'
import type { TransaccionPago } from 'entities/transaccion'

const SaldoSchema = z.object({ monto: z.number(), moneda: z.string() })

export interface DashboardData {
  cuenta: CuentaBilletera
  transacciones: TransaccionPago[]
}

export async function getDashboardData(): Promise<DashboardData> {
  const cookieStore = await cookies()
  const cuentaId = cookieStore.get('bid')?.value
  const celular = cookieStore.get('bcel')?.value

  if (!cuentaId || !celular) {
    redirect('/onboarding')
  }

  const [saldo] = await Promise.all([
    apiFetch<z.infer<typeof SaldoSchema>>(`/api/v1/billetera/cuentas/${cuentaId}/saldo`, {
      tags: [CACHE_TAGS.cuenta(cuentaId)],
      revalidate: 2,
      parse: (json) => SaldoSchema.parse(json),
    }),
  ])

  const cuenta: CuentaBilletera = {
    id: cuentaId,
    numeroCelular: celular as NumeroCelular,
    saldo,
    estado: 'Activa',
  }

  return { cuenta, transacciones: [] }
}
