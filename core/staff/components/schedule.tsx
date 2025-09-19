import { Suspense } from "react";
import {
  getStaffMemberByUserId,
  getStaffSchedules,
} from "../dal/staff-queries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/core/ui/components";

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export async function StaffSchedule() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const staff = await getStaffMemberByUserId(user.id);

  if (!staff) {
    return (
      <div className="container py-6">
        <p>Staff profile not found</p>
      </div>
    );
  }

  const schedules = await getStaffSchedules(staff.id);

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">My Schedule</h1>

      <Suspense fallback={<LoadingState />}>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const schedule = schedules.find((s) => s.day_of_week === day);
                return (
                  <div
                    key={day}
                    className="flex items-center justify-between py-2 border-b"
                  >
                    <span className="font-medium capitalize">{day}</span>
                    {schedule && schedule.is_active ? (
                      <span className="text-sm">
                        {schedule.start_time} - {schedule.end_time}
                        {schedule.break_start && schedule.break_end && (
                          <span className="text-muted-foreground ml-2">
                            (Break: {schedule.break_start} -{" "}
                            {schedule.break_end})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Off</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </Suspense>
    </div>
  );
}
