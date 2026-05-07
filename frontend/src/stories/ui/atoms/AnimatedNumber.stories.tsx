import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { AnimatedNumber } from '@/shared/ui/atoms'
import { Button } from '@/components/ui/button'

const meta: Meta<typeof AnimatedNumber> = {
  title: 'Atoms/AnimatedNumber',
  component: AnimatedNumber,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'RAF count-up con cubic ease-out. Anima desde el valor previo al nuevo. `aria-live=polite` lo hace amigable a screen readers.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof AnimatedNumber>

export const Default: Story = {
  args: { value: 1_250_000, className: 'text-4xl font-bold tabular-nums' },
}

export const Money: Story = {
  args: {
    value: 5_000_000,
    format: (n) =>
      new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n),
    className: 'text-4xl font-bold tabular-nums',
  },
}

export const Interactive: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState(1_000_000)
      return (
        <div className="space-y-4">
          <AnimatedNumber value={value} className="block text-5xl font-bold tabular-nums" />
          <div className="flex gap-2">
            <Button onClick={() => setValue(value + 250_000)}>+ 250.000</Button>
            <Button variant="outline" onClick={() => setValue(value - 100_000)}>− 100.000</Button>
            <Button variant="ghost" onClick={() => setValue(0)}>Reset</Button>
          </div>
        </div>
      )
    }
    return <Demo />
  },
}
