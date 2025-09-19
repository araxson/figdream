'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
  Calendar,
  DollarSign,
  Award
} from 'lucide-react';
import type { StaffProfileWithDetails } from '../types';

interface StaffTableViewProps {
  staff: StaffProfileWithDetails[];
  selectedStaff: string[];
  onSelectStaff: (staffId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onEditStaff?: (staff: StaffProfileWithDetails) => void;
  onDeleteStaff?: (id: string) => void;
  onViewStaff?: (staff: StaffProfileWithDetails) => void;
  onDeleteClick: (staffId: string) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'available':
      return <Badge variant="default">Available</Badge>;
    case 'on_break':
      return <Badge variant="secondary">On Break</Badge>;
    case 'off_duty':
      return <Badge variant="outline">Off Duty</Badge>;
    case 'on_vacation':
      return <Badge variant="destructive">On Vacation</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getEmploymentTypeBadge = (type: string) => {
  switch (type) {
    case 'full_time':
      return <Badge variant="default">Full-Time</Badge>;
    case 'part_time':
      return <Badge variant="secondary">Part-Time</Badge>;
    case 'contractor':
      return <Badge variant="outline">Contractor</Badge>;
    case 'intern':
      return <Badge variant="destructive">Intern</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

export function StaffTableView({
  staff,
  selectedStaff,
  onSelectStaff,
  onSelectAll,
  onEditStaff,
  onDeleteStaff,
  onViewStaff,
  onDeleteClick
}: StaffTableViewProps) {
  const allSelected = staff.length > 0 && selectedStaff.length === staff.length;
  const someSelected = selectedStaff.length > 0 && selectedStaff.length < staff.length;

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Staff Member</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="hidden md:table-cell">Employment</TableHead>
            <TableHead className="hidden lg:table-cell">Rating</TableHead>
            <TableHead className="hidden xl:table-cell">Commission</TableHead>
            <TableHead className="hidden xl:table-cell">Appointments</TableHead>
            <TableHead className="hidden 2xl:table-cell">Revenue</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((staffMember) => (
            <TableRow key={staffMember.id}>
              <TableCell>
                <Checkbox
                  checked={selectedStaff.includes(staffMember.id)}
                  onCheckedChange={(checked) => onSelectStaff(staffMember.id, !!checked)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {staffMember.user?.full_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="font-medium">{staffMember.user?.full_name || 'Staff Member'}</p>
                    <p className="text-sm text-muted-foreground">{staffMember.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {staffMember.is_featured && (
                        <Badge variant="default" className="text-xs">Featured</Badge>
                      )}
                      {staffMember.is_bookable && (
                        <Badge variant="secondary" className="text-xs">Bookable</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{getStatusBadge(staffMember.status)}</TableCell>
              <TableCell className="hidden md:table-cell">{getEmploymentTypeBadge(staffMember.employment_type)}</TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span>{staffMember.rating_average?.toFixed(1) || '0.0'}</span>
                  <span className="text-sm text-muted-foreground">
                    ({staffMember.rating_count || 0})
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <span className="font-medium">{staffMember.commission_rate}%</span>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{staffMember.total_appointments || 0}</span>
                </div>
              </TableCell>
              <TableCell className="hidden 2xl:table-cell">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>${staffMember.total_revenue || 0}</span>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {onViewStaff && (
                      <DropdownMenuItem onClick={() => onViewStaff(staffMember)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                    )}
                    {onEditStaff && (
                      <DropdownMenuItem onClick={() => onEditStaff(staffMember)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Calendar className="h-4 w-4 mr-2" />
                      View Schedule
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Award className="h-4 w-4 mr-2" />
                      View Performance
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {onDeleteStaff && (
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDeleteClick(staffMember.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}