import { Suspense } from 'react'
// import { UsersHeader } from '@/components/sections/admin/users/header'
// import { UsersTable } from '@/components/sections/admin/users/table'
import { TableSkeleton, SearchBarSkeleton } from '@/components/ui/skeleton-variants'
import { Skeleton } from '@/components/ui/skeleton'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /></div>}>
        {/* <UsersHeader /> */}
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage system users and permissions</p>
        </div>
      </Suspense>
      
      <Suspense fallback={<SearchBarSkeleton />}>
        {/* Search and filter components will go here */}
      </Suspense>
      
      <Suspense fallback={<TableSkeleton count={10} />}>
        {/* <UsersTable /> */}
        <div className="border rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p className="text-muted-foreground">User table will be displayed here</p>
        </div>
      </Suspense>
    </div>
  )
}