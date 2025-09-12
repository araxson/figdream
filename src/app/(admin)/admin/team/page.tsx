import { Suspense } from 'react'
import { getTeamMembers } from '@/lib/api/dal/team-members'
import { TeamManagement } from '@/components/features/team/team-management'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users } from 'lucide-react'

async function TeamMembersContent() {
  const teamMembers = await getTeamMembers()
  
  return <TeamManagement initialMembers={teamMembers} />
}

function TeamMembersLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Members
        </CardTitle>
        <CardDescription>Loading team members...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function TeamMembersPage() {
  return (
    <Suspense fallback={<TeamMembersLoading />}>
      <TeamMembersContent />
    </Suspense>
  )
}