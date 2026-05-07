'use client'

import { useTranslations } from 'next-intl'
import { Form } from '@/shared/ui'
import type { Banco } from 'entities/banco'
import { useCargarSaldo } from '../model/useCargarSaldo'

interface CargarSaldoFormProps {
  bancos: readonly Banco[]
}

export function CargarSaldoForm({ bancos }: Readonly<CargarSaldoFormProps>) {
  const t = useTranslations('CargarSaldo')
  const { action, status, statusMessage, fieldErrors } = useCargarSaldo()

  const options = bancos.map((b) => ({ value: b.codigo, label: b.nombre }))

  return (
    <Form action={action} errors={fieldErrors} status={status} statusMessage={statusMessage}>
      <Form.Field name="origen" label={t('campos.origen')} required>
        <Form.Select options={options} placeholder={t('campos.origenPlaceholder')} />
      </Form.Field>

      <Form.Field name="monto" label={t('campos.monto')} required>
        <Form.MoneyInput />
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
