'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Play, 
  Square, 
  Coffee, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import type { AttendanceBreak, ClockInOutDTO, StaffAttendance } from '../types';

interface TimeClockProps {
  staffId: string;
  currentShift?: {
    clockedIn: boolean;
    clockInTime?: string;
    currentBreak?: AttendanceBreak;
    totalHours: number;
    overtimeHours: number;
  };
  todayAttendance?: StaffAttendance;
  notes: string;
  location: { latitude: number; longitude: number } | null;
  onNotesChange: (notes: string) => void;
  onClockAction: (action: ClockInOutDTO) => void;
}

export function TimeClock({
  staffId,
  currentShift,
  todayAttendance,
  notes,
  location,
  onNotesChange,
  onClockAction
}: TimeClockProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getAttendanceStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="default">Present</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'late':
        return <Badge variant="secondary">Late</Badge>;
      case 'early_leave':
        return <Badge variant="outline">Early Leave</Badge>;
      case 'holiday':
        return <Badge variant="secondary">Holiday</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleClockAction = (type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end') => {
    onClockAction({
      staff_id: staffId,
      timestamp: new Date().toISOString(),
      type,
      location: location || undefined,
      notes: notes || undefined
    });
    onNotesChange('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Time Clock</CardTitle>
          <CardDescription>Clock in/out and manage your work time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentShift?.clockedIn ? (
            <div className="space-y-4">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  You clocked in at {currentShift.clockInTime && new Date(currentShift.clockInTime).toLocaleTimeString()}.
                  Current session: {formatDuration((currentShift.totalHours || 0) * 60)}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!currentShift.currentBreak ? (
                  <>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => handleClockAction('break_start')}
                      className="h-20"
                    >
                      <Coffee className="h-6 w-6 mr-2" />
                      Start Break
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => handleClockAction('clock_out')}
                      className="h-20"
                    >
                      <Square className="h-6 w-6 mr-2" />
                      Clock Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Alert>
                      <Coffee className="h-4 w-4" />
                      <AlertDescription>
                        Break started at {new Date(currentShift.currentBreak.start_time).toLocaleTimeString()}
                      </AlertDescription>
                    </Alert>
                    <Button
                      size="lg"
                      onClick={() => handleClockAction('break_end')}
                      className="h-20"
                    >
                      <Play className="h-6 w-6 mr-2" />
                      End Break
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <Button
              size="lg"
              onClick={() => handleClockAction('clock_in')}
              className="w-full h-20 text-lg"
            >
              <Play className="h-8 w-8 mr-3" />
              Clock In
            </Button>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add any notes about your shift..."
              rows={3}
            />
          </div>

          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Location verified</span>
            </div>
          )}

          {currentShift?.overtimeHours && currentShift.overtimeHours > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have {formatDuration(currentShift.overtimeHours * 60)} of overtime today.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {todayAttendance && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Clock In</Label>
                <p className="font-medium">
                  {todayAttendance.clock_in ?
                    new Date(todayAttendance.clock_in).toLocaleTimeString() :
                    'Not clocked in'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Clock Out</Label>
                <p className="font-medium">
                  {todayAttendance.clock_out ?
                    new Date(todayAttendance.clock_out).toLocaleTimeString() :
                    'Not clocked out'}
                </p>
              </div>
            </div>

            {todayAttendance.breaks.length > 0 && (
              <div>
                <Label className="text-muted-foreground">Breaks</Label>
                <div className="space-y-1 mt-1">
                  {todayAttendance.breaks.map((break_period, index) => (
                    <div key={index} className="text-sm flex items-center justify-between">
                      <span>
                        {new Date(break_period.start_time).toLocaleTimeString()} -
                        {new Date(break_period.end_time).toLocaleTimeString()}
                      </span>
                      <span className="text-muted-foreground">
                        {formatDuration(break_period.duration_minutes)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                {getAttendanceStatusBadge(todayAttendance.status)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}