'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Settings } from 'lucide-react';

interface StaffBulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: string) => void;
}

export function StaffBulkActions({ selectedCount, onBulkAction }: StaffBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">{selectedCount} staff member{selectedCount > 1 ? 's' : ''} selected</span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Select onValueChange={onBulkAction}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Bulk Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activate">Activate Selected</SelectItem>
            <SelectItem value="deactivate">Deactivate Selected</SelectItem>
            <SelectItem value="feature">Make Featured</SelectItem>
            <SelectItem value="unfeature">Remove Featured</SelectItem>
            <SelectItem value="make_bookable">Make Bookable</SelectItem>
            <SelectItem value="make_unbookable">Make Not Bookable</SelectItem>
            <SelectItem value="export_selected">Export Selected</SelectItem>
            <SelectItem value="delete_selected" className="text-red-600">Delete Selected</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={() => onBulkAction('clear_selection')}>
          <Settings className="h-4 w-4 mr-2" />
          Clear Selection
        </Button>
      </div>
    </div>
  );
}