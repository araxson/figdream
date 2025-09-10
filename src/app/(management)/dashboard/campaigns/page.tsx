import { Suspense } from 'react'
// import { CampaignsHeader } from '@/components/sections/owner/campaigns/header'
// import { CampaignsList } from '@/components/sections/owner/campaigns/list'
import { Skeleton } from '@/components/ui/skeleton'

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      {/* <CampaignsHeader /> */}
      
      <Suspense fallback={<Skeleton className="h-[500px]" />}>
        {/* <CampaignsList /> */}
        <div className="border rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Marketing Campaigns</h2>
          <p className="text-muted-foreground">Campaign management coming soon</p>
        </div>
      </Suspense>
    </div>
  )
}