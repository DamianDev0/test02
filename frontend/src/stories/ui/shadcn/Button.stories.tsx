import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ArrowRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

const meta: Meta<typeof Button> = {
  title: 'shadcn/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Base button primitive (Base UI). Supports variants, sizes, and `render` prop for polymorphism (e.g. wrapping a `Link`).',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
    },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: { children: 'Continuar' },
}

export const Outline: Story = {
  args: { variant: 'outline', children: 'Cancelar' },
}

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Eliminar' },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        Siguiente
        <ArrowRightIcon />
      </>
    ),
  },
}

export const Loading: Story = {
  args: { disabled: true, children: 'Procesando…' },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="default">Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="xs">XS</Button>
      <Button size="sm">SM</Button>
      <Button size="default">Default</Button>
      <Button size="lg">LG</Button>
    </div>
  ),
}
