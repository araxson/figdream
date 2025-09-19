'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import type { StaffAttendance } from '../../types';

interface AttendanceStatsCardsProps {
  weeklyStats: {
    totalHours: number;
    daysPresent: number;
    overtimeHours: number;
    avgDailyHours: number;
  };
  currentShift?: StaffAttendance | null;
  formatDuration: (minutes: number) => string;
}

export function AttendanceStatsCards({
  weeklyStats,
  currentShift,
  formatDuration
}: AttendanceStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Week Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {formatDuration(weeklyStats.totalHours * 60)}
            </span>
            {weeklyStats.avgDailyHours > 0 && (
              <TrendingUp className="h-4 w-4 text-green-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {weeklyStats.overtimeHours > 0 &&
              `+${formatDuration(weeklyStats.overtimeHours * 60)} overtime`
            }
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Attendance Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {weeklyStats.daysPresent > 0
              ? Math.round((weeklyStats.daysPresent / 7) * 100)
              : 0}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {weeklyStats.daysPresent}/7 days this week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {currentShift?.clockedIn ? (
              <>
                <Badge variant="default">Clocked In</Badge>
                {currentShift.currentBreak && (
                  <Badge variant="secondary">On Break</Badge>
                )}
              </>
            ) : (
              <Badge variant="outline">Off Duty</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}