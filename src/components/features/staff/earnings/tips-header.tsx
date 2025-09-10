import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function StaffTipsHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tips</h1>
        <p className="text-muted-foreground">
          Track your tips and earnings
        </p>
      </div>
      <Button>
        <Download className="mr-2 h-4 w-4" />
        Export Report
      </Button>
    </div>
  )
}