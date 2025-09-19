'use client';

import { StaffProfileCard } from '../profiles/staff-profile-card';
import type { StaffProfileWithDetails } from '../types';

interface StaffGridViewProps {
  staff: StaffProfileWithDetails[];
  selectedStaff: string[];
  onSelectStaff: (staffId: string, checked: boolean) => void;
  onEditStaff?: (staff: StaffProfileWithDetails) => void;
  onDeleteStaff?: (id: string) => void;
  onViewStaff?: (staff: StaffProfileWithDetails) => void;
}

export function StaffGridView({
  staff,
  selectedStaff,
  onSelectStaff,
  onEditStaff,
  onDeleteStaff,
  onViewStaff
}: StaffGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {staff.map((staffMember) => (
        <StaffProfileCard
          key={staffMember.id}
          staff={staffMember}
          isSelected={selectedStaff.includes(staffMember.id)}
          onSelect={(checked) => onSelectStaff(staffMember.id, checked)}
          onEdit={onEditStaff ? () => onEditStaff(staffMember) : undefined}
          onDelete={onDeleteStaff ? () => onDeleteStaff(staffMember.id) : undefined}
          onView={onViewStaff ? () => onViewStaff(staffMember) : undefined}
        />
      ))}
    </div>
  );
}