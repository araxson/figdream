import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'

export function StaffHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Members</h1>
        <p className="text-muted-foreground">
          Manage your team and their schedules
        </p>
      </div>
      <Button>
        <UserPlus className="mr-2 h-4 w-4" />
        Add Staff Member
      </Button>
    </div>
  )
}