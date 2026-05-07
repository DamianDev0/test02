import { UserPlusIcon, BanknoteIcon, SendIcon } from 'lucide-react'
import { MilestoneStepper } from '@/shared/ui/ruixen/milestone-stepper'

interface OnboardingPasosProps {
  paso1: { titulo: string; descripcion: string }
  paso2: { titulo: string; descripcion: string }
  paso3: { titulo: string; descripcion: string }
}

export function OnboardingPasos({ paso1, paso2, paso3 }: Readonly<OnboardingPasosProps>) {
  return (
    <MilestoneStepper
      variant="compact"
      currentMilestone={0}
      milestones={[
        { id: 'crear', title: paso1.titulo, description: paso1.descripcion, icon: <UserPlusIcon className="size-4" /> },
        { id: 'cargar', title: paso2.titulo, description: paso2.descripcion, icon: <BanknoteIcon className="size-4" /> },
        { id: 'pagar', title: paso3.titulo, description: paso3.descripcion, icon: <SendIcon className="size-4" /> },
      ]}
    />
  )
}
