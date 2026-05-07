import type { FormStatus } from './Form.context'

export type FormActionState =
  | { ok: true; [key: string]: unknown }
  | { ok: false; error?: string; fieldErrors?: Record<string, string> }
  | null

export function deriveFormStatus(pending: boolean, state: FormActionState): FormStatus {
  if (pending) return 'pending'
  if (state?.ok) return 'success'
  if (state && !state.ok) return 'error'
  return 'idle'
}

export function deriveFormStatusMessage(
  state: FormActionState,
  successMessage?: string,
): string | undefined {
  if (state?.ok) return successMessage
  if (state && !state.ok) return state.error
  return undefined
}

export function deriveFormFieldErrors(
  state: FormActionState,
): Record<string, string> | undefined {
  if (state && !state.ok) return state.fieldErrors
  return undefined
}
