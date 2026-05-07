'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { apiFetch, toErrorMessage } from '@/shared/api'
import { setSession } from '@/shared/lib/session'

const InputSchema = z.object({
  celular: z.string().regex(/^3\d{9}$/),
  pin: z.string().regex(/^\d{4}$/),
})

const ResponseSchema = z.object({
  cuentaId: z.uuid(),
})

export type CrearCuentaState =
  | { ok: false; error?: string; fieldErrors?: Record<string, string> }
  | null

export async function crearCuenta(
  _prev: CrearCuentaState,
  formData: FormData,
): Promise<CrearCuentaState> {
  const t = await getTranslations('CrearCuenta')

  const parsed = InputSchema.safeParse({
    celular: formData.get('celular'),
    pin: formData.get('pin'),
  })

  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors
    const fieldErrors: Record<string, string> = {}
    if (flat.celular?.length) fieldErrors.celular = t('errores.celularInvalido')
    if (flat.pin?.length) fieldErrors.pin = t('errores.pinInvalido')
    return { ok: false, fieldErrors }
  }

  let cuentaId: string
  try {
    const result = await apiFetch<{ cuentaId: string }>('/api/v1/billetera/cuentas', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
      revalidate: false,
      parse: (json) => ResponseSchema.parse(json),
    })
    cuentaId = result.cuentaId
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, t('errores.red')) }
  }

  await setSession(cuentaId, parsed.data.celular)
  redirect('/dashboard')
}
