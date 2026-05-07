import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState, useEffect } from 'react'
import { BadgeMorph } from '@/shared/ui/ruixen/badge-morph'
import { Button } from '@/components/ui/button'

const meta: Meta<typeof BadgeMorph> = {
  title: 'Ruixen/BadgeMorph',
  component: BadgeMorph,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Dynamic Island-inspired status pill con spring physics + radiant glow. Estados: idle / loading / success / error.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof BadgeMorph>

export const Idle: Story = { args: { status: 'idle' } }
export const Loading: Story = { args: { status: 'loading' } }
export const Success: Story = { args: { status: 'success' } }
export const Error: Story = { args: { status: 'error' } }

export const CustomLabel: Story = {
  args: { status: 'success', label: 'Pago confirmado' },
}

export const Cycle: Story = {
  render: () => {
    const states: ReadonlyArray<'idle' | 'loading' | 'success' | 'error'> = ['idle', 'loading', 'success', 'error']
    const Demo = () => {
      const [i, setI] = useState(0)
      useEffect(() => {
        const t = setInterval(() => setI((x) => (x + 1) % states.length), 2000)
        return () => clearInterval(t)
      }, [])
      return (
        <div className="space-y-4">
          <BadgeMorph status={states[i]} />
          <Button size="sm" onClick={() => setI((x) => (x + 1) % states.length)}>
            Siguiente: {states[(i + 1) % states.length]}
          </Button>
        </div>
      )
    }
    return <Demo />
  },
}
