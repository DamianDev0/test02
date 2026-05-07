'use client'

import { useContext, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, ClipboardEvent, ComponentProps, KeyboardEvent, ReactNode } from 'react'
import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  FormContext,
  FormFieldContext,
  type FormContextValue,
  type FormFieldContextValue,
  type FormStatus,
} from './Form.context'
import { useFormContext, useFormField } from './useFormField'

export interface FormRootProps {
  action?: ((formData: FormData) => void) | string
  errors?: FormContextValue['errors']
  status?: FormStatus
  statusMessage?: string
  readOnly?: boolean
  className?: string
  children: ReactNode
}

function Root({
  action,
  errors,
  status,
  statusMessage,
  readOnly = false,
  className,
  children,
}: Readonly<FormRootProps>) {
  const ctx = useMemo<FormContextValue>(
    () => ({ errors, status, statusMessage, readOnly }),
    [errors, status, statusMessage, readOnly],
  )
  return (
    <FormContext.Provider value={ctx}>
      <form action={action} noValidate className={cn('w-full space-y-6', className)}>
        {children}
      </form>
    </FormContext.Provider>
  )
}

interface FormSectionProps {
  title?: string
  description?: string
  className?: string
  children: ReactNode
}

function Section({ title, description, className, children }: Readonly<FormSectionProps>) {
  const hasHeader = Boolean(title ?? description)
  return (
    <fieldset className={cn('space-y-4', className)}>
      {hasHeader && (
        <>
          <div className="space-y-1">
            {title && (
              <legend className="text-sm font-semibold text-foreground leading-none">
                {title}
              </legend>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <Separator />
        </>
      )}
      <div className="space-y-4">{children}</div>
    </fieldset>
  )
}

interface FormFieldProps extends FormFieldContextValue {
  label: string
  className?: string
  children: ReactNode
}

function Field({
  name,
  label,
  hint,
  required = false,
  className,
  children,
}: Readonly<FormFieldProps>) {
  const ctx = useMemo<FormFieldContextValue>(
    () => ({ name, hint, required }),
    [name, hint, required],
  )
  return (
    <FormFieldContext.Provider value={ctx}>
      <div className={cn('space-y-1.5', className)}>
        <FieldLabel required={required}>{label}</FieldLabel>
        {children}
        <FieldDescription />
        <FieldError />
      </div>
    </FormFieldContext.Provider>
  )
}

function FieldLabel({
  required,
  children,
}: Readonly<{ required?: boolean; children: ReactNode }>) {
  const { inputId } = useFormField()
  return (
    <Label htmlFor={inputId} className="text-sm font-medium">
      {children}
      {required && <span className="ml-1 text-destructive" aria-hidden="true">*</span>}
    </Label>
  )
}

function FieldError() {
  const { error, errorId, hasError } = useFormField()
  if (!hasError) return null
  return (
    <p id={errorId} role="alert" className="flex items-center gap-1 text-xs font-medium text-destructive">
      <AlertCircleIcon className="size-3 shrink-0" aria-hidden="true" />
      {error}
    </p>
  )
}

function FieldDescription() {
  const fieldCtx = useContext(FormFieldContext)
  const { descriptionId } = useFormField()
  if (!fieldCtx?.hint) return null
  return (
    <p id={descriptionId} className="text-xs text-muted-foreground">
      {fieldCtx.hint}
    </p>
  )
}

type FormInputProps = Readonly<Omit<ComponentProps<'input'>, 'name' | 'id'> & { className?: string }>

function FormInput({ className, ...props }: FormInputProps) {
  const { inputProps, hasError } = useFormField()
  const { readOnly } = useFormContext()
  return (
    <Input
      {...inputProps}
      {...props}
      readOnly={readOnly ?? props.readOnly}
      className={cn(
        hasError && 'border-destructive focus-visible:ring-destructive/30',
        readOnly && 'cursor-not-allowed bg-muted',
        className,
      )}
    />
  )
}

type FormTextareaProps = Readonly<Omit<ComponentProps<'textarea'>, 'name' | 'id'> & { className?: string }>

function FormTextarea({ className, ...props }: FormTextareaProps) {
  const { inputProps, hasError } = useFormField()
  const { readOnly } = useFormContext()
  return (
    <Textarea
      {...inputProps}
      {...props}
      readOnly={readOnly}
      className={cn(
        'min-h-20 resize-y',
        hasError && 'border-destructive focus-visible:ring-destructive/30',
        readOnly && 'cursor-not-allowed bg-muted',
        className,
      )}
    />
  )
}

interface FormSelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface FormSelectProps {
  options: readonly FormSelectOption[]
  placeholder?: string
  defaultValue?: string
  className?: string
}

function FormSelect({
  options,
  placeholder = 'Seleccionar…',
  defaultValue,
  className,
}: Readonly<FormSelectProps>) {
  const { inputId, name, hasError, errorId } = useFormField()
  const { readOnly } = useFormContext()
  const [value, setValue] = useState(defaultValue ?? '')

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select value={value} onValueChange={(v: string | null) => setValue(v ?? '')} disabled={readOnly}>
        <SelectTrigger
          id={inputId}
          aria-invalid={hasError}
          aria-describedby={errorId}
          className={cn(
            hasError && 'border-destructive focus:ring-destructive/30',
            readOnly && 'cursor-not-allowed bg-muted',
            className,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}

interface FormPinInputProps {
  length?: number
  className?: string
}

function FormPinInput({ length = 4, className }: Readonly<FormPinInputProps>) {
  const { inputProps, hasError, name } = useFormField()
  const { readOnly } = useFormContext()
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length }, () => ''))
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...digits]
    next[i] = val.slice(-1)
    setDigits(next)
    if (val && i < length - 1) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replaceAll(/\D/g, '').slice(0, length)
    if (!pasted) return
    e.preventDefault()
    const next = [...pasted, ...Array.from({ length }, () => '')].slice(0, length)
    setDigits(next)
    refs.current[Math.min(pasted.length, length - 1)]?.focus()
  }

  return (
    <div className="flex items-center gap-2">
      <input type="hidden" name={name} value={digits.join('')} />
      {digits.map((d, i) => (
        <input
          key={`${name}-${i}`}
          ref={(el) => {
            refs.current[i] = el
          }}
          id={i === 0 ? inputProps.id : undefined}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          disabled={readOnly}
          aria-label={`Dígito ${i + 1} de ${length}`}
          aria-invalid={i === 0 ? hasError : undefined}
          className={cn(
            'size-12 rounded-md border bg-background text-center font-mono text-lg transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            d && 'border-primary',
            hasError && 'border-destructive focus:ring-destructive/30',
            readOnly && 'cursor-not-allowed bg-muted',
            className,
          )}
        />
      ))}
    </div>
  )
}

