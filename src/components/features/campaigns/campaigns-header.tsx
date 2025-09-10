import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export function CampaignsHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground">
          Create and manage marketing campaigns
        </p>
      </div>
      <Button>
        <Mail className="mr-2 h-4 w-4" />
        Create Campaign
      </Button>
    </div>
  )
}