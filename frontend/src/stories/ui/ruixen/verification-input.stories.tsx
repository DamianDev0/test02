import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { VerificationInput } from '@/shared/ui/ruixen/verification-input'

const meta: Meta<typeof VerificationInput> = {
  title: 'Ruixen/VerificationInput',
  component: VerificationInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'OTP input grouped por bloques. Fires `onComplete(code)` al llenar. Pensado para flujos OTP, no para PIN form-bound.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof VerificationInput>

export const SixDigitOTP: Story = {
  args: {
    length: 6,
    onComplete: (code) => console.log('Verified:', code),
  },
}

export const FourDigitPIN: Story = {
  args: {
    length: 4,
    onComplete: (code) => console.log('PIN:', code),
  },
}
