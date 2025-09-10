import { Button } from '@/components/ui/button'
import { Building2 } from 'lucide-react'

export function SalonsHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Salons</h1>
        <p className="text-muted-foreground">
          Manage all registered salons
        </p>
      </div>
      <Button>
        <Building2 className="mr-2 h-4 w-4" />
        Add Salon
      </Button>
    </div>
  )
}