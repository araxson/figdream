import { Suspense } from 'react'
import { CardGridSkeleton, TableSkeleton, ListItemSkeleton } from '@/components/ui/skeleton-variants'
import { Skeleton } from '@/components/ui/skeleton'
// import { StaffCustomersHeader } from '@/components/sections/staff/customers/header'
// import { MyCustomers } from '@/components/sections/staff/customers/list'
// import { CustomerStats } from '@/components/sections/staff/customers/stats'
// import { TopCustomers } from '@/components/sections/staff/customers/top'

export default function StaffCustomersPage() {
  return (
    <div className="flex-1 space-y-8 p-8">
      <Suspense fallback={<div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /></div>}>
        {/* <StaffCustomersHeader /> */}
        <div>
          <h1 className="text-3xl font-bold">My Customers</h1>
          <p className="text-muted-foreground">Manage your customer relationships</p>
        </div>
      </Suspense>
      
      <Suspense fallback={<CardGridSkeleton count={3} className="md:grid-cols-3" />}>
        {/* <CustomerStats /> */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Customer Statistics</h2>
          <p className="text-muted-foreground">Your customer metrics will appear here</p>
        </div>
      </Suspense>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Suspense fallback={<TableSkeleton count={8} />}>
            {/* <MyCustomers /> */}
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-2">My Customers</h3>
              <p className="text-muted-foreground">Your customer list will appear here</p>
            </div>
          </Suspense>
        </div>
        
        <Suspense fallback={<div className="space-y-3">{[...Array(5)].map((_, i) => <ListItemSkeleton key={i} />)}</div>}>
          {/* <TopCustomers /> */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Top Customers</h3>
            <p className="text-muted-foreground">Your loyal customers will appear here</p>
          </div>
        </Suspense>
      </div>
    </div>
  )
}