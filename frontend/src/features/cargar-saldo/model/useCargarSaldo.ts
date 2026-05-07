'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import {
  deriveFormStatus,
  deriveFormStatusMessage,
  deriveFormFieldErrors,
  type FormStatus,
} from '@/shared/ui'
import { cargarSaldo, type CargarSaldoState } from '../api/cargarSaldo'

interface UseCargarSaldoResult {
  action: (formData: FormData) => void
  status: FormStatus
  statusMessage: string | undefined
  fieldErrors: Record<string, string> | undefined
}

export function useCargarSaldo(): UseCargarSaldoResult {
  const t = useTranslations('CargarSaldo')
  const [state, action, pending] = useActionState<CargarSaldoState, FormData>(cargarSaldo, null)

  return {
    action,
    status: deriveFormStatus(pending, state),
    statusMessage: deriveFormStatusMessage(state, t('exito')),
    fieldErrors: deriveFormFieldErrors(state),
  }
}
