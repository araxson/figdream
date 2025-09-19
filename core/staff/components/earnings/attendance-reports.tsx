'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { StaffAttendance } from '../types';

interface AttendanceReportsProps {
  weeklyStats: {
    totalHours: number;
    overtimeHours: number;
    daysPresent: number;
    daysLate: number;
  };
  attendance: StaffAttendance[];
}

export function AttendanceReports({ weeklyStats, attendance }: AttendanceReportsProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Hours</span>
                <span className="font-medium">{formatDuration(weeklyStats.totalHours * 60)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Overtime</span>
                <span className="font-medium">{formatDuration(weeklyStats.overtimeHours * 60)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Days Present</span>
                <span className="font-medium">{weeklyStats.daysPresent}/7</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Late Arrivals</span>
                <span className="font-medium">{weeklyStats.daysLate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end justify-between gap-1">
              {[...Array(30)].map((_, index) => {
                const height = Math.random() * 100;
                return (
                  <div
                    key={index}
                    className="flex-1 bg-primary/20 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Daily hours worked this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attendance Analytics</CardTitle>
          <CardDescription>Insights into your attendance patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">7.8h</div>
              <p className="text-sm text-muted-foreground">Avg Daily Hours</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2</div>
              <p className="text-sm text-muted-foreground">Late Days</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">On-time arrival rate</span>
              <span className="text-sm font-medium">95%</span>
            </div>
            <Progress value={95} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Average overtime per week</span>
              <span className="text-sm font-medium">2.5 hours</span>
            </div>
            <Progress value={25} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}