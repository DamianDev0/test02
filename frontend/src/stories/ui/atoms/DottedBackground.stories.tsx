import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DottedBackground } from '@/shared/ui/atoms'

const meta: Meta<typeof DottedBackground> = {
  title: 'Atoms/DottedBackground',
  component: DottedBackground,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Fondo decorativo con grid de puntos + mask radial — pure CSS, sin imagen. `pointer-events-none` y `aria-hidden`.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof DottedBackground>

export const Default: Story = {
  render: () => (
    <div className="relative h-96 w-full overflow-hidden rounded-xl border bg-background">
      <DottedBackground />
      <div className="relative flex h-full items-center justify-center">
        <p className="text-2xl font-semibold">Contenido encima</p>
      </div>
    </div>
  ),
}

export const Subtle: Story = {
  render: () => (
    <div className="relative h-96 w-full overflow-hidden rounded-xl border bg-background">
      <DottedBackground className="opacity-40" />
      <div className="relative flex h-full items-center justify-center">
        <p className="text-2xl font-semibold">opacity-40</p>
      </div>
    </div>
  ),
}
