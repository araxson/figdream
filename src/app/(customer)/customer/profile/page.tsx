import { Suspense } from 'react'
import { ProfileSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'
import { Skeleton } from '@/components/ui/skeleton'
// import { ProfileHeader } from '@/components/sections/profile/header'
// import { ProfileForm } from '@/components/sections/profile/form'

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Suspense fallback={<div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /></div>}>
        {/* <ProfileHeader /> */}
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information</p>
        </div>
      </Suspense>
      
      <Suspense fallback={<ProfileSkeleton />}>
        {/* <ProfileForm /> */}
        <div className="border rounded-lg p-6">
          <p className="text-muted-foreground text-center">Profile form will appear here</p>
        </div>
      </Suspense>
    </div>
  )
}