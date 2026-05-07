'use client'

import { useContext, useId } from 'react'
import { FormContext, FormFieldContext } from './Form.context'

export function useFormContext() {
  const ctx = useContext(FormContext)
  if (!ctx) {
    throw new Error('[Form] useFormContext must be used inside <Form.Root>.')
  }
  return ctx
}

export function useFormField() {
  const fieldCtx = useContext(FormFieldContext)
  const formCtx = useFormContext()

  if (!fieldCtx) {
    throw new Error('[Form] useFormField must be used inside <Form.Field>.')
  }

  const { name, hint } = fieldCtx
  const error = formCtx.errors?.[name]
  const inputId = useId()
  const errorId = `${inputId}-error`
  const descriptionId = `${inputId}-description`

  const describedBy = [
    error ? errorId : null,
    hint ? descriptionId : null,
  ].filter(Boolean).join(' ') || undefined

  return {
    name,
    inputId,
    errorId,
    descriptionId,
    error,
    hasError: Boolean(error),
    inputProps: {
      id: inputId,
      name,
      'aria-invalid': Boolean(error),
      'aria-describedby': describedBy,
    },
  }
}
