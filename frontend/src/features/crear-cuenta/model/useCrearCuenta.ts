'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import {
  deriveFormStatus,
  deriveFormStatusMessage,
  deriveFormFieldErrors,
  type FormStatus,
} from '@/shared/ui'
import { crearCuenta, type CrearCuentaState } from '../api/crearCuenta'

interface UseCrearCuentaResult {
  action: (formData: FormData) => void
  status: FormStatus
  statusMessage: string | undefined
  fieldErrors: Record<string, string> | undefined
}

export function useCrearCuenta(): UseCrearCuentaResult {
  const t = useTranslations('CrearCuenta')
  const [state, action, pending] = useActionState<CrearCuentaState, FormData>(crearCuenta, null)

  return {
    action,
    status: deriveFormStatus(pending, state),
    statusMessage: deriveFormStatusMessage(state, t('exito')),
    fieldErrors: deriveFormFieldErrors(state),
  }
}
