"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MoreHorizontal,
  Key,
  Trash2,
  Edit,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
} from "lucide-react";

import type { ProfileWithRelations } from "../types";

interface UsersDashboardTableProps {
  users: ProfileWithRelations[];
  selectedUsers: string[];
  onSelectionChange: (selected: string[]) => void;
  onUserAction: (userId: string, action: string) => void;
  isLoading: boolean;
}

export function UsersDashboardTable({
  users,
  selectedUsers,
  onSelectionChange,
  onUserAction,
  isLoading
}: UsersDashboardTableProps) {

  // Get role badge variant
  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "super_admin":
      case "admin":
        return "destructive";
      case "owner":
      case "manager":
        return "default";
      case "staff":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Get status badge
  const getStatusBadge = (user: ProfileWithRelations) => {
    if (user.deleted_at) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (!user.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (!user.is_verified) {
      return <Badge variant="outline">Unverified</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(users.map(user => user.id));
    } else {
      onSelectionChange([]);
    }
  };

  // Handle individual selection
  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedUsers, userId]);
    } else {
      onSelectionChange(selectedUsers.filter(id => id !== userId));
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={users.length > 0 && selectedUsers.length === users.length}
                indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                Loading users...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) =>
                      handleSelectUser(user.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.avatar_url || ""}
                        alt={user.display_name || "User"}
                      />
                      <AvatarFallback>
                        {(user.display_name || user.email || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.display_name || "Unnamed"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role?.replace("_", " ") || "No Role"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getStatusBadge(user)}
                </TableCell>
                <TableCell>
                  {user.last_seen_at ?
                    new Date(user.last_seen_at).toLocaleDateString() :
                    "Never"
                  }
                </TableCell>
                <TableCell>
                  {user.created_at ?
                    new Date(user.created_at).toLocaleDateString() :
                    "Unknown"
                  }
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onUserAction(user.id, "view")}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUserAction(user.id, "edit")}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onUserAction(user.id, "reset_password")}>
                        <Key className="h-4 w-4 mr-2" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onUserAction(user.id, user.is_active ? "deactivate" : "activate")}>
                        {user.is_active ? (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      {!user.deleted_at && (
                        <DropdownMenuItem
                          onClick={() => onUserAction(user.id, "suspend")}
                          className="text-destructive"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}