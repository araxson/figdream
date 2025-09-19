"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, X } from "lucide-react";
import type { ProfileHeaderProps } from "../profile-utils/profile-types";
import {
  getStatusColor,
  getStatusLabel,
  getUserInitials,
  formatDate,
  formatCurrency
} from "../profile-utils/profile-helpers";

export function ProfileHeader({ user, onClose }: ProfileHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {getUserInitials(user)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">
                {user.first_name} {user.last_name}
              </CardTitle>
              <CardDescription className="text-lg">{user.email}</CardDescription>
              <div className="flex gap-2 mt-2">
                <Badge variant={getStatusColor(user)}>
                  {getStatusLabel(user)}
                </Badge>
                {user.is_verified && (
                  <Badge variant="outline">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {user.role && (
                  <Badge variant="secondary">
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Created</div>
            <div className="font-medium">
              {formatDate(user.created_at)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Last Login</div>
            <div className="font-medium">
              {formatDate(user.last_login_at)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Total Appointments</div>
            <div className="font-medium">{user.total_appointments || 0}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total Spent</div>
            <div className="font-medium">
              {formatCurrency(user.total_spent)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}