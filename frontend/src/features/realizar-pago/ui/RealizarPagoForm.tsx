'use client'

import { useTranslations } from 'next-intl'
import { Form } from '@/shared/ui'
import { useRealizarPago } from '../model/useRealizarPago'

export function RealizarPagoForm() {
  const t = useTranslations('RealizarPago')
  const { action, status, statusMessage, fieldErrors } = useRealizarPago()

  return (
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
        <Form.Input
          type="text"
          placeholder={t('campos.conceptoPlaceholder')}
          maxLength={200}
        />
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
  )
}
