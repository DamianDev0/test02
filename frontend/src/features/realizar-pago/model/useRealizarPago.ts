'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import {
  deriveFormStatus,
  deriveFormStatusMessage,
  deriveFormFieldErrors,
  type FormStatus,
} from '@/shared/ui'
import { realizarPago, type RealizarPagoState } from '../api/realizarPago'

interface UseRealizarPagoResult {
  action: (formData: FormData) => void
  status: FormStatus
  statusMessage: string | undefined
  fieldErrors: Record<string, string> | undefined
}

export function useRealizarPago(): UseRealizarPagoResult {
  const t = useTranslations('RealizarPago')
  const [state, action, pending] = useActionState<RealizarPagoState, FormData>(realizarPago, null)

  return {
    action,
    status: deriveFormStatus(pending, state),
    statusMessage: deriveFormStatusMessage(state, t('exito')),
    fieldErrors: deriveFormFieldErrors(state),
  }
}
