import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface RootProps {
  children: ReactNode
  className?: string
}

function Root({ children, className }: Readonly<RootProps>) {
  return <Card className={className}>{children}</Card>
}

interface TitleProps {
  children: ReactNode
}

function Title({ children }: Readonly<TitleProps>) {
  return (
    <CardHeader className="pb-2">
      <p className="text-sm font-semibold">{children}</p>
    </CardHeader>
  )
}

interface EmptyProps {
  children: ReactNode
}

function Empty({ children }: Readonly<EmptyProps>) {
  return (
    <CardContent>
      <p className="text-sm text-muted-foreground text-center py-6">{children}</p>
    </CardContent>
  )
}

interface ListProps {
  children: ReactNode
}

function List({ children }: Readonly<ListProps>) {
  return <CardContent className="p-0 pb-2">{children}</CardContent>
}

export const TransaccionesFeed = Object.assign(Root, { Title, Empty, List })
