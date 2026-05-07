'use client'

import { useTranslations } from 'next-intl'
import { Form } from '@/shared/ui'
import { useCrearCuenta } from '../model/useCrearCuenta'

export function CrearCuentaForm() {
  const t = useTranslations('CrearCuenta')
  const { action, status, statusMessage, fieldErrors } = useCrearCuenta()

  return (
    <Form action={action} errors={fieldErrors} status={status} statusMessage={statusMessage}>
      <Form.Field name="celular" label={t('campos.celular')} required>
        <Form.Input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder={t('campos.celularPlaceholder')}
          maxLength={10}
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
