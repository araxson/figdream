import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getStaffProfileByIdAction,
  StaffProfileCard,
  ScheduleManager,
  PerformanceDashboard,
  PayrollManager,
  TimeAttendanceTracker
} from '@/core/staff';

export async function StaffDetailPage({ staffId }: { staffId: string }) {
  const result = await getStaffProfileByIdAction(staffId);

  if (!result.success || !result.data) {
    notFound();
  }

  const staff = result.data;

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <StaffProfileCard staff={staff} showActions={false} />

        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <ScheduleManager
              staffId={staff.id}
              schedules={staff.schedules}
              timeOffRequests={staff.upcoming_time_off}
            />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <PerformanceDashboard
              staffId={staff.id}
              performance={staff.performance}
            />
          </TabsContent>

          <TabsContent value="payroll" className="space-y-4">
            <PayrollManager staffId={staff.id} />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <TimeAttendanceTracker staffId={staff.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}