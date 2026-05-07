'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2Icon } from 'lucide-react'
import { Form } from '@/shared/ui'
import { formatMoney } from '@/lib/format-money'
import { useRealizarPago } from '../model/useRealizarPago'

export function RealizarPagoForm() {
  const t = useTranslations('RealizarPago')
  const { action, status, statusMessage, fieldErrors, optimisticDraft } = useRealizarPago()

  return (
    <>
      {optimisticDraft && (
        <output
          aria-live="polite"
          className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/30"
        >
          <CheckCircle2Icon
            className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 animate-pulse"
            aria-hidden="true"
          />
          <div className="space-y-0.5 text-sm">
            <p className="font-medium text-emerald-900 dark:text-emerald-100">
              {t('optimistic.titulo')}
            </p>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">
              {t('optimistic.descripcion', {
                destino: optimisticDraft.destino,
                monto: formatMoney(optimisticDraft.monto),
              })}
            </p>
          </div>
        </output>
      )}

      <Form action={action} errors={fieldErrors} status={status} statusMessage={statusMessage}>
        <Form.Field name="celularDestino" label={t('campos.celularDestino')} required>
          <Form.Input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder={t('campos.celularDestinoPlaceholder')}
            maxLength={10}
          />
        </Form.Field>

        <Form.Field name="monto" label={t('campos.monto')} required>
          <Form.MoneyInput />
        </Form.Field>

        <Form.Field name="concepto" label={t('campos.concepto')} required>
          <Form.Input type="text" placeholder={t('campos.conceptoPlaceholder')} maxLength={200} />
        </Form.Field>

        <Form.Field name="pin" label={t('campos.pin')} required>
          <Form.PinInput length={4} />
        </Form.Field>

        <Form.Status />

        <Form.Actions align="right">
          <Form.SubmitButton loadingText={t('acciones.submitLoading')}>
            {t('acciones.submit')}
          </Form.SubmitButton>
        </Form.Actions>
      </Form>
    </>
  )
}
