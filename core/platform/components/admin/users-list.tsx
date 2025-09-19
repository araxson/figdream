"use client";

import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Shield } from "lucide-react";
import type { Database } from "@/types/database.types";

type Profile = Database['public']['Views']['profiles']['Row'];

// Extended type for UI display with role and status
interface UserWithRole extends Profile {
  email?: string; // Add email field for display
  role?: string;
  status?: "active" | "inactive" | "suspended";
}

interface UsersListProps {
  searchQuery?: string;
  role?: "admin" | "owner";
}

export function UsersList({
  searchQuery = "",
  role = "admin",
}: UsersListProps) {
  const [users] = useState<UserWithRole[]>([]);

  const filteredUsers = users.filter(
    (user) =>
      (user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "suspended":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getRoleVariant = (userRole: string) => {
    switch (userRole) {
      case "admin":
        return "destructive";
      case "owner":
        return "default";
      case "manager":
        return "secondary";
      case "staff":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          {role === "admin" && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{(user.full_name || user.display_name || "?").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.full_name || user.display_name || "Unknown"}</span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={getRoleVariant(user.role || "user")}>{user.role || "user"}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(user.status || "active")}>
                  {user.status || "active"}
                </Badge>
              </TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              {role === "admin" && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={role === "admin" ? 6 : 5}
              className="text-center"
            >
              No users found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
