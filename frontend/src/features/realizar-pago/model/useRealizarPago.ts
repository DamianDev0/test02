'use client'

import { useActionState, useOptimistic } from 'react'
import { useTranslations } from 'next-intl'
import {
  deriveFormStatus,
  deriveFormStatusMessage,
  deriveFormFieldErrors,
  type FormStatus,
} from '@/shared/ui'
import { realizarPago, type RealizarPagoState } from '../api/realizarPago'
import { extractOptimisticDraft, type OptimisticDraft } from './extractOptimisticDraft'

interface UseRealizarPagoResult {
  action: (formData: FormData) => void
  status: FormStatus
  statusMessage: string | undefined
  fieldErrors: Record<string, string> | undefined
  optimisticDraft: OptimisticDraft | null
}

export function useRealizarPago(): UseRealizarPagoResult {
  const t = useTranslations('RealizarPago')
  const [state, baseAction, pending] = useActionState<RealizarPagoState, FormData>(realizarPago, null)

  const [optimisticDraft, setOptimisticDraft] = useOptimistic<OptimisticDraft | null, OptimisticDraft>(
    null,
    (_, next) => next,
  )

  const status = deriveFormStatus(pending, state)
  const showOptimistic = optimisticDraft !== null && status === 'pending'

  function action(formData: FormData): void {
    const draft = extractOptimisticDraft(formData)
    if (draft) setOptimisticDraft(draft)
    baseAction(formData)
  }

  return {
    action,
    status,
    statusMessage: deriveFormStatusMessage(state, t('exito')),
    fieldErrors: deriveFormFieldErrors(state),
    optimisticDraft: showOptimistic ? optimisticDraft : null,
  }
}
