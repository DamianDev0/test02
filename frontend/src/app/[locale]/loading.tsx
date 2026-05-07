import { Skeleton } from '@/shared/ui'
import { DottedBackground } from '@/shared/ui/atoms'

export default function Loading() {
  return (
    <main className="relative flex flex-1 flex-col gap-5 p-4 max-w-lg mx-auto w-full">
      <DottedBackground className="opacity-40" />

      <header className="flex items-end justify-between pt-2">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-7 w-40" />
        </div>
      </header>

      <Skeleton className="h-44 w-full rounded-xl" />

      <div className="rounded-xl border bg-card p-4 space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </main>
  )
}
