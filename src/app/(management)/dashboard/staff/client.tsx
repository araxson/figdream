'use client'

import { useState } from 'react'
import { StaffList } from '@/components/features/staff/management/staff-list'
import { StaffInvitations } from '@/components/features/staff/invitations/staff-invitations'
import { TimeOffRequests } from '@/components/features/staff/time-off-manager'
import { ScheduleDisplay } from '@/components/features/staff/schedule/schedule-display'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { StaffInviteForm } from '@/components/features/staff/invitations/invite-form'

export function StaffManagementClient() {
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Invite Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Staff Member</DialogTitle>
              <DialogDescription>
                Send an invitation to add a new staff member to your salon.
              </DialogDescription>
            </DialogHeader>
            <StaffInviteForm onSuccess={() => setIsInviteOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff Members</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="time-off">Time Off Requests</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <StaffList />
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <ScheduleDisplay 
            selectedDate={new Date()} 
            scheduleData={{
              schedules: [],
              breaks: [],
              timeOffRequests: []
            }} 
          />
        </TabsContent>

        <TabsContent value="time-off" className="space-y-4">
          <TimeOffRequests />
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <StaffInvitations />
        </TabsContent>
      </Tabs>
    </div>
  )
}