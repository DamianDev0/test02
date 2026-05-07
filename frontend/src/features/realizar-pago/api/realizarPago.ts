'use server'

import { z } from 'zod'
import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { revalidateTag } from 'next/cache'
import { apiFetch, toErrorMessage } from '@/shared/api'
import { CACHE_TAGS } from '@/shared/lib/cache'

const InputSchema = z.object({
  celularDestino: z.string().regex(/^3\d{9}$/),
  monto: z.coerce.number().positive().max(3_000_000),
  concepto: z.string().min(1).max(200),
  pin: z.string().regex(/^\d{4}$/),
})

const ResponseSchema = z.object({ transaccionId: z.uuid() })

export type RealizarPagoState =
  | { ok: true; transaccionId: string }
  | { ok: false; error?: string; fieldErrors?: Record<string, string> }
  | null

export async function realizarPago(
  _prev: RealizarPagoState,
  formData: FormData,
): Promise<RealizarPagoState> {
  const t = await getTranslations('RealizarPago')

  const cookieStore = await cookies()
  const cuentaId = cookieStore.get('bid')?.value
  if (!cuentaId) return { ok: false, error: t('errores.sesion') }

  const parsed = InputSchema.safeParse({
    celularDestino: formData.get('celularDestino'),
    monto: formData.get('monto'),
    concepto: formData.get('concepto'),
    pin: formData.get('pin'),
  })

  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors
    const fieldErrors: Record<string, string> = {}
    if (flat.celularDestino?.length) fieldErrors.celularDestino = t('errores.celularInvalido')
    if (flat.monto?.length) fieldErrors.monto = t('errores.montoInvalido')
    if (flat.concepto?.length) fieldErrors.concepto = t('errores.conceptoInvalido')
    if (flat.pin?.length) fieldErrors.pin = t('errores.pinInvalido')
    return { ok: false, fieldErrors }
  }

  try {
    const result = await apiFetch<{ transaccionId: string }>(
      `/api/v1/billetera/cuentas/${cuentaId}/pagos`,
      {
        method: 'POST',
        body: JSON.stringify(parsed.data),
        revalidate: false,
        parse: (json) => ResponseSchema.parse(json),
      },
    )
    revalidateTag(CACHE_TAGS.cuenta(cuentaId), 'max')
    revalidateTag(CACHE_TAGS.transacciones(cuentaId), 'max')
    return { ok: true, transaccionId: result.transaccionId }
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, t('errores.red')) }
  }
}
