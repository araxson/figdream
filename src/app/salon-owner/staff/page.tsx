import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StaffTable } from '@/components/salon-owner/staff/staff-table'
import { 
  UserPlus, 
  Users, 
  Settings, 
  Calendar, 
  Clock,
  Award,
  Info,
  Shield
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Staff Management | FigDream',
  description: 'Manage your salon staff members',
}

export default async function StaffManagementPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage your team members and their permissions
          </p>
        </div>
        <Button asChild>
          <Link href="/salon-owner/staff/invitations">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Staff
          </Link>
        </Button>
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Enhanced Security:</strong> Staff members can only be added through invitations. 
          This ensures only authorized personnel join your salon team.
        </AlertDescription>
      </Alert>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Awaiting acceptance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Staff working today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">Team efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Options */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invitations
            </CardTitle>
            <CardDescription>
              Send and manage staff invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/salon-owner/staff/invitations">
                Manage Invitations
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedules
            </CardTitle>
            <CardDescription>
              Manage staff schedules and availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/salon-owner/staff/schedule">
                View Schedules
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Off
            </CardTitle>
            <CardDescription>
              Handle time off requests and breaks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/salon-owner/staff/time-off">
                Manage Time Off
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Services
            </CardTitle>
            <CardDescription>
              Assign services to staff members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/salon-owner/staff/services">
                Manage Services
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Performance
            </CardTitle>
            <CardDescription>
              Track staff performance and metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/salon-owner/staff/performance">
                View Performance
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Breaks
            </CardTitle>
            <CardDescription>
              Configure break patterns and policies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/salon-owner/staff/breaks">
                Manage Breaks
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Staff Members</CardTitle>
          <CardDescription>
            View and manage your current team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StaffTable />
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            How Staff Management Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Invitation-Only System</h3>
            <p className="text-sm text-muted-foreground">
              For security reasons, staff members can only join your salon through invitations. 
              Public registration has been disabled to prevent unauthorized access.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Steps to Add Staff:</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Click &quot;Invite Staff&quot; to send an invitation</li>
              <li>Enter the staff member&apos;s email address</li>
              <li>Choose their role (Staff or Location Manager)</li>
              <li>Send them the invitation link</li>
              <li>They&apos;ll create their account using the invitation</li>
              <li>Once accepted, they&apos;ll appear in your staff list</li>
            </ol>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Permissions</h3>
            <p className="text-sm text-muted-foreground">
              Only salon owners and super administrators can invite new staff members. 
              Location managers can view but not add staff.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}