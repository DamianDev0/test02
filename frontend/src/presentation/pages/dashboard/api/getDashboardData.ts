import { z } from 'zod'
import { redirect } from 'next/navigation'
import { apiFetch } from '@/shared/api'
import { CACHE_TAGS } from '@/shared/lib'
import { getSession } from '@/shared/lib/session'
import type { CuentaBilletera, NumeroCelular } from 'entities/cuenta-billetera'
import type { TransaccionPago } from 'entities/transaccion'

const SaldoSchema = z.object({ monto: z.number(), moneda: z.string() })

export interface DashboardData {
  cuenta: CuentaBilletera
  transacciones: TransaccionPago[]
}

export async function getDashboardData(): Promise<DashboardData> {
  const session = await getSession()
  if (!session) redirect('/onboarding')

  const [saldo, transacciones] = await Promise.all([
    apiFetch<z.infer<typeof SaldoSchema>>(`/api/v1/billetera/cuentas/${session.cuentaId}/saldo`, {
      tags: [CACHE_TAGS.cuenta(session.cuentaId)],
      revalidate: 2,
      parse: (json) => SaldoSchema.parse(json),
    }),
    listarTransacciones(session.cuentaId),
  ])

  const cuenta: CuentaBilletera = {
    id: session.cuentaId,
    numeroCelular: session.celular as NumeroCelular,
    saldo,
    estado: 'Activa',
  }

  return { cuenta, transacciones }
}

async function listarTransacciones(_cuentaId: string): Promise<TransaccionPago[]> {
  return []
}
