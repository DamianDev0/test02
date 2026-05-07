// Public API de shared/ui — primitivas UI sin conocimiento del dominio.
//
// Estructura:
//   shadcn/   ← vendor primitives (instalados con `pnpm dlx shadcn add`)
//   atoms/    ← (futuro) custom atoms con conocimiento del proyecto
//   molecules/← (futuro) custom molecules
//   organisms/← (futuro, raro) custom organisms genéricos
//
// Categorización Atomic mental — exports agrupados por nivel.

// ── Atoms (shadcn) ──────────────────────────────────
export { Button, buttonVariants } from './shadcn/button'
export { Input } from './shadcn/input'
export { Label } from './shadcn/label'
export { Badge, badgeVariants } from './shadcn/badge'
export { Skeleton } from './shadcn/skeleton'
export { Separator } from './shadcn/separator'

// ── Molecules (shadcn) ──────────────────────────────
export {
  Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter, CardAction,
} from './shadcn/card'
export {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
  DialogOverlay, DialogPortal,
} from './shadcn/dialog'
export {
  Select, SelectTrigger, SelectContent, SelectItem,
  SelectValue, SelectGroup, SelectLabel, SelectSeparator,
  SelectScrollUpButton, SelectScrollDownButton,
} from './shadcn/select'
export { Textarea } from './shadcn/textarea'
export { Alert, AlertTitle, AlertDescription, AlertAction } from './shadcn/alert'

// ── Organisms genéricos (shadcn) ────────────────────
export { Toaster } from './shadcn/sonner'

// ── Organisms custom ────────────────────────────────
export {
  Form, useFormField, useFormContext,
  deriveFormStatus, deriveFormStatusMessage, deriveFormFieldErrors,
} from './form'
export type { FormStatus, FormRootProps, FormActionState } from './form'
