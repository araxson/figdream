"use client";

import { useState } from "react";
import { MoreHorizontal, Star, Edit, Trash2, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StaffProfileWithRelations } from "../dal/staff-types";
import { EmptyState } from "@/core/ui/components/empty-state";

interface StaffListProps {
  staff: StaffProfileWithRelations[];
  role: "admin" | "owner" | "manager";
}

export function StaffList({ staff, role }: StaffListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === staff.length ? [] : staff.map((s) => s.id),
    );
  };

  if (staff.length === 0) {
    return (
      <EmptyState
        preset="staff"
        action={{
          label: "Add Staff Member",
          onClick: () => {
            window.location.href = "/dashboard/staff/new";
          },
        }}
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedIds.length === staff.length}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <TableHead>Staff Member</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Employment</TableHead>
            <TableHead>Performance</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(member.id)}
                  onCheckedChange={() => toggleSelection(member.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.user?.avatar_url || ""} />
                    <AvatarFallback>
                      {member.user?.display_name?.slice(0, 2).toUpperCase() ||
                        "ST"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.user?.display_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.title}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {member.is_active ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  {member.is_bookable && (
                    <Badge variant="outline" className="w-fit">
                      Bookable
                    </Badge>
                  )}
                  {member.is_featured && (
                    <Badge variant="default" className="w-fit">
                      <Star className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {member.employment_type?.replace("_", " ") || "Not specified"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <Star className="mr-1 h-3 w-3 fill-current" />
                    {member.rating_average?.toFixed(1) || "0.0"}
                    <span className="ml-1 text-muted-foreground">
                      ({member.rating_count || 0})
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {member.total_appointments || 0} appointments
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">
                    ${(member.total_revenue || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.commission_rate || 0}% commission
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {(role === "admin" || role === "owner") && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        Manage Schedule
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Staff
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
