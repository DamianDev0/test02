'use client'

import { createContext } from 'react'

export type FormStatus = 'idle' | 'pending' | 'success' | 'error'

export interface FormContextValue {
  errors?: Record<string, string | undefined>
  status?: FormStatus
  statusMessage?: string
  readOnly?: boolean
}

export const FormContext = createContext<FormContextValue | null>(null)

export interface FormFieldContextValue {
  name: string
  hint?: string
  required?: boolean
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null)
