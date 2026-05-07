import { Skeleton } from '@/shared/ui'

export default function Loading() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </main>
  )
}
