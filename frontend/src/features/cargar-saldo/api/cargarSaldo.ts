'use server'

import { z } from 'zod'
import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { revalidateTag } from 'next/cache'
import { apiFetch, toErrorMessage } from '@/shared/api'
import { CACHE_TAGS } from '@/shared/lib/cache'

const InputSchema = z.object({
  monto: z.coerce.number().positive().max(10_000_000),
  origen: z.string().min(1),
})

export type CargarSaldoState =
  | { ok: true }
  | { ok: false; error?: string; fieldErrors?: Record<string, string> }
  | null

export async function cargarSaldo(
  _prev: CargarSaldoState,
  formData: FormData,
): Promise<CargarSaldoState> {
  const t = await getTranslations('CargarSaldo')

  const cookieStore = await cookies()
  const cuentaId = cookieStore.get('bid')?.value
  if (!cuentaId) return { ok: false, error: t('errores.sesion') }

  const parsed = InputSchema.safeParse({
    monto: formData.get('monto'),
    origen: formData.get('origen'),
  })

  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors
    const fieldErrors: Record<string, string> = {}
    if (flat.monto?.length) fieldErrors.monto = t('errores.montoInvalido')
    if (flat.origen?.length) fieldErrors.origen = t('errores.origenInvalido')
    return { ok: false, fieldErrors }
  }

  try {
    await apiFetch(`/api/v1/billetera/cuentas/${cuentaId}/cargas`, {
      method: 'POST',
      body: JSON.stringify(parsed.data),
      revalidate: false,
    })
    revalidateTag(CACHE_TAGS.cuenta(cuentaId), 'max')
    return { ok: true }
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, t('errores.red')) }
  }
}
