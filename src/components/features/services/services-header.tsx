import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function ServicesHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground">
          Manage your salon services and pricing
        </p>
      </div>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add Service
      </Button>
    </div>
  )
}