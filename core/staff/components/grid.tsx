"use client";

import { useState } from "react";
import { MoreHorizontal, Star, Calendar, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface StaffGridProps {
  staff: StaffProfileWithRelations[];
  role: "admin" | "owner" | "manager";
}

export function StaffGrid({ staff, role }: StaffGridProps) {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);

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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {staff.map((member) => (
        <Card key={member.id} className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.user?.avatar_url || ""} />
                  <AvatarFallback>
                    {member.user?.display_name?.slice(0, 2).toUpperCase() ||
                      "ST"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{member.user?.display_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {member.title}
                  </p>
                </div>
              </div>

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
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {member.is_featured && (
                <Badge variant="default">
                  <Star className="mr-1 h-3 w-3" />
                  Featured
                </Badge>
              )}
              {member.is_bookable ? (
                <Badge variant="default">Bookable</Badge>
              ) : (
                <Badge variant="secondary">Not Bookable</Badge>
              )}
              {member.employment_type && (
                <Badge variant="outline">
                  {member.employment_type.replace("_", " ")}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Rating</p>
                <p className="font-medium">
                  {member.rating_average ? (
                    <>
                      {member.rating_average.toFixed(1)}
                      <Star className="ml-1 inline h-3 w-3 fill-current" />
                    </>
                  ) : (
                    "No ratings"
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Appointments</p>
                <p className="font-medium">{member.total_appointments || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Revenue</p>
                <p className="font-medium">
                  ${(member.total_revenue || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Commission</p>
                <p className="font-medium">{member.commission_rate || 0}%</p>
              </div>
            </div>

            {member.bio && (
              <div>
                <p className="text-sm text-muted-foreground">Bio</p>
                <p className="text-sm line-clamp-2">{member.bio}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                View Profile
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
