"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Users,
  Settings,
  Database,
  FileText,
  Lock,
  Unlock,
  Edit,
  Plus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { RoleWithPermissions, Permission } from "../dal/users-types";

// Predefined system roles
const systemRoles: RoleWithPermissions[] = [
  {
    id: "super_admin",
    name: "super_admin",
    display_name: "Super Admin",
    description: "Full system access with all permissions",
    permissions: [
      { resource: "all", actions: ["create", "read", "update", "delete"] },
    ],
    hierarchy_level: 1,
    is_system: true,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "admin",
    name: "admin",
    display_name: "Admin",
    description: "Platform administration access",
    permissions: [
      { resource: "users", actions: ["create", "read", "update", "delete"] },
      { resource: "salons", actions: ["create", "read", "update", "delete"] },
      { resource: "settings", actions: ["read", "update"] },
      { resource: "reports", actions: ["read", "create"] },
    ],
    hierarchy_level: 2,
    is_system: true,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "owner",
    name: "owner",
    display_name: "Salon Owner",
    description: "Complete salon management access",
    permissions: [
      { resource: "salon", actions: ["read", "update"] },
      { resource: "staff", actions: ["create", "read", "update", "delete"] },
      { resource: "services", actions: ["create", "read", "update", "delete"] },
      { resource: "appointments", actions: ["create", "read", "update", "delete"] },
      { resource: "customers", actions: ["read", "update"] },
      { resource: "reports", actions: ["read"] },
    ],
    hierarchy_level: 3,
    is_system: true,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "manager",
    name: "manager",
    display_name: "Manager",
    description: "Salon operational management",
    permissions: [
      { resource: "staff", actions: ["read", "update"] },
      { resource: "services", actions: ["read", "update"] },
      { resource: "appointments", actions: ["create", "read", "update"] },
      { resource: "customers", actions: ["read"] },
    ],
    hierarchy_level: 4,
    is_system: true,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "receptionist",
    name: "receptionist",
    display_name: "Receptionist",
    description: "Front desk operations",
    permissions: [
      { resource: "appointments", actions: ["create", "read", "update"] },
      { resource: "customers", actions: ["read", "create"] },
      { resource: "services", actions: ["read"] },
    ],
    hierarchy_level: 5,
    is_system: true,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "staff",
    name: "staff",
    display_name: "Staff",
    description: "Service provider access",
    permissions: [
      { resource: "appointments", actions: ["read", "update"] },
      { resource: "profile", actions: ["read", "update"] },
      { resource: "schedule", actions: ["read", "update"] },
    ],
    hierarchy_level: 6,
    is_system: true,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "customer",
    name: "customer",
    display_name: "Customer",
    description: "Basic customer access",
    permissions: [
      { resource: "appointments", actions: ["create", "read", "update"] },
      { resource: "profile", actions: ["read", "update"] },
    ],
    hierarchy_level: 7,
    is_system: true,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Resource definitions
const resources = [
  { name: "users", label: "Users", icon: Users },
  { name: "salons", label: "Salons", icon: Settings },
  { name: "staff", label: "Staff", icon: Users },
  { name: "services", label: "Services", icon: FileText },
  { name: "appointments", label: "Appointments", icon: Database },
  { name: "customers", label: "Customers", icon: Users },
  { name: "reports", label: "Reports", icon: FileText },
  { name: "settings", label: "Settings", icon: Settings },
  { name: "profile", label: "Profile", icon: Users },
  { name: "schedule", label: "Schedule", icon: Database },
];

const actions = ["create", "read", "update", "delete"];

interface RoleManagerProps {
  customRoles?: RoleWithPermissions[];
  canCreateRoles?: boolean;
  canEditRoles?: boolean;
}

export function RoleManager({
  customRoles = [],
  canCreateRoles = false,
  canEditRoles = false,
}: RoleManagerProps) {
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(
    systemRoles[0]
  );
  const [expandedRoles, setExpandedRoles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const allRoles = [...systemRoles, ...customRoles];

  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const hasPermission = (role: RoleWithPermissions, resource: string, action: string) => {
    // Check if role has "all" permissions
    const allPermission = role.permissions.find((p) => p.resource === "all");
    if (allPermission && allPermission.actions.includes(action)) return true;

    // Check specific resource permission
    const permission = role.permissions.find((p) => p.resource === resource);
    return permission ? permission.actions.includes(action) : false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>
                Configure roles and permissions for platform access control
              </CardDescription>
            </div>
            {canCreateRoles && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Role
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Role List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Available Roles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {allRoles.map((role) => (
                <Collapsible key={role.id} open={expandedRoles.includes(role.id)}>
                  <CollapsibleTrigger
                    className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    onClick={() => toggleRoleExpansion(role.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div className="text-left">
                        <div className="font-medium">{role.display_name}</div>
                        <div className="text-xs text-muted-foreground">
                          Level {role.hierarchy_level}
                        </div>
                      </div>
                    </div>
                    {expandedRoles.includes(role.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      {role.description}
                    </p>
                    <div className="flex gap-2">
                      {role.is_system && (
                        <Badge variant="secondary" className="text-xs">
                          System
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {role.permissions.length} permissions
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => setSelectedRole(role)}
                    >
                      View Details
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {selectedRole ? selectedRole.display_name : "Select a Role"}
            </CardTitle>
            {selectedRole && (
              <CardDescription>{selectedRole.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedRole ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions Matrix</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                      <div>
                        <div className="text-sm text-muted-foreground">Role Name</div>
                        <div className="font-medium">{selectedRole.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Hierarchy Level</div>
                        <div className="font-medium">{selectedRole.hierarchy_level}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Type</div>
                        <div className="font-medium">
                          {selectedRole.is_system ? "System Role" : "Custom Role"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Granted Permissions</h4>
                      <div className="space-y-2">
                        {selectedRole.permissions.map((perm, i) => (
                          <div key={i} className="flex items-center gap-2 p-3 border rounded-lg">
                            {perm.resource === "all" ? (
                              <Unlock className="h-4 w-4 text-green-500" />
                            ) : (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium capitalize">{perm.resource}</span>
                            <span className="text-sm text-muted-foreground ml-auto">
                              {perm.actions.join(", ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedRole.parent_role && (
                      <Alert>
                        <AlertDescription>
                          This role inherits permissions from:{" "}
                          <span className="font-medium">{selectedRole.parent_role}</span>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </TabsContent>

                {/* Permissions Matrix Tab */}
                <TabsContent value="permissions" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Resource</TableHead>
                          <TableHead className="text-center">Create</TableHead>
                          <TableHead className="text-center">Read</TableHead>
                          <TableHead className="text-center">Update</TableHead>
                          <TableHead className="text-center">Delete</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resources.map((resource) => (
                          <TableRow key={resource.name}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <resource.icon className="h-4 w-4 text-muted-foreground" />
                                {resource.label}
                              </div>
                            </TableCell>
                            {actions.map((action) => (
                              <TableCell key={action} className="text-center">
                                {canEditRoles && !selectedRole.is_system ? (
                                  <Checkbox
                                    checked={hasPermission(selectedRole, resource.name, action)}
                                    disabled={hasPermission(selectedRole, "all", action)}
                                  />
                                ) : (
                                  <div className="flex justify-center">
                                    {hasPermission(selectedRole, resource.name, action) ? (
                                      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                      </div>
                                    ) : (
                                      <div className="h-5 w-5 rounded-full bg-gray-200" />
                                    )}
                                  </div>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {canEditRoles && !selectedRole.is_system && (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Reset</Button>
                      <Button>Save Permissions</Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Select a role to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role Hierarchy Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Role Hierarchy</CardTitle>
          <CardDescription>
            Visual representation of role inheritance and hierarchy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allRoles
              .sort((a, b) => a.hierarchy_level - b.hierarchy_level)
              .map((role, index) => (
                <div
                  key={role.id}
                  className={cn("flex items-center gap-3", role.hierarchy_level > 1 && "pl-6", role.hierarchy_level > 2 && "pl-12", role.hierarchy_level > 3 && "pl-18", role.hierarchy_level > 4 && "pl-24", role.hierarchy_level > 5 && "pl-30", role.hierarchy_level > 6 && "pl-36")}
                >
                  {index > 0 && (
                    <div className="w-px h-6 bg-border -ml-3" />
                  )}
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md flex-1">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">{role.display_name}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      Level {role.hierarchy_level}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}