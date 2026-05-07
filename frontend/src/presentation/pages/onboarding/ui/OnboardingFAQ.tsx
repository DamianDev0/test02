'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const AccordionIndexed = dynamic(() => import('@/shared/ui/ruixen/accordion-indexed'), {
  loading: () => <Skeleton className="h-48 w-full" />,
})

interface FAQItem {
  id: string
  title: string
  content: string
}

interface OnboardingFAQProps {
  title: string
  items: ReadonlyArray<FAQItem>
}

export function OnboardingFAQ({ title, items }: Readonly<OnboardingFAQProps>) {
  const [opened, setOpened] = useState(false)

  return (
    <details
      className="group rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm"
      onToggle={(e) => {
        if ((e.currentTarget as HTMLDetailsElement).open) setOpened(true)
      }}
    >
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <span className="flex items-center justify-between">
          {title}
          <span className="text-xs transition-transform group-open:rotate-90">›</span>
        </span>
      </summary>
      <div className="px-2 pb-2">
        {opened && <AccordionIndexed items={[...items]} defaultValue="" collapsible />}
      </div>
    </details>
  )
}
