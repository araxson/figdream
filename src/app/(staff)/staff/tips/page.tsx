// import { StaffTipsHeader } from '@/components/sections/staff/tips/header'
// import { TipsSummary } from '@/components/sections/staff/tips/summary'
// import { TipsHistory } from '@/components/sections/staff/tips/history'
// import { TipsAnalytics } from '@/components/sections/staff/tips/analytics'

export default function StaffTipsPage() {
  return (
    <div className="flex-1 space-y-8 p-8">
      {/* <StaffTipsHeader /> */}
      {/* <TipsSummary /> */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Tips Summary</h2>
        <p className="text-muted-foreground">Your tips overview will appear here</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* <TipsHistory /> */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Tips History</h3>
            <p className="text-muted-foreground">Your tips history will appear here</p>
          </div>
        </div>
        {/* <TipsAnalytics /> */}
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Tips Analytics</h3>
          <p className="text-muted-foreground">Your tips analytics will appear here</p>
        </div>
      </div>
    </div>
  )
}