'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Coffee } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface AttendanceScheduleProps {
  selectedDate: Date;
}

export function AttendanceSchedule({ selectedDate }: AttendanceScheduleProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Schedule</CardTitle>
        <CardDescription>{selectedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Scheduled Hours</span>
            </div>
            <span>9:00 AM - 5:00 PM</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Break Time</span>
            </div>
            <span>12:00 PM - 1:00 PM</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Appointments Today</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">10:00 AM - 11:00 AM</p>
                <p className="text-sm text-muted-foreground">Hair Cut & Style - John Doe</p>
              </div>
              <Badge variant="outline">Confirmed</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">2:00 PM - 3:30 PM</p>
                <p className="text-sm text-muted-foreground">Hair Color - Jane Smith</p>
              </div>
              <Badge variant="outline">Confirmed</Badge>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Utilization</span>
            <span className="font-medium">75%</span>
          </div>
          <Progress value={75} className="mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}