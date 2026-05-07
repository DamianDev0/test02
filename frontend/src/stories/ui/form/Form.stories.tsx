import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Form } from '@/shared/ui/form'

const meta: Meta = {
  title: 'Form/Form (Compound)',
  parameters: {
    docs: {
      description: {
        component:
          'Compound form built on top of Server Actions. Provides Field, Input, Select, PinInput, MoneyInput, Status, Actions, SubmitButton.',
      },
    },
  },
}

export default meta
type Story = StoryObj

export const Basic: Story = {
  render: () => (
    <div className="max-w-md">
      <Form>
        <Form.Field name="email" label="Email" required>
          <Form.Input type="email" placeholder="tu@correo.com" />
        </Form.Field>
        <Form.Field name="bio" label="Biografía" hint="Máx. 200 caracteres">
          <Form.Textarea maxLength={200} />
        </Form.Field>
        <Form.Actions>
          <Form.SubmitButton>Guardar</Form.SubmitButton>
        </Form.Actions>
      </Form>
    </div>
  ),
}

export const WithErrors: Story = {
  render: () => (
    <div className="max-w-md">
      <Form
        errors={{ celular: 'Celular colombiano inválido', pin: 'PIN debe ser 4 dígitos' }}
        status="error"
        statusMessage="Revisa los datos e intenta de nuevo"
      >
        <Form.Field name="celular" label="Celular" required>
          <Form.Input type="tel" defaultValue="123" maxLength={10} />
        </Form.Field>
        <Form.Field name="pin" label="PIN" required>
          <Form.PinInput length={4} />
        </Form.Field>
        <Form.Status />
        <Form.Actions>
          <Form.SubmitButton>Reintentar</Form.SubmitButton>
        </Form.Actions>
      </Form>
    </div>
  ),
}

export const Pending: Story = {
  render: () => (
    <div className="max-w-md">
      <Form status="pending" statusMessage="Procesando…">
        <Form.Field name="monto" label="Monto" required>
          <Form.MoneyInput />
        </Form.Field>
        <Form.Status />
        <Form.Actions>
          <Form.SubmitButton loadingText="Cargando…">Cargar</Form.SubmitButton>
        </Form.Actions>
      </Form>
    </div>
  ),
}

export const Success: Story = {
  render: () => (
    <div className="max-w-md">
      <Form status="success" statusMessage="Cuenta creada exitosamente">
        <Form.Field name="email" label="Email">
          <Form.Input type="email" defaultValue="hola@toolbooks.ai" readOnly />
        </Form.Field>
        <Form.Status />
      </Form>
    </div>
  ),
}

export const SelectField: Story = {
  render: () => (
    <div className="max-w-md">
      <Form>
        <Form.Field name="banco" label="Banco origen" required>
          <Form.Select
            placeholder="Selecciona tu banco"
            options={[
              { value: 'BANCOLOMBIA', label: 'Bancolombia' },
              { value: 'DAVIVIENDA', label: 'Davivienda' },
              { value: 'BBVA', label: 'BBVA' },
              { value: 'NEQUI', label: 'Nequi' },
            ]}
          />
        </Form.Field>
      </Form>
    </div>
  ),
}

export const PinInput: Story = {
  render: () => (
    <div className="max-w-md">
      <Form>
        <Form.Field name="pin" label="PIN de 4 dígitos" required>
          <Form.PinInput length={4} />
        </Form.Field>
        <Form.Field name="otp" label="OTP de 6 dígitos" required>
          <Form.PinInput length={6} />
        </Form.Field>
      </Form>
    </div>
  ),
}

export const MoneyInput: Story = {
  render: () => (
    <div className="max-w-md">
      <Form>
        <Form.Field name="monto" label="Monto" required hint="Máximo $3.000.000 COP">
          <Form.MoneyInput />
        </Form.Field>
      </Form>
    </div>
  ),
}
