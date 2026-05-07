import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { UserPlusIcon, BanknoteIcon, SendIcon } from 'lucide-react'
import { MilestoneStepper } from '@/shared/ui/ruixen/milestone-stepper'

const meta: Meta<typeof MilestoneStepper> = {
  title: 'Ruixen/MilestoneStepper',
  component: MilestoneStepper,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Vertical timeline stepper. Variantes: default | compact | detailed.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof MilestoneStepper>

const onboardingMilestones = [
  { id: 'crear', title: 'Crea tu cuenta', description: 'Solo celular y PIN.', icon: <UserPlusIcon className="size-4" /> },
  { id: 'cargar', title: 'Carga saldo', description: 'Bancolombia, Davivienda, BBVA o Nequi.', icon: <BanknoteIcon className="size-4" /> },
  { id: 'pagar', title: 'Envía dinero', description: 'A cualquier celular registrado.', icon: <SendIcon className="size-4" /> },
]

export const Onboarding: Story = {
  args: { milestones: onboardingMilestones, currentMilestone: 0, variant: 'compact' },
}

export const PasoEnProgreso: Story = {
  args: { milestones: onboardingMilestones, currentMilestone: 1, variant: 'default' },
}

export const Detallado: Story = {
  args: {
    milestones: onboardingMilestones.map((m, i) => ({
      ...m,
      date: i === 0 ? 'Hoy' : i === 1 ? 'En 2 min' : 'Cuando quieras',
    })),
    currentMilestone: 0,
    variant: 'detailed',
  },
}
