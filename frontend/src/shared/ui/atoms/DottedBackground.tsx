import { cn } from '@/lib/utils'

interface DottedBackgroundProps {
  className?: string
}

export function DottedBackground({ className }: Readonly<DottedBackgroundProps>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10',
        '[background-image:radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)]',
        '[background-size:24px_24px]',
        '[mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]',
        className,
      )}
    />
  )
}