interface FormMoneyInputProps {
  currency?: string
  className?: string
}

function FormMoneyInput({ currency = 'COP', className }: Readonly<FormMoneyInputProps>) {
  const { inputProps, hasError, name } = useFormField()
  const { readOnly } = useFormContext()
  const [raw, setRaw] = useState('')

  const display = raw ? new Intl.NumberFormat('es-CO').format(Number(raw)) : ''

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRaw(e.target.value.replaceAll(/\D/g, ''))
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={raw} />
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none"
        aria-hidden="true"
      >
        {currency}
      </span>
      <Input
        {...inputProps}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        readOnly={readOnly}
        className={cn(
          'pl-14',
          hasError && 'border-destructive focus-visible:ring-destructive/30',
          readOnly && 'cursor-not-allowed bg-muted',
          className,
        )}
      />
    </div>
  )
}

function Status() {
  const { status, statusMessage } = useFormContext()
  if (!statusMessage) return null

  const variant = {
    success: {
      icon: <CheckCircle2Icon className="size-4 shrink-0" aria-hidden="true" />,
      className: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
    },
    error: {
      icon: <AlertCircleIcon className="size-4 shrink-0" aria-hidden="true" />,
      className: 'border-destructive/30 bg-destructive/5 text-destructive',
    },
    pending: {
      icon: <Loader2Icon className="size-4 shrink-0 animate-spin" aria-hidden="true" />,
      className: 'border-border bg-muted text-muted-foreground',
    },
    idle: {
      icon: null,
      className: 'border-border bg-muted text-muted-foreground',
    },
  }[status ?? 'idle']

  return (
    <Alert className={cn('flex items-start gap-2', variant.className)}>
      {variant.icon}
      <AlertDescription>{statusMessage}</AlertDescription>
    </Alert>
  )
}

interface FormActionsProps {
  align?: 'left' | 'right' | 'center' | 'between'
  className?: string
  children: ReactNode
}

function Actions({ align = 'right', className, children }: Readonly<FormActionsProps>) {
  const alignClass = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
  }[align]
  return (
    <div className={cn('flex items-center gap-3 pt-2', alignClass, className)}>
      {children}
    </div>
  )
}

interface FormSubmitButtonProps {
  variant?: ComponentProps<typeof Button>['variant']
  size?: ComponentProps<typeof Button>['size']
  loadingText?: string
  className?: string
  children: ReactNode
}

function SubmitButton({
  variant = 'default',
  size = 'default',
  loadingText = 'Procesando…',
  className,
  children,
}: Readonly<FormSubmitButtonProps>) {
  const { status } = useFormContext()
  const isPending = status === 'pending'
  return (
    <Button type="submit" variant={variant} size={size} disabled={isPending} className={cn('min-w-30', className)}>
      {isPending ? (
        <span className="flex items-center gap-2">
          <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </Button>
  )
}

export const Form = Object.assign(Root, {
  Section,
  Field,
  Input: FormInput,
  Textarea: FormTextarea,
  Select: FormSelect,
  PinInput: FormPinInput,
  MoneyInput: FormMoneyInput,
  Status,
  Actions,
  SubmitButton,
})

export { useFormField, useFormContext } from './useFormField'
export type { FormStatus } from './Form.context'
