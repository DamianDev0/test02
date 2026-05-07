import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/ui'

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-lg font-semibold">Página no encontrada</h2>
      <p className="text-sm text-muted-foreground">
        La página que buscas no existe.
      </p>
      <Button render={<Link href="/dashboard" />}>Ir al inicio</Button>
    </main>
  )
}
