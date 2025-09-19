'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Clock,
  Play,
  Pause,
  Square,
  Calendar as CalendarIcon,
  MapPin,
  AlertTriangle,
  Coffee,
  CheckCircle,
  XCircle,
  Download,
  Filter,
  Timer,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import type { StaffAttendance, AttendanceBreak, ClockInOutDTO, AttendanceFilters } from '../types';

interface TimeAttendanceTrackerProps {
  staffId: string;
  attendance?: StaffAttendance[];
  currentShift?: {
    clockedIn: boolean;
    clockInTime?: string;
    currentBreak?: AttendanceBreak;
    totalHours: number;
    overtimeHours: number;
  };
  onClockAction?: (action: ClockInOutDTO) => void;
  onExport?: (filters: AttendanceFilters, format: 'csv' | 'pdf') => void;
}

export function TimeAttendanceTracker({
  staffId,
  attendance = [],
  currentShift,
  onClockAction,
  onExport
}: TimeAttendanceTrackerProps) {
  const [activeTab, setActiveTab] = useState('clock');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filters, setFilters] = useState<AttendanceFilters>({
    date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0]
  });
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Get current location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleClockAction = (type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end') => {
    if (onClockAction) {
      onClockAction({
        staff_id: staffId,
        timestamp: new Date().toISOString(),
        type,
        location: location || undefined,
        notes: notes || undefined
      });
    }
    setNotes('');
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getAttendanceStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Present</Badge>;
      case 'absent':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Absent</Badge>;
      case 'late':
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Late</Badge>;
      case 'early_leave':
        return <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />Early Leave</Badge>;
      case 'holiday':
        return <Badge variant="secondary">Holiday</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendance.find(a => a.date === today);
  };

  const getWeeklyStats = () => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekAttendance = attendance.filter(a => {
      const date = new Date(a.date);
      return date >= weekStart && date <= weekEnd;
    });

    return {
      totalHours: weekAttendance.reduce((sum, a) => sum + a.total_hours, 0),
      overtimeHours: weekAttendance.reduce((sum, a) => sum + a.overtime_hours, 0),
      daysPresent: weekAttendance.filter(a => a.status === 'present').length,
      daysLate: weekAttendance.filter(a => a.status === 'late').length
    };
  };

  const todayAttendance = getTodayAttendance();
  const weeklyStats = getWeeklyStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Time & Attendance</h2>
          <p className="text-muted-foreground">Track your work hours and manage attendance</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold">{formatTime(currentTime)}</p>
          <p className="text-sm text-muted-foreground">{currentTime.toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayAttendance ? formatDuration(todayAttendance.total_hours * 60) : '0h 0m'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentShift?.clockedIn ? 'Currently working' : 'Not clocked in'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(weeklyStats.totalHours * 60)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {weeklyStats.overtimeHours > 0 && `+${formatDuration(weeklyStats.overtimeHours * 60)} overtime`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyStats.daysPresent > 0 ? Math.round((weeklyStats.daysPresent / 7) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {weeklyStats.daysPresent}/7 days this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
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

      {weeklyStats.daysLate > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You've been late {weeklyStats.daysLate} time(s) this week. Please arrive on time to maintain good attendance.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clock">Clock In/Out</TabsTrigger>
          <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="clock" className="space-y-4">
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
                <div className="space-y-4">
                  <Button
                    size="lg"
                    onClick={() => handleClockAction('clock_in')}
                    className="w-full h-20 text-lg"
                  >
                    <Play className="h-8 w-8 mr-3" />
                    Clock In
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>{new Date().toLocaleDateString('en-US', {
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
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Attendance History</CardTitle>
                  <CardDescription>Your recent attendance records</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={filters.date_from}
                    onValueChange={(value) => setFilters({ ...filters, date_from: value })}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]}>
                        This Month
                      </SelectItem>
                      <SelectItem value={new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0]}>
                        Last Month
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {onExport && (
                    <Button variant="outline" onClick={() => onExport(filters, 'csv')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {record.clock_in ?
                          new Date(record.clock_in).toLocaleTimeString() :
                          '-'}
                      </TableCell>
                      <TableCell>
                        {record.clock_out ?
                          new Date(record.clock_out).toLocaleTimeString() :
                          '-'}
                      </TableCell>
                      <TableCell>{formatDuration(record.total_hours * 60)}</TableCell>
                      <TableCell>
                        {record.overtime_hours > 0 ?
                          formatDuration(record.overtime_hours * 60) :
                          '-'}
                      </TableCell>
                      <TableCell>{getAttendanceStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}