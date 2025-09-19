'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { StaffAttendance, AttendanceFilters } from '../types';

interface AttendanceHistoryProps {
  attendance: StaffAttendance[];
  filters: AttendanceFilters;
  onFiltersChange: (filters: AttendanceFilters) => void;
  onExport?: (filters: AttendanceFilters, format: 'csv' | 'pdf') => void;
}

export function AttendanceHistory({
  attendance,
  filters,
  onFiltersChange,
  onExport
}: AttendanceHistoryProps) {
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

  return (
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
              onValueChange={(value) => onFiltersChange({ ...filters, date_from: value })}
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
  );
}