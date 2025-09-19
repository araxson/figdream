'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar as CalendarIcon,
  Clock,
  Coffee,
  Plus,
  Edit,
  Trash2,
  Copy,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { StaffSchedule, WeeklySchedule, DaySchedule, TimeOffRequest, DayOfWeek } from '../types';

interface ScheduleManagerProps {
  staffId: string;
  schedules?: StaffSchedule[];
  timeOffRequests?: TimeOffRequest[];
  onScheduleUpdate?: (schedule: WeeklySchedule) => void;
  onTimeOffRequest?: (request: Partial<TimeOffRequest>) => void;
  onScheduleSwap?: (date: string, targetStaffId: string) => void;
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

const DEFAULT_SCHEDULE: DaySchedule = {
  start_time: '09:00',
  end_time: '17:00',
  breaks: [{
    start_time: '12:00',
    end_time: '13:00',
    type: 'lunch'
  }],
  is_working: true
};

export function ScheduleManager({
  staffId,
  schedules = [],
  timeOffRequests = [],
  onScheduleUpdate,
  onTimeOffRequest,
  onScheduleSwap
}: ScheduleManagerProps) {
  const [activeTab, setActiveTab] = useState('weekly');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [editingDay, setEditingDay] = useState<DayOfWeek | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(() => {
    const schedule: WeeklySchedule = {};
    schedules.forEach((s) => {
      schedule[s.day_of_week as DayOfWeek] = {
        start_time: s.start_time,
        end_time: s.end_time,
        breaks: s.break_start && s.break_end ? [{
          start_time: s.break_start,
          end_time: s.break_end,
          type: 'lunch'
        }] : [],
        is_working: s.is_active
      };
    });
    return schedule;
  });

  const [timeOffForm, setTimeOffForm] = useState({
    start_date: '',
    end_date: '',
    type: 'vacation',
    reason: '',
    notify_customers: true,
    auto_reschedule: false
  });

  const handleDayScheduleUpdate = (day: DayOfWeek, schedule: DaySchedule) => {
    const updated = {
      ...weeklySchedule,
      [day]: schedule
    };
    setWeeklySchedule(updated);
    setEditingDay(null);
  };

  const handleCopySchedule = (fromDay: DayOfWeek, toDay: DayOfWeek) => {
    const schedule = weeklySchedule[fromDay];
    if (schedule) {
      setWeeklySchedule({
        ...weeklySchedule,
        [toDay]: { ...schedule }
      });
    }
  };

  const handleApplyToAllDays = (schedule: DaySchedule) => {
    const updated: WeeklySchedule = {};
    DAYS_OF_WEEK.forEach(day => {
      updated[day] = { ...schedule };
    });
    setWeeklySchedule(updated);
  };

  const handleSaveSchedule = () => {
    if (onScheduleUpdate) {
      onScheduleUpdate(weeklySchedule);
    }
  };

  const handleTimeOffSubmit = () => {
    if (onTimeOffRequest) {
      onTimeOffRequest({
        staff_id: staffId,
        ...timeOffForm,
        status: 'pending'
      });
      // Reset form
      setTimeOffForm({
        start_date: '',
        end_date: '',
        type: 'vacation',
        reason: '',
        notify_customers: true,
        auto_reschedule: false
      });
    }
  };

  const getUpcomingTimeOff = () => {
    return timeOffRequests
      .filter(req => req.status === 'approved' && new Date(req.end_date) >= new Date())
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  };

  const getPendingTimeOff = () => {
    return timeOffRequests.filter(req => req.status === 'pending');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Management</CardTitle>
          <CardDescription>
            Manage weekly schedules, time off requests, and shift swaps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="timeoff">Time Off</TabsTrigger>
              <TabsTrigger value="swaps">Shift Swaps</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Weekly Schedule Template</h3>
                <Button onClick={handleSaveSchedule}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Schedule
                </Button>
              </div>

              <div className="space-y-2">
                {DAYS_OF_WEEK.map((day) => {
                  const schedule = weeklySchedule[day] || DEFAULT_SCHEDULE;
                  const isEditing = editingDay === day;

                  return (
                    <Card key={day} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-32">
                            <span className="font-medium capitalize">{day}</span>
                          </div>

                          {!isEditing ? (
                            <>
                              {schedule.is_working ? (
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                      {schedule.start_time} - {schedule.end_time}
                                    </span>
                                  </div>
                                  {schedule.breaks && schedule.breaks.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <Coffee className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">
                                        Break: {schedule.breaks[0].start_time} - {schedule.breaks[0].end_time}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="outline">Day Off</Badge>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-4 flex-1">
                              <Switch
                                checked={schedule.is_working}
                                onCheckedChange={(checked) => {
                                  handleDayScheduleUpdate(day, {
                                    ...schedule,
                                    is_working: checked
                                  });
                                }}
                              />
                              {schedule.is_working && (
                                <>
                                  <Input
                                    type="time"
                                    value={schedule.start_time}
                                    onChange={(e) => {
                                      handleDayScheduleUpdate(day, {
                                        ...schedule,
                                        start_time: e.target.value
                                      });
                                    }}
                                    className="w-32"
                                  />
                                  <span>to</span>
                                  <Input
                                    type="time"
                                    value={schedule.end_time}
                                    onChange={(e) => {
                                      handleDayScheduleUpdate(day, {
                                        ...schedule,
                                        end_time: e.target.value
                                      });
                                    }}
                                    className="w-32"
                                  />
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!isEditing ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingDay(day)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Select
                                onValueChange={(value) => handleCopySchedule(day, value as DayOfWeek)}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <Copy className="h-4 w-4 mr-2" />
                                  <span>Copy to</span>
                                </SelectTrigger>
                                <SelectContent>
                                  {DAYS_OF_WEEK.filter(d => d !== day).map(d => (
                                    <SelectItem key={d} value={d}>
                                      <span className="capitalize">{d}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDayScheduleUpdate(day, schedule)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingDay(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    const monday = weeklySchedule['monday'];
                    if (monday) {
                      handleApplyToAllDays(monday);
                    }
                  }}
                >
                  Apply Monday Schedule to All Days
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </div>
                <div>
                  {selectedDate && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {selectedDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Schedule</Label>
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">09:00 AM - 05:00 PM</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Coffee className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Break: 12:00 PM - 01:00 PM</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Appointments</Label>
                          <div className="space-y-2">
                            <div className="p-2 border rounded-lg">
                              <p className="text-sm font-medium">10:00 AM - 11:00 AM</p>
                              <p className="text-sm text-muted-foreground">Hair Cut & Style</p>
                            </div>
                            <div className="p-2 border rounded-lg">
                              <p className="text-sm font-medium">02:00 PM - 03:30 PM</p>
                              <p className="text-sm text-muted-foreground">Hair Color Treatment</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeoff" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request Time Off</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={timeOffForm.start_date}
                        onChange={(e) => setTimeOffForm({
                          ...timeOffForm,
                          start_date: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={timeOffForm.end_date}
                        onChange={(e) => setTimeOffForm({
                          ...timeOffForm,
                          end_date: e.target.value
                        })}
                        min={timeOffForm.start_date}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={timeOffForm.type}
                      onValueChange={(value) => setTimeOffForm({
                        ...timeOffForm,
                        type: value
                      })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vacation">Vacation</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="maternity">Maternity</SelectItem>
                        <SelectItem value="paternity">Paternity</SelectItem>
                        <SelectItem value="bereavement">Bereavement</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      value={timeOffForm.reason}
                      onChange={(e) => setTimeOffForm({
                        ...timeOffForm,
                        reason: e.target.value
                      })}
                      placeholder="Please provide a reason for your time off request..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify-customers">Notify Customers</Label>
                      <Switch
                        id="notify-customers"
                        checked={timeOffForm.notify_customers}
                        onCheckedChange={(checked) => setTimeOffForm({
                          ...timeOffForm,
                          notify_customers: checked
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-reschedule">Auto-Reschedule Appointments</Label>
                      <Switch
                        id="auto-reschedule"
                        checked={timeOffForm.auto_reschedule}
                        onCheckedChange={(checked) => setTimeOffForm({
                          ...timeOffForm,
                          auto_reschedule: checked
                        })}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleTimeOffSubmit}
                    disabled={!timeOffForm.start_date || !timeOffForm.end_date || !timeOffForm.reason}
                  >
                    Submit Request
                  </Button>
                </CardContent>
              </Card>

              {getPendingTimeOff().length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pending Requests</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {getPendingTimeOff().map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {request.start_date} - {request.end_date}
                          </p>
                          <p className="text-sm text-muted-foreground">{request.type} - {request.reason}</p>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {getUpcomingTimeOff().length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Time Off</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {getUpcomingTimeOff().map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {request.start_date} - {request.end_date}
                          </p>
                          <p className="text-sm text-muted-foreground">{request.type}</p>
                        </div>
                        <Badge variant="default">Approved</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="swaps" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Request to swap shifts with other staff members. All swap requests require manager approval.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request Shift Swap</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Your Shift Date</Label>
                    <Input type="date" />
                  </div>

                  <div className="space-y-2">
                    <Label>Swap With</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff1">John Doe</SelectItem>
                        <SelectItem value="staff2">Jane Smith</SelectItem>
                        <SelectItem value="staff3">Mike Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Their Shift Date</Label>
                    <Input type="date" />
                  </div>

                  <div className="space-y-2">
                    <Label>Reason for Swap</Label>
                    <Textarea
                      placeholder="Please provide a reason for the shift swap..."
                      rows={3}
                    />
                  </div>

                  <Button className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Submit Swap Request
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}