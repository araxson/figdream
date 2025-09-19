'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { AttendanceStatsCards } from './attendance-stats-cards';
import { TimeClock } from './time-clock';
import { AttendanceSchedule } from './attendance-schedule';
import { AttendanceHistory } from './attendance-history';
import { AttendanceReports } from './attendance-reports';
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


  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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

  const handleClockAction = (action: ClockInOutDTO) => {
    onClockAction?.(action);
  };

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

      <AttendanceStatsCards
        todayAttendance={todayAttendance}
        weeklyStats={weeklyStats}
        currentShift={currentShift}
      />

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
          <TimeClock
            staffId={staffId}
            currentShift={currentShift}
            todayAttendance={todayAttendance}
            notes={notes}
            location={location}
            onNotesChange={setNotes}
            onClockAction={handleClockAction}
          />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <AttendanceSchedule selectedDate={selectedDate || new Date()} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <AttendanceHistory
            attendance={attendance}
            filters={filters}
            onFiltersChange={setFilters}
            onExport={onExport}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <AttendanceReports weeklyStats={weeklyStats} attendance={attendance} />
        </TabsContent>
      </Tabs>
    </div>
  );
}